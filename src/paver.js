import { csvParse } from '../lib/ds-dsv.js';

import { listen as socket_listen } from './socket.js';

import {
	geojson_summary_iframe,
	model as dataset_model,
} from './datasets.js';

async function pavercheck() {
	fetch(`${dt_paver.base}/routines`, {
		method: 'OPTIONS',
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('token')}`
		},
	}).then(r => {
		if (!r.ok) {
			const msg = "Paver is not running... :(";
			dt_flash.push({ 'title': msg });
			throw new Error(msg);
		}
	});
};

export async function routine(obj, { edit_modal, pre }) {
	await pavercheck();

	const d = obj.data;

	const payload = {
		geographyid: d.geography_id,
		datasetid: d.id,
		dataseturl: null,
		baseurl: null,
		field: null,
		fields: [],
		config: null,
		resolution: null,
	};

	let fn;
	let datasets_func;
	let template;
	let header;

	switch (d.datatype) {
	case 'lines':
	case 'points':
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

		if (d.category_name === 'boundaries') {
			header = "Admin Boundaries";
			fn = admin_boundaries;
		}
		else if (d.category_name === 'outline') {
			header = "Outline";
			fn = outline;
		}
		break;
	}

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

	await (async function payload_fill() {
		payload.dataseturl = maybe(d.source_files.find(x => x.func === datasets_func), 'endpoint');

		if (!payload.dataseturl) {
			alert(`Could not get endpoint for the ${datasets_func} source file. Check that...`);
			return;
		}

		const r = await dt_client.get('geographies', {
			"id": `eq.${payload.geographyid}`,
			"select": ["configuration", "resolution"],
		}, { one: true });

		const rid = maybe(r, 'configuration', 'divisions', 0, 'dataset_id');

		if (!rid) {
			alert("The geography -> configuration -> division -> 0 is not setup properly.");
			return;
		}

		const refs = await dt_client.get(
			'datasets',
			{
				"id": `eq.${rid}`,
				"select": ["processed_files"],
			},
			{ one: true });

		payload.referenceurl = maybe(refs.processed_files.find(x => x.func === 'vectors'), 'endpoint');
		payload.baseurl = maybe(refs.processed_files.find(x => x.func === 'raster'), 'endpoint');

		const cat = await dt_client.get('categories', {
			"id": `eq.${obj.data.category_id}`,
			"select": ["raster"],
		}, { one: true });

		if (and(d.datatype === 'raster', !cat.raster.paver)) {
			const msg = `'${d.category_name}' category raster->paver configuration is not setup!`;

			dt_flash.push({
				type: 'error',
				title: "Configuration error",
				message: msg,
			});

			throw new Error(msg);
		}

		payload.config = JSON.stringify(cat.raster.paver);

		payload.resolution = r.resolution;
	})();

	if (!edit_modal)
		return (await fn(obj, payload, { pre }));

	const paver_modal = new modal('paver-modal', {
		header,
		content: await remote_tmpl(template),
	});

	const c = paver_modal.content;
	const f = c.querySelector('form');
	const g = f.querySelector('button[bind=geojson]');

	if (g) g.onclick = _ => geojson_summary_iframe(obj);

	const s = await fn(obj, payload, { paver_modal });

	f.onsubmit = function(e) {
		e.preventDefault();

		s().then(_r => {
			const r = _r[0];

			const form = qs('form', edit_modal.content);

			const changes = [];

			for (let k in r) {
				const d = typeof obj.data[k];

				switch (d) {
				case 'object': {
					if (JSON.stringify(obj.data[k]) !== JSON.stringify(r[k]))
						changes.push(k);
					break;
				}

				default: {
					if (obj.data[k] !== r[k])
						changes.push(k);
					break;
				}
				}
			}

			obj.fetch()
				.then(_ => dt_edit_update(form, changes, obj));
		});
	};

	paver_modal.show();
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

	return fetch(`${dt_paver.base}/routines?routine=${routine}&socket_id=${socket_id}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': `Bearer ${localStorage.getItem('token')}`
		},
		body: body.join("&"),
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
		}

		return r;
	});
};

async function outline(obj, payload, { paver_modal }) {
	if (paver_modal)
		paver_modal.querySelector('form input[name=field]').value = maybe(obj.data, 'configuration', 'vectors_id');

	return function() {
		payload.field = paver_modal ?
			paver_modal.querySelector('form input[name=field]').value :
			maybe(obj.data, 'configuration', 'vectors_id');

		return submit('admin-boundaries', payload, { paver_modal })
			.then(async r => {
				const j = await r.json();

				const d = dt_client.patch(
					'datasets',
					{ "id": `eq.${obj.data.id}` },
					{	"payload": {
						"processed_files": [{
							"func": 'vectors',
							"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${j.vectors}`,
						}, {
							"func": 'raster',
							"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${j.raster}`,
						}]
					} }
				);

				const {Left, Bottom, Right, Top} = j.info.bounds;

				dt_client.patch('geographies', { "id": `eq.${obj.data.geography_id}` }, {
					payload: {
						"envelope": [Left, Bottom, Right, Top]
					}
				});

				return d;
			});
	};
};

async function admin_boundaries(obj, payload, { paver_modal }) {
	paver_modal.querySelector('form input[name=field]').value = maybe(obj.data, 'configuration', 'vectors_id');

	return function() {
		payload.field = paver_modal.querySelector('form input[name=field]').value;

		return submit('admin-boundaries', payload, { paver_modal })
			.then(async r => {
				const j = await r.json();

				return dt_client.patch(
					'datasets',
					{ "id": `eq.${obj.data.id}` },
					{ "payload": {
						"processed_files": [{
							"func": 'vectors',
							"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${j.vectors}`,
						}, {
							"func": 'raster',
							"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${j.raster}`,
						}]
					}
					});
			});
	};
};

async function clip_proximity(obj, payload, { paver_modal }) {
	let f;
	if (f = maybe(obj.data, 'configuration', 'vectors_id'))
		payload.fields = payload.fields.push('vectors_id');

	if (f = maybe(obj.data, 'configuration', 'attributes_map'))
		payload.fields = payload.fields.concat(f.map(x => x['dataset']));

	if (f = maybe(obj.data, 'configuration', 'features_specs'))
		payload.fields = payload.fields.concat(f.map(x => x['key']));

	if (f = maybe(obj.data, 'configuration', 'properties_search'))
		payload.fields = payload.fields.concat(f);

	payload.fields = Array.from(new Set(payload.fields)).sort();

	if (paver_modal)
		paver_modal.querySelector('form input[name=fields]').value = payload.fields;

	return function() {
		return submit('clip-proximity', payload, { paver_modal })
			.then(async r => {
				const j = await r.json();

				return dt_client.patch(
					'datasets',
					{ "id": `eq.${obj.data.id}` },
					{ "payload": {
						"processed_files": [{
							"func": 'vectors',
							"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${j.vectors}`,
						}, {
							"func": 'raster',
							"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${j.raster}`,
						}]
					} }
				);
			});
	};
};

async function crop_raster(obj, payload, { paver_modal }) {
	return function() {
		return submit('crop-raster', payload, { paver_modal })
			.then(async r => {
				const j = await r.json();

				return dt_client.patch('datasets', { "id": `eq.${obj.data.id}` }, {
					payload: {
						"processed_files": [{
							"func": 'raster',
							"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${j.raster}`,
						}]
					}
				});
			});
	};
};

async function subgeography(r, { results, cid, vectors, csv, obj, resolution }) {
	const g = new dt_object({
		"model": dt_modules['geographies']['model'],
		"data": {
			"name": r[csv.value],
			"parent_id": obj.id,
			"adm": obj.adm + 1,
			"resolution": parseInt(resolution),
			"circle": obj.circle,
			"deployment": ['staging'],
		}
	});

	let gid, did;
	await g.create().then(r => gid = r.id);

	if (!gid) throw new Error(`BU ${gid}`);

	const source_files = [{
		"func": "vectors",
		"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${results[r[csv.id]]}`,
	}];

	const d = new dt_object({
		model: dataset_model,
		"data": {
			"category_id": cid,
			"geography_id": gid,
			"configuration": {
				"vectors_id": vectors.id,
			},
			source_files,
		}
	});
	await d.create().then(r => did = r.id);

	d.patch({
		"deployment": ['staging'],
		"processed_files": [],
		source_files,
	});

	g.patch({
		"configuration": {
			"divisions": [{
				"name": "Outline",
				"dataset_id": did,
			}]
		}
	});

	return d.fetch()
		.then(_ => routine(d))
		.then(e => e());
};

export async function subgeographies(obj, { vectors, csv }) {
	const payload = {
		"dataseturl": vectors.endpoint,
		"idcolumn": vectors.id,
	};

	const table = await fetch(csv.endpoint).then(r => r.text()).then(r => csvParse(r));
	const shapes = await fetch(vectors.endpoint).then(r => r.json());
	const cid = (await dt_client.get('categories', { 'name': "eq.outline", 'select': ['id'] }, { one: true }))['id'];

	if (table.length !== shapes.features.length)
		throw new Error("different lengths. ciao.");

	for (const r of table) {
		if (!shapes.features.find(f => +f.properties[vectors.id] === +r[csv.id]))
			throw new Error("you suck");
	}

	const paver_modal = new modal('paver-modal', {
		content: await remote_tmpl("geographies/paver-subgeographies.html"),
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

				dataset_model['base'] = 'datasets';

				for (const r of table)
					await subgeography(r, { obj, results, csv, cid, vectors, resolution });
			});
	};
};
