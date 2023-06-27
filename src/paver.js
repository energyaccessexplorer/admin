/*eslint no-fallthrough: ["error", { "commentPattern": "break[\\s\\w]*omitted" }]*/

import {
	csvParse,
} from '../lib/ds-dsv.js';

import modal from '../lib/modal.js';

import {
	listen as socket_listen,
} from './socket.js';

import * as datasets_module from './datasets.js';

const FLASH = dt.FLASH;
const API = dt.API;

async function pavercheck() {
	fetch(`${dt.config.paver_endpoint}/routines`, {
		"method":  'OPTIONS',
		"headers": {
			"Authorization": `Bearer ${localStorage.getItem('token')}`,
		},
	}).then(r => {
		if (!r.ok) {
			const msg = "Paver is not running... :(";
			FLASH.push({ "title": msg });
			throw new Error(msg);
		}
	});
};

function select_attributes($, selected, input) {
	const arr = $._available_properties.map(a => {
		const o = ce('option', a, { "value": a });
		if (selected.includes(a)) o.setAttribute('selected', '');

		return o;
	});

	const s = ce('select', arr, { "multiple": "", "name": "attrs" });

	s.style = `
width: 200px;
height: 10rem;
`;

	s.onchange = _ => input.value = Array.from(s.selectedOptions).map(o => o.value).join(',');

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

	if (and($.datatype.match('raster'), !maybe(cat, 'raster', 'paver'))) {
		const msg = `'${$.category_name}' category raster->paver configuration is not setup!`;

		FLASH.push({
			"type":    'error',
			"title":   "Configuration error",
			"message": msg,
		});

		console.error(msg);

		return false;
	}

	payload.config = JSON.stringify(cat.raster.paver);

	payload.resolution = r.resolution;

	return true;
};

export async function routine(obj, { edit_modal, pre }) {
	await pavercheck();

	const $ = obj.data;

	const payload = {
		"geographyid": $.geography_id,
		"datasetid":   $.id,
		"dataseturl":  null,
		"baseurl":     null,
		"field":       null,
		"fields":      [],
		"lnglat":      [],
		"config":      null,
		"resolution":  null,
	};

	let fn;
	let datasets_func;
	let template;
	let header;

	switch ($.datatype) {
	case 'points':
		if ($.source_files.find(f => f.func === 'csv')) {
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

	case 'polygons-boundaries': {
		datasets_func = 'vectors';
		template = 'datasets/paver-outline.html';

		if ($.category_name === 'boundaries') {
			header = "Admin Boundaries";
			fn = admin_boundaries;
		}
		else if ($.category_name === 'outline') {
			header = "Outline";
			fn = outline;
		}
		break;
	}

	case 'raster-valued':
	case 'raster': {
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

	const ok = await payload_fill($, payload, datasets_func);

	if (!ok) {
		flag($.id);

		return {
			"error":   "Failed. Looks like a configuration error.",
			"routine": fn.name,
			payload,
		};
	}

	if (!edit_modal)
		return (await fn($, payload, { pre }));

	const id = "form-" + uuid();
	const footer = `
<div class="input-group">
  <button type="submit" form=${id}>Pave it!</button>
</div>`;

	const paver_modal = new modal({
		header,
		"content": await remote_tmpl(template),
		footer,
	});

	const c = paver_modal.content;
	const f = c.querySelector('form');

	qs('form', c).id = id;
	c.append(ce('pre', null, { "id": "infopre" }));

	const s = await fn($, payload, { paver_modal });

	f.onsubmit = function(e) {
		e.preventDefault();
		qs('[type="submit"]', paver_modal.footer).setAttribute('disabled', '');

		s()
			.then(_r => {
				const r = _r[0];

				const form = qs('form', edit_modal.content);

				const changes = [];

				for (let k in r) {
					const d = typeof $[k];

					switch (d) {
					case 'object': {
						if (JSON.stringify($[k]) !== JSON.stringify(r[k]))
							changes.push(k);
						break;
					}

					default: {
						if ($[k] !== r[k])
							changes.push(k);
						break;
					}
					}
				}

				obj.fetch()
					.then(_ => dt.edit_update(form, changes, obj));
			})
			.then(async _ => {
				const tree = await API.get('geographies_tree_down', { "id": `eq.${$.geography_id}` });

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
						"category_id":  `eq.${$.category_id}`,
						"flagged":      "is.false",
					};

					if ($.name === null) {
						opts['name'] = "is.null";
					} else {
						opts['name'] = `eq.${$.name}`;
					}

					let ds = await API.get('datasets', opts);

					count += 1;
					document.querySelector('#infopre').innerText = `Pavering ${g.name} (${count}/${tree.length - 1})\n\n`;

					if (ds.length === 0) {
						const o = new dt.object({
							"module": dt.modules['datasets'],
							"data":   $,
						});

						ds = (await o.clone({ "geography_id": leaf }))['data'];
					} else if (ds.length > 1) {
						console.warn("Cannot choose. NEXT!");
						continue;
					}

					const p = Object.assign(ds, payload, { "geographyid": leaf });

					const f = (await fn(g, p, {}));
					await f();
				}
			});
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

async function submit(routine, payload, { paver_modal, pre }) {
	const body = [];

	for (const p in payload)
		body.push(
			encodeURIComponent(p) +
				"=" +
				encodeURIComponent(payload[p]));

	const infopre = pre || (paver_modal?.content || document).querySelector('#infopre');

	const socket_id = uuid();

	await socket_listen(socket_id, m => {
		if (infopre) infopre.innerText += "\n" + m;
	});

	return fetch(`${dt.config.paver_endpoint}/routines?routine=${routine}&socket_id=${socket_id}`, {
		"method":  'POST',
		"headers": {
			"Content-Type":  'application/x-www-form-urlencoded',
			"Authorization": `Bearer ${localStorage.getItem('token')}`,
		},
		"body": body.join("&"),
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

		return r;
	});
};

async function outline($, payload, { paver_modal }) {
	if (paver_modal)
		paver_modal.content.querySelector('form input[name=field]').value = maybe($, 'configuration', 'vectors_id');

	return function() {
		payload.field = paver_modal ?
			paver_modal.content.querySelector('form input[name=field]').value :
			maybe($, 'configuration', 'vectors_id');

		return submit('admin-boundaries', payload, { paver_modal })
			.then(async r => {
				if (r.error) {
					flag($.id);
					return r;
				}

				const j = await r.json();

				const d = API.patch(
					'datasets',
					{ "id": `eq.${$.id}` },
					{	"payload": {
						"processed_files": [{
							"func":     'vectors',
							"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${j.vectors}`,
						}, {
							"func":     'raster',
							"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${j.raster}`,
						}],
					} },
				);

				const {Left, Bottom, Right, Top} = j.info.bounds;

				API.patch('geographies', { "id": `eq.${$.geography_id}` }, {
					"payload": {
						"envelope": [Left, Bottom, Right, Top],
					},
				});

				return d;
			});
	};
};

async function admin_boundaries($, payload, { paver_modal }) {
	paver_modal.content.querySelector('form input[name=field]').value = maybe($, 'configuration', 'vectors_id');

	return function() {
		payload.field = paver_modal.content.querySelector('form input[name=field]').value;

		return submit('admin-boundaries', payload, { paver_modal })
			.then(async r => {
				if (r.error) {
					flag($.id);
					return r;
				}

				const j = await r.json();

				return API.patch(
					'datasets',
					{ "id": `eq.${$.id}` },
					{ "payload": {
						"processed_files": [{
							"func":     'vectors',
							"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${j.vectors}`,
						}, {
							"func":     'raster',
							"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${j.raster}`,
						}],
					},
					});
			});
	};
};

async function clip_proximity($, payload, { paver_modal }) {
	let f;
	if (f = maybe($, 'configuration', 'vectors_id'))
		payload.fields = payload.fields.push('vectors_id');

	if (f = maybe($, 'configuration', 'attributes_map'))
		payload.fields = payload.fields.concat(f.map(x => x['dataset']));

	if (f = maybe($, 'configuration', 'features_specs'))
		payload.fields = payload.fields.concat(f.map(x => x['key']));

	if (f = maybe($, 'configuration', 'properties_search'))
		payload.fields = payload.fields.concat(f);

	payload.fields = Array.from(new Set(payload.fields)).sort();

	if (paver_modal) {
		const input = paver_modal.content.querySelector('form input[name=fields]');

		paver_modal.content.querySelector('form').append(select_attributes($, payload.fields, input));
		input.value = payload.fields;
	}

	return function() {
		return submit('clip-proximity', payload, { paver_modal })
			.then(async r => {
				if (r.error) {
					flag($.id);
					return r;
				}

				const j = await r.json();

				return API.patch(
					'datasets',
					{ "id": `eq.${$.id}` },
					{ "payload": {
						"processed_files": [{
							"func":     'vectors',
							"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${j.vectors}`,
						}, {
							"func":     'raster',
							"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${j.raster}`,
						}],
					} },
				);
			});
	};
};

async function csv_points($, payload, { paver_modal }) {
	let f;
	if (f = maybe($, 'configuration', 'attributes_map'))
		payload.fields = payload.fields.concat(f.map(x => x['dataset']));

	if (f = maybe($, 'configuration', 'features_specs'))
		payload.fields = payload.fields.concat(f.map(x => x['key']));

	if (f = maybe($, 'configuration', 'properties_search'))
		payload.fields = payload.fields.concat(f);

	payload.fields = Array.from(new Set(payload.fields)).sort();

	if (paver_modal) {
		const input = paver_modal.content.querySelector('form input[name=fields]');

		paver_modal.content.querySelector('form').append(select_attributes($, payload.fields, input));
		input.value = payload.fields;
	}

	return function() {
		payload.lnglat = paver_modal.content.querySelector('form input[name=lnglat]').value;
		payload.fields = paver_modal.content.querySelector('form input[name=fields]').value;

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

		return submit('csv-points', payload, { paver_modal })
			.then(async r => {
				if (r.error) {
					flag($.id);
					return r;
				}

				const j = await r.json();

				return API.patch(
					'datasets',
					{ "id": `eq.${$.id}` },
					{ "payload": {
						"processed_files": [{
							"func":     'vectors',
							"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${j.vectors}`,
						}, {
							"func":     'raster',
							"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${j.raster}`,
						}],
					} },
				);
			});
	};
};

async function crop_raster($, payload, { paver_modal }) {
	return function() {
		return submit('crop-raster', payload, { paver_modal })
			.then(async r => {
				if (r.error) {
					flag($.id);
					return r;
				}

				const j = await r.json();

				return API.patch('datasets', { "id": `eq.${$.id}` }, {
					"payload": {
						"processed_files": [{
							"func":     'raster',
							"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${j.raster}`,
						}],
					},
				});
			});
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
			"deployment": ['staging'],
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
			"category_id":   cid,
			"geography_id":  gid,
			"configuration": {
				"vectors_id": vectors.id,
			},
			source_files,
		},
	});
	await d.create().then(r => did = r.id);

	d.patch({
		"deployment":      ['staging'],
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
		"idcolumn":   vectors.id,
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

		submit('subgeographies', payload, { paver_modal })
			.then(async r => r.json())
			.then(async results => {
				const resolution = payload.field = paver_modal.content.querySelector('form input[name=resolution]').value;

				for (const r of table)
					await subgeography(r, { obj, results, csv, cid, vectors, resolution });
			});
	};
};
