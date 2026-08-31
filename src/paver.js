/*eslint no-fallthrough: ["error", { "commentPattern": "break[\\s\\w]*omitted" }]*/

import {
	csvParse,
} from '../lib/ds-dsv.js';

import {
	listen as socket_listen,
} from './socket.js';

import {
	and,
	ce,
	maybe,
	qs,
	remote_tmpl,
	uuid,
} from '../lib/helpers.js';

import bind from '../lib/bind.js';

import modal from '../lib/modal.js';

import * as datasets_module from './datasets.js';

const FLASH = dt.FLASH;
const API = dt.API;

export function server_check() {
	return fetch(`${dt.config.paver_endpoint}/check`, {
		"method":  'OPTIONS',
		"headers": {
			"Authorization": `Bearer ${localStorage.getItem('token')}`,
		},
	}).then(r => {
		if (!r.ok) {
			FLASH.push({
				"title":   "Could not connect to Paver",
				"type":    "error",
				"message": `Status code ${r.status}`,
				"timeout": 0,
			});
		}

		return r.ok;
	});
};

function select_attributes($, payload) {
	const arr = $._available_properties.map(a => {
		const o = ce('option', a, { "value": a });
		if (payload.fields.includes(a)) o.setAttribute('selected', '');

		return o;
	});

	const s = ce('select', arr, { "multiple": "", "name": "fields" });

	s.style = `
width: 200px;
height: 10rem;
`;

	s.onchange = _ => payload.fields = Array.from(s.selectedOptions).map(o => o.value);

	return ce('div', s, { "class": "input-group" });
};

async function payload_fill($, payload, datasets_func) {
	payload.dataseturl = maybe($.source_files.find(x => x.func === datasets_func), 'endpoint');

	if (!payload.dataseturl) {
		alert(`Could not get endpoint for the ${datasets_func} source file. Check that...`);
		return false;
	}

	const r = await API.get('geographies', {
		"id":     `eq.${payload.geographyid}`,
		"select": ["id", "name", "configuration", "resolution"],
	}, { "one": true });

	const rid = maybe(r, 'configuration', 'divisions', 0, 'dataset_id');

	if (!rid) {
		alert(`MISSING: ${r.name} -> configuration -> divisions -> 0 -> dataset_id`);
		return false;
	}

	const refs = await API.get(
		'datasets',
		{
			"id":     `eq.${rid}`,
			"select": ["processed_files"],
		},
		{ "one": true });

	payload.referenceurl = maybe(refs.processed_files.find(x => x.func === 'vectors'), 'endpoint');
	payload.baseurl = maybe(refs.processed_files.find(x => x.func === 'raster'), 'endpoint');

	const cat = $.category = await API.get('categories', {
		"id":     `eq.${$.category_id}`,
		"select": [
			"raster",
			"vectors",
		],
	}, { "one": true });

	if (and($.type.match('raster'), !maybe(cat, 'raster', 'paver'))) {
		const msg = `'${$.category_name}' category raster->paver configuration is not setup!`;

		FLASH.push({
			"type":    'error',
			"title":   "Configuration error",
			"message": msg,
		});

		console.error(msg);

		return false;
	}

	payload.config = maybe(cat, 'raster', 'paver');

	payload.resolution = r.resolution;

	return true;
};

export async function routine(obj, { edit_modal, pre }) {
	if (!await server_check()) return;

	const data = obj.data;

	const payload = {
		"geographyid":  data.geography_id,
		"datasetid":    data.id,
		"dataseturl":   undefined,
		"referenceurl": undefined,
		"baseurl":      undefined,
		"attr":         undefined,
		"fields":       [],
		"lnglat":       [],
		"config":       undefined,
		"resolution":   undefined,
		"simplify":     undefined,
		"s3bucket":     undefined,
	};

	// const tree = await API.get('geographies_tree_up', { "id": `eq.${data.geography_id}` }, { "one": true });
	//
	// let root = {};
	// if (maybe(tree, 'path', 0))
	// 	root = await API.get('geographies', { "id": `eq.${tree['path'][0]}`, "select": ["name"] }, { "one": true });
	//
	// switch (root['name']) {
	// case 'India':
	// 	payload["s3bucket"] = "india";
	// 	break;
	//
	// default:
	// 	payload["s3bucket"] = "world";
	// 	break;
	// }
	//
	payload["s3bucket"] = "world";

	let fn;
	let datasets_func;
	let template;
	let header;

	switch (data.type) {
	case 'points':
		if (data.source_files.find(f => f.func === 'csv')) {
			fn = csv_points;
			datasets_func = 'csv';
			template = 'datasets/paver-csv-points.html';
			header = "CSV -> points";

			break;
		}
		//
		// break omitted, go to lines/polygons.

	case 'lines':
	case 'polygons': {
		fn = clip_proximity;
		datasets_func = 'vectors';
		template = 'datasets/paver-clip-proximity.html';
		header = "Clip Proximity";
		break;
	}

	case 'polygons-timeline': {
		fn = simplify;
		datasets_func = 'vectors';
		template = 'datasets/paver-simplify.html';
		header = "Simplify";
		break;
	}

	case 'polygons-boundaries': {
		datasets_func = 'vectors';
		template = 'datasets/paver-boundaries.html';

		if (data.category_name === 'boundaries') {
			header = "Admin Boundaries";
			fn = admin_boundaries;
		}
		else if (data.category_name === 'outline') {
			header = "Outline";
			fn = outline;
		}
		break;
	}

	case 'raster-valued': {
		datasets_func = 'raster';
		template = 'datasets/paver-crop-raster.html';
		fn = crop_raster;
		header = "Crop Raster";
		break;
	}

	case 'raster': {
		if (data.source_files.find(f => f.func === 'csv')) {
			fn = csv_raster;
			datasets_func = 'csv';
			template = 'datasets/paver-csv-raster.html';
			header = "CSV -> raster";

			break;
		}

		datasets_func = 'raster';
		template = 'datasets/paver-crop-raster.html';
		fn = crop_raster;
		header = "Crop Raster";
		break;
	}

	default:
		break;
	}

	// A type that matched no case above (e.g. mutant types slipping through)
	// must not crash at fn.name/fn(...) below — report it as an error object
	// like any other routine failure.
	if (!fn) {
		const msg = `No paver routine for dataset type '${data.type}'.`;

		console.error(msg, data);

		return {
			"error":   msg,
			"routine": null,
			payload,
		};
	}

	await obj.fetch();

	const ok = await payload_fill(data, payload, datasets_func);

	if (!ok) {
		flag(data.id);

		return {
			"error":   "Failed. Looks like a configuration error.",
			"routine": fn.name,
			payload,
		};
	}

	if (!edit_modal)
		return (await fn(data, payload, { pre }));

	const formid = "form-" + uuid();
	const paver_modal = new modal({
		header,
		"content": await remote_tmpl(template),
		"footer":  await remote_tmpl('datasets/paver-footer.html'),
	});

	paver_modal.content.querySelector('form').setAttribute('id', formid);
	paver_modal.footer.querySelector('button').setAttribute('form', formid);

	const c = paver_modal.content;
	const f = c.querySelector('form');
	const p = ce('pre', null, { "id": "infopre" });
	const b = qs('[type="submit"]', paver_modal.footer);

	paver_modal.footer.append(p);

	const go = await fn(data, payload, { paver_modal });

	f.onsubmit = async function(e) {
		e.preventDefault();

		p.innerText = "";
		b.innerText = "Paving...";
		b.setAttribute('disabled', '');

		await go()
			.then(r => r ? ds_patch(data.id, r) : null)
			.then(r => {
				const form = qs('form', edit_modal.content);

				const changes = [];

				for (const k in r) {
					const d = typeof data[k];

					switch (d) {
					case 'object': {
						if (JSON.stringify(data[k]) !== JSON.stringify(r[k]))
							changes.push(k);
						break;
					}

					default: {
						if (data[k] !== r[k])
							changes.push(k);
						break;
					}
					}
				}

				obj.fetch()
					.then(_ => dt.edit_update(form, changes, obj));
			})
			.then(async _ => {
				const tree = await API.get('geographies_tree_down', { "id": `eq.${data.geography_id}` });

				if (tree.length <= 1) return;

				if (!confirm(`Inherit to ${tree.length - 1} subgeographies?`)) return;

				let count = 0;
				for await (const b of tree) {
					const path = b['path'];
					if (path.length === 1) continue;

					const leaf = path[path.length - 1];

					const g = await API.get('geographies', {
						"id":     `eq.${leaf}`,
						"select": ["id", "name", "configuration", "resolution"],
					}, { "one": true });

					const rid = maybe(g, 'configuration', 'divisions', 0, 'dataset_id');

					if (!rid) {
						alert(`MISSING: ${g.name} -> configuration -> divisions -> 0 -> dataset_id`);
						continue;
					}

					const refs = await API.get(
						'datasets',
						{
							"id":     `eq.${rid}`,
							"select": ["processed_files"],
						},
						{ "one": true },
					);

					payload.referenceurl = maybe(refs.processed_files.find(x => x.func === 'vectors'), 'endpoint');
					payload.baseurl = maybe(refs.processed_files.find(x => x.func === 'raster'), 'endpoint');

					const opts = {
						"geography_id": `eq.${g.id}`,
						"category_id":  `eq.${data.category_id}`,
						"flagged":      "is.false",
					};

					if (data.name === null) {
						opts['name'] = "is.null";
					} else {
						opts['name'] = `eq.${data.name}`;
					}

					let ds = await API.get('datasets', opts);

					count += 1;
					document.querySelector('#infopre').innerText = `Pavering ${g.name} (${count}/${tree.length - 1})\n\n`;

					if (ds.length === 0) {
						const o = new dt.object({
							"module": dt.modules['datasets'],
							"data":   data,
						});

						ds = (await o.clone({ "geography_id": leaf }))['data'];
					} else if (ds.length > 1) {
						console.warn("Cannot choose. NEXT!");
						continue;
					}

					const p = Object.assign(ds, payload, { "geographyid": leaf });

					const f = (await fn(g, p, { paver_modal }));
					await f();
				}
			});

		b.removeAttribute('disabled');
		b.innerText = "Pave it!";
	};

	paver_modal.show();
};

function flag(id) {
	API.patch(
		'datasets',
		{ "id": `eq.${id}` },
		{ "payload": { "flagged": true } },
	);
};

async function submit(routine, dataset_id, payload, { paver_modal, pre }) {
	const infopre = pre || (paver_modal?.footer || document).querySelector('#infopre');

	const socket_id = uuid();

	await socket_listen(socket_id, m => infopre ? infopre.innerText += "\n" + m : console.log(m));

	return fetch(`${dt.config.paver_endpoint}/routines?routine=${routine}&socket_id=${socket_id}`, {
		"method":  'POST',
		"headers": {
			"Content-Type":  'application/json',
			"Authorization": `Bearer ${localStorage.getItem('token')}`,
		},
		"body": JSON.stringify(payload),
	}).then(async r => {
		if (!r.ok) {
			const msg = await r.text();

			if (!infopre)
				console.error(msg);
			else
				infopre.innerText += `

${r.status} - ${r.statusText}

${msg}`;

			return {
				"error": msg,
				routine,
				payload,
			};
		}

		return await r.json();
	}).then(r => {
		if (r.error) {
			flag(dataset_id);

			FLASH.push({
				"type":    'error',
				"title":   `${routine} failed`,
				"message": "Inspect the error messages",
			});

			return null;
		}

		return r;
	});
};

async function outline($, payload, { paver_modal }) {
	if (paver_modal) {
		bind(paver_modal.content, {
			"_available_properties": $._available_properties.map(v => ({ v })),
		});
	}

	return function() {
		// no modal in the headless subgeographies flow
		payload.attr = paver_modal
			? paver_modal.content.querySelector('form [name=attr]').value
			: maybe($, 'vectors_configuration', 'vectors_id');

		return submit('admin-boundaries', $.id, payload, { paver_modal })
			.then(r => {
				if (!r) return null;

				const {Left, Bottom, Right, Top} = r.info.bounds;

				API.patch('geographies', { "id": `eq.${$.geography_id}` }, {
					"payload": {
						"envelope": [Left, Bottom, Right, Top],
					},
				});

				return r;
			});
	};
};

async function admin_boundaries($, payload, { paver_modal }) {
	if (paver_modal) {
		bind(paver_modal.content, {
			"_available_properties": $._available_properties.map(v => ({ v })),
			"attr":                  maybe($, 'vectors_configuration', 'vectors_id'),
		});
	}

	return function() {
		payload.attr = paver_modal.content.querySelector('form [name=attr]').value;

		return submit('admin-boundaries', $.id, payload, { paver_modal });
	};
};

async function clip_proximity($, payload, { paver_modal }) {
	let f;
	if (f = maybe($, 'vectors_configuration', 'vectors_id'))
		payload.fields.push('vectors_id');

	if (f = maybe($, 'vectors_configuration', 'attributes_map'))
		payload.fields = payload.fields.concat(f.map(x => x['dataset']));

	if (f = maybe($, 'vectors_configuration', 'features_specs'))
		payload.fields = payload.fields.concat(f.map(x => x['key']));

	if (f = maybe($, 'vectors_configuration', 'properties_search'))
		payload.fields = payload.fields.concat(f);

	payload.fields = Array.from(new Set(payload.fields)).sort();

	const points = $.type.match(/points/);
	const simplify_default = maybe($.category, 'vectors', 'paver', 'simplify') || 0;

	if (paver_modal) {
		bind(paver_modal.content, {
			"points":     points,
			"simplify":   simplify_default,
			"selectable": select_attributes($, payload),
		});
	}

	return function() {
		// no modal in the headless clip_datasets flow
		payload.dissolve = points ? false : paver_modal ? paver_modal.content.querySelector('form input[name=dissolve]').checked : false;
		payload.simplify = points ?   0   : paver_modal ? +paver_modal.content.querySelector('form input[name=simplify]').value : simplify_default;

		return submit('clip-proximity', $.id, payload, { paver_modal });
	};
};

async function csv_points($, payload, { paver_modal }) {
	let f;
	if (f = maybe($, 'vectors_configuration', 'attributes_map'))
		payload.fields = payload.fields.concat(f.map(x => x['dataset']));

	if (f = maybe($, 'vectors_configuration', 'features_specs'))
		payload.fields = payload.fields.concat(f.map(x => x['key']));

	if (f = maybe($, 'vectors_configuration', 'properties_search'))
		payload.fields = payload.fields.concat(f);

	payload.fields = Array.from(new Set(payload.fields)).sort();

	if (paver_modal) {
		bind(paver_modal.content, {
			"selectable": select_attributes($, payload),
		});
	}

	return function() {
		payload.lnglat = paver_modal.content.querySelector('form input[name=lnglat]').value;

		for (const p of payload.lnglat.split(',')) {
			if ($._available_properties.indexOf(p) < 0) {
				FLASH.push({
					"type":    'error',
					"title":   "Incorrect long/lat Selection",
					"message": `Attribute '${p}' does not exist.`,
				});

				qs('[type="submit"]', paver_modal.footer).removeAttribute('disabled');

				throw new Error(`Attribute '${p}' does not exist`);
			}
		}

		for (const p of payload.fields.split(',').filter(t => t !== "")) {
			if ($._available_properties.indexOf(p) < 0) {
				FLASH.push({
					"type":    'error',
					"title":   "Incorrect Fields Selection",
					"message": `Attribute '${p}' does not exist.`,
				});

				qs('[type="submit"]', paver_modal.footer).removeAttribute('disabled');

				throw new Error("Attribute '${p}' does not exist");
			}
		}

		return submit('csv-points', $.id, payload, { paver_modal });
	};
};

async function csv_raster($, payload, { paver_modal }) {
	if (paver_modal) {
		bind(paver_modal.content, {
			"_available_properties": $._available_properties.map(v => ({ v })),
			"attr":                  payload.attr,
		});
	}

	return function() {
		payload.lnglat = paver_modal.content.querySelector('form input[name=lnglat]').value;
		payload.attr = paver_modal.content.querySelector('form input[name=attr]').value;

		for (const p of payload.lnglat.split(',')) {
			if ($._available_properties.indexOf(p) < 0) {
				FLASH.push({
					"type":    'error',
					"title":   "Incorrect long/lat Selection",
					"message": `Attribute '${p}' does not exist.`,
				});

				qs('[type="submit"]', paver_modal.footer).removeAttribute('disabled');

				throw new Error("Attribute '${p}' does not exist");
			}
		}

		return submit('csv-raster', $.id, payload, { paver_modal });
	};
};

async function crop_raster($, payload, { paver_modal }) {
	return function() {
		return submit('crop-raster', $.id, payload, { paver_modal });
	};
};

async function simplify($, payload, { paver_modal }) {
	return function() {
		payload.attr = maybe($, 'vectors_configuration', 'vectors_id');

		return submit('simplify', $.id, payload, { paver_modal });
	};
};

async function subgeography(r, { results, cid, vectors, csv, obj, resolution, level }) {
	const output = results[r[csv.id]];
	if (!output) throw new Error(`no paver output for ${r[csv.column]}`);

	const g = new dt.object({
		"module": dt.modules['geographies'],
		"data":   {
			"name":       r[csv.column],
			"parent_id":  obj.id,
			"adm":        obj.adm + level,
			"resolution": parseInt(resolution),
			"circle":     obj.circle,
			"deployment": ['protected'],
		},
	});

	let gid, did;
	await g.create().then(r => gid = r.id);

	if (!gid) throw new Error(`BU ${gid}`);

	const source_files = [{
		"func":     "vectors",
		"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${output}`,
	}];

	const d = new dt.object({
		"module": datasets_module,
		"data":   {
			"category_id":           cid,
			"geography_id":          gid,
			"vectors_configuration": {
				"vectors_id": vectors.id,
			},
			source_files,
		},
	});
	await d.create().then(r => did = r.id);

	// patch()'s validators read data.category, which create() doesn't return
	await d.fetch();

	d.patch({
		"deployment":      ['protected'],
		"processed_files": [],
		source_files,
	});

	await g.patch({
		"configuration": {
			"divisions": [{
				"name":       "Outline",
				"dataset_id": did,
			}],
		},
	});

	await d.fetch()
		.then(_ => routine(d, {}))
		.then(e => e())
		.then(r => r ? ds_patch(did, r) : null);

	const errors = await clip_datasets(obj.id, gid);

	return { gid, errors };
};

// Clones every non-boundary/non-indicator dataset from `parent_id` into
// `geography_id` and re-runs it through the appropriate paver routine, so a
// newly created (sub-)geography automatically gets clipped versions of
// every layer available on its parent. Headless (no edit_modal/paver_modal),
// same as subgeography()'s own outline pave above. CSV-sourced datasets are
// skipped: their lng/lat and value columns are only ever entered by hand in
// the paver modal and are never persisted on the dataset, so there is
// nothing to re-derive them from outside that form.
export async function clip_datasets(parent_id, geography_id, { pre } = {}) {
	// Whitelist pavable types instead of blacklisting: mutant types
	// (raster-mutant, raster-valued-mutant, ...) have no routine and would
	// crash the whole loop below.
	const datasets = await API.get('datasets', {
		"select":        "*,category_name",
		"geography_id":  'eq.' + parent_id,
		"category_name": 'not.in.(indicator,timeline-indicator,boundaries,admin-tiers,outline)',
		"type":          'in.(points,lines,polygons,polygons-timeline,raster,raster-valued)',
	});

	const errors = [];

	for (const d of datasets) {
		// One bad dataset must not abort the clipping of all the others.
		try {
			if (!(d.source_files || []).length) {
				errors.push({
					"data":    d,
					"routine": null,
					"error":   "No source files to clip from, skipped.",
				});
				continue;
			}

			if (d.source_files.find(f => f.func === 'csv')) {
				errors.push({
					"data":    d,
					"routine": null,
					"error":   "CSV-sourced dataset: column mapping must be redone by hand, skipped.",
				});
				continue;
			}

			const o = new dt.object({
				"module": datasets_module,
				"data":   d,
			});

			const n = await o.clone({
				"deployment":      ['protected'],
				"processed_files": [],
				"geography_id":    geography_id,
				"source_files":    d.source_files,
				"name":            d.name,
			});

			await n.fetch();

			const t = await routine(n, { pre });

			if (typeof t !== 'function') {
				errors.push(Object.assign({}, t, { "data": n.data }));
				continue;
			}

			const x = await t();

			if (!x) {
				errors.push({ "data": n.data, "error": "Routine failed, see FLASH/console." });
				continue;
			}

			await ds_patch(n.data.id, x);
		} catch (err) {
			console.error(err);
			errors.push({ "data": d, "error": err.message });
		}
	}

	return errors;
};

async function load_division(division) {
	const ds = await API.get('datasets', { "id": 'eq.' + division.dataset_id }, { "one": true });

	const csv = {
		"column":   maybe(ds, 'vectors_configuration', 'csv_column'),
		"endpoint": ds.source_files.find(f => f.func === 'csv').endpoint,
	};

	const vectors = {
		"id":       maybe(ds, 'vectors_configuration', 'vectors_id'),
		"endpoint": ds.source_files.find(f => f.func === 'vectors').endpoint,
	};

	const table = await fetch(csv.endpoint).then(r => r.text()).then(r => csvParse(r));
	csv.id = table.columns.includes(vectors.id) ? vectors.id : table.columns[0];

	const shapes = await fetch(vectors.endpoint).then(r => r.json());

	for (const r of table) {
		if (!shapes.features.find(f => +f.properties[vectors.id] === +r[csv.id]))
			throw new Error(`vectors_id ${vectors.id} and csv_id ${csv.id} don't corelate`);
	}

	return { csv, vectors, table };
};

export async function subgeographies(obj, { divisions }) {
	const cid = (await API.get('categories', { "name": "eq.outline", 'select': ['id'] }, { "one": true }))['id'];

	const paver_modal = new modal({
		"content": await remote_tmpl("geographies/paver-subgeographies.html"),
	});

	const c = paver_modal.content;
	const f = c.querySelector('form');

	const level_select = qs('[name=admlevel]', f);
	const names_select = qs('[name=subgeography_names]', f);

	qs('[name=multiselect_hint]', f).textContent = navigator.platform.startsWith('Mac')
		? "⌘-click to toggle areas, ⇧-click to select a range"
		: "Ctrl-click to toggle areas, Shift-click to select a range";

	level_select.append(...divisions.map(d => ce('option', d.name, { "value": d.level })));

	let current = null;
	let previous = [];

	async function select_level() {
		current = null;
		previous = [];
		names_select.replaceChildren();

		const division = divisions.find(d => d.level === +level_select.value);
		if (!division) return;

		let loaded;
		try {
			loaded = await load_division(division);
		} catch (err) {
			console.error(err);

			FLASH.push({
				"type":    'error',
				"title":   `Could not load division '${division.name}'`,
				"message": err.message,
			});

			return;
		}

		current = Object.assign({ "level": division.level }, loaded);

		names_select.append(
			ce('option', "All", { "value": "" }),
			...loaded.table.map(row => ce('option', row[loaded.csv.column], { "value": row[loaded.csv.id] })),
		);

		names_select.options[0].selected = true;
		previous = [names_select.options[0]];
	};

	// "All" is exclusive: picking it clears the rest and vice versa
	names_select.onchange = () => {
		const all = names_select.options[0];
		const selected = [...names_select.selectedOptions];

		if (selected.includes(all) && !previous.includes(all))
			[...names_select.options].forEach(o => o.selected = o === all);
		else if (selected.length > 1)
			all.selected = false;

		previous = [...names_select.selectedOptions];
	};

	level_select.onchange = select_level;
	await select_level();

	paver_modal.show();

	f.onsubmit = e => {
		e.preventDefault();

		if (!current) return;

		const { level, csv, vectors, table } = current;

		const payload = {
			"dataseturl": vectors.endpoint,
			"attr":       vectors.id,
			"s3bucket":   "world",
		};
		// TODO: fetch the proper s3bucket above...

		const resolution = qs('[name=resolution]', f).value;
		const selected = [...names_select.selectedOptions].map(o => o.value).filter(v => v !== "");
		const rows = selected.length ? table.filter(row => selected.includes(row[csv.id])) : table;

		submit('subgeographies', obj.id, payload, { paver_modal })
			.then(async results => {
				if (!results) return;

				const failed = [];
				const clip_failed = [];

				for (const row of rows) {
					try {
						const { errors } = await subgeography(row, { obj, results, csv, cid, vectors, resolution, level });

						if (errors.length) {
							console.error(`clip errors for ${row[csv.column]}`, errors);
							clip_failed.push(`${row[csv.column]}: ` + errors.map(e => `${maybe(e, 'data', 'category_name') || 'dataset'} — ${e.error}`).join('; '));
						}
					} catch (err) {
						console.error(err);
						failed.push(row[csv.column]);
					}
				}

				const infopre = c.querySelector('#infopre');
				if (infopre) infopre.innerText += "\n\nDone.";

				if (failed.length)
					FLASH.push({
						"type":    'error',
						"title":   "Could not create some subgeographies",
						"message": failed.join(', '),
					});

				if (clip_failed.length)
					FLASH.push({
						"type":    'error',
						"title":   "Some layers were not auto-clipped",
						"message": clip_failed.join(', '),
					});
			})
			.catch(err => {
				console.error(err);

				FLASH.push({
					"type":    'error',
					"title":   "Could not create subgeographies",
					"message": err.message,
				});
			});
	};
};

function ds_patch(id, results) {
	const processed_files = ['vectors', 'raster', 'csv']
		.filter(e => results[e])
		.map(e => ({
			"func":     e,
			"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${results[e]}`,
		}));

	return API.patch('datasets', { "id": `eq.${id}` }, { "payload": { processed_files }, "one": true });
};
