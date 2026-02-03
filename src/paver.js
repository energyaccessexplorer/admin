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

	const cat = await API.get('categories', {
		"id":     `eq.${$.category_id}`,
		"select": ["raster"],
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

	if (and([
		'lines',
		'polygons',
		'polygons-timeline',
	].includes($.type)))
		payload.simplify = maybe(cat, 'vectors', 'paver', 'simplify') || 0;

	if (maybe(cat, 'raster', 'paver'))
		payload.config = cat.raster.paver;

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

			if (!infopre) {
				console.error(msg);
				return;
			}

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
	if (paver_modal)
		bind(paver_modal.content, { "outline": true });

	return function() {
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
		});

		paver_modal.content.querySelector('form select[name=attr]').value = maybe($, 'vectors_configuration', 'vectors_id');
	}

	return function() {
		payload.attr = paver_modal.content.querySelector('form input[name=attr]').value;

		return submit('admin-boundaries', $.id, payload, { paver_modal })
			.then(r => r ? ds_patch($.id, r) : null);
	};
};

async function clip_proximity($, payload, { paver_modal }) {
	let f;
	if (f = maybe($, 'vectors_configuration', 'vectors_id'))
		payload.fields = payload.fields.push('vectors_id');

	if (f = maybe($, 'vectors_configuration', 'attributes_map'))
		payload.fields = payload.fields.concat(f.map(x => x['dataset']));

	if (f = maybe($, 'vectors_configuration', 'features_specs'))
		payload.fields = payload.fields.concat(f.map(x => x['key']));

	if (f = maybe($, 'vectors_configuration', 'properties_search'))
		payload.fields = payload.fields.concat(f);

	payload.fields = Array.from(new Set(payload.fields)).sort();

	if (paver_modal) {
		bind(paver_modal.content, { "points": $.type.match(/points/) });

		paver_modal.content.querySelector('form').append(select_attributes($, payload));
	}

	return function() {
		payload.dissolve = paver_modal.content.querySelector('form input[name=dissolve]').checked;

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
		paver_modal.content.querySelector('form').append(select_attributes($, payload));
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
		});

		const input = paver_modal.content.querySelector('form select[name=attr]');
		input.value = payload.attr;

		if (payload.attr)
			input.removeAttribute('disabled');
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

async function subgeography(r, { results, cid, vectors, csv, obj, resolution }) {
	const g = new dt.object({
		"module": dt.modules['geographies'],
		"data":   {
			"name":       r[csv.value],
			"parent_id":  obj.id,
			"adm":        obj.adm + 1,
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
		"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${results[r[csv.id]]}`,
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

	d.patch({
		"deployment":      ['protected'],
		"processed_files": [],
		source_files,
	});

	g.patch({
		"configuration": {
			"divisions": [{
				"name":       "Outline",
				"dataset_id": did,
			}],
		},
	});

	return d.fetch()
		.then(_ => routine(d, {}))
		.then(e => e());
};

export async function subgeographies(obj, { vectors, csv }) {
	const payload = {
		"dataseturl": vectors.endpoint,
		"attr":       vectors.id,
	};

	const table = await fetch(csv.endpoint).then(r => r.text()).then(r => csvParse(r));
	const shapes = await fetch(vectors.endpoint).then(r => r.json());
	const cid = (await API.get('categories', { "name": "eq.outline", 'select': ['id'] }, { "one": true }))['id'];

	if (table.length !== shapes.features.length)
		throw new Error("different lengths. ciao.");

	for (const r of table) {
		if (!shapes.features.find(f => +f.properties[vectors.id] === +r[csv.id]))
			throw new Error(`vectors_id ${vectors.id} and csv_id ${csv.id} don't corelate`);
	}

	const paver_modal = new modal({
		"content": await remote_tmpl("geographies/paver-subgeographies.html"),
	});

	const c = paver_modal.content;
	const f = c.querySelector('form');

	paver_modal.show();

	f.onsubmit = e => {
		e.preventDefault();

		submit('subgeographies', obj.id, payload, { paver_modal })
			.then(async results => {
				const resolution = paver_modal.content.querySelector('form input[name=resolution]').value;

				for (const r of table)
					await subgeography(r, { obj, results, csv, cid, vectors, resolution });
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
