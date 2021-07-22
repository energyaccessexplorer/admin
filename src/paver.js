import {
	geojson_summary_iframe
} from './datasets.js';

import * as socket from './socket.js';

export async function routine(obj) {
	const d = obj.data;

	const payload = {
		geographyid: d.geography_id,
		datasetid: d.id,
		dataseturl: null,
		field: null,
		fields: [],
	};

	let fn;
	let datasets_func;
	let template;
	let header;

	switch (d.datatype) {
	case 'lines':
	case 'points':
	case 'polygons':
		fn = clip_proximity;
		datasets_func = 'vectors';
		template = 'datasets/paver-clip-proximity.html';
		header = "Clip Proximity";
		break;

	case 'polygons-boundaries':
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

	case 'raster':
		datasets_func = 'raster';
		template = 'datasets/paver-crop-raster.html';
		fn = crop_raster;
		header = "Crop Raster";
		break;

	default:
		break;
	}

	await obj.fetch();

	(async function payload_fill() {
		payload.dataseturl = maybe(d.source_files.find(x => x.func === datasets_func), 'endpoint');

		if (!payload.dataseturl) {
			alert(`Could not get endpoint for the ${datasets_func} source file. Check that...`);
			return;
		}

		const r = await dt_client.get('geographies', {
			"id": `eq.${payload.geographyid}`,
			"select": ["configuration"],
		}, { one: true });

		const rid = maybe(r, 'configuration', 'divisions', 0, 'dataset_id');

		if (!rid) {
			alert("The outline for this geography is not setup properly.");
			return;
		}

		const refs = await dt_client.get('datasets', {
			"id": `eq.${rid}`,
			"select": ["processed_files"],
		}, { one: true });

		payload.referenceurl = maybe(refs.processed_files.find(x => x.func === 'vectors'), 'endpoint');
	})();

	const t = await remote_tmpl(template);

	const m = new modal('paver-modal', {
		header,
		content: t.innerHTML,
	});

	const c = m.content;
	const f = c.querySelector('form');
	const g = f.querySelector('button[bind=geojson]');

	if (g) g.onclick = _ => geojson_summary_iframe(obj);

	(async function pavercheck() {
		fetch(`${dt_paver.base}/routines`, {
			method: 'OPTIONS',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('token')}`
			},
		}).then(r => {
			if (!r.ok) {
				const msg = "Paver is not running... :(";

				m.set({ "content": msg });
				m.show();

				throw new Error(msg);
			}
		});
	})();

	const s = await fn(obj, payload, c);

	f.onsubmit = function(e) {
		e.preventDefault();
		s();
	};

	m.show();
};

async function submit(routine, payload, modal) {
	const body = [];
	for (const p in payload)
		body.push(
			encodeURIComponent(p) +
				"=" +
				encodeURIComponent(payload[p]));

	const infopre = modal.querySelector('#infopre');

	socket.listen(m => infopre.innerText += "\n" + m);

	return fetch(`${dt_paver.base}/routines?routine=${routine}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': `Bearer ${localStorage.getItem('token')}`
		},
		body: body.join("&"),
	}).then(async r => {
		if (!r.ok) {
			const msg = await r.text();
			infopre.innerText += `

${r.status} - ${r.statusText}

${msg}`;
		}

		return r;
	});
};

async function outline(obj, payload, modal) {
	return function() {
		payload.field = modal.querySelector('form input[name=field]').value;

		submit('admin-boundaries', payload, modal)
			.then(async r => {
				const j = await r.json();

				dt_client.patch('datasets', { "id": `eq.${obj.data.id}` }, {
					payload: {
						"processed_files": [{
							"func": 'vectors',
							"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${j.vectors}`,
						}, {
							"func": 'raster',
							"endpoint": `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${j.raster}`,
						}]
					}
				});

				const {Left, Bottom, Right, Top} = j.info.bounds;

				dt_client.patch('geographies', { "id": `eq.${obj.data.geography_id}` }, {
					payload: {
						"envelope": [Left, Bottom, Right, Top]
					}
				});
			});
	};
};

async function admin_boundaries(obj, payload, modal) {
	return function() {
		payload.field = modal.querySelector('form input[name=field]').value;

		submit('admin-boundaries', payload, modal)
			.then(async r => {
				const j = await r.json();

				dt_client.patch('datasets', { "id": `eq.${obj.data.id}` }, {
					payload: {
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

async function clip_proximity(obj, payload, modal) {
	let f;
	if (f = maybe(obj.data, 'configuration', 'attributes_map'))
		payload.fields = payload.fields.concat(f.map(x => x['dataset']));

	if (f = maybe(obj.data, 'configuration', 'features_specs'))
		payload.fields = payload.fields.concat(f.map(x => x['key']));

	if (f = maybe(obj.data, 'configuration', 'properties_search'))
		payload.fields = payload.fields.concat(f);

	payload.fields = Array.from(new Set(payload.fields)).sort();

	modal.querySelector('form input[name=fields]').value = payload.fields;

	return function() {
		submit('clip-proximity', payload, modal)
			.then(async r => {
				const j = await r.json();

				dt_client.patch('datasets', { "id": `eq.${obj.data.id}` }, {
					payload: {
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

async function crop_raster(obj, payload, modal) {
	return function() {
		submit('crop-raster', payload, modal)
			.then(async r => {
				const j = await r.json();

				dt_client.patch('datasets', { "id": `eq.${obj.data.id}` }, {
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
