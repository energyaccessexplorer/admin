import {
	geojson_summary_iframe
} from './datasets.js';

import * as socket from './socket.js';

export async function routine(obj) {
	const d = obj.data;

	const c = await dt_client.get('categories', {
		"id": `eq.${d.category_id}`,
		"select": ["*"],
	}, { one: true });

	switch (d.datatype) {
	case 'lines':
	case 'points':
	case 'polygons':
		clip_proximity(obj);
		break;

	case 'polygons-boundaries':
		if (d.category_name === 'boundaries')
			admin_boundaries(obj);
		else if (d.category_name === 'outline')
			outline(obj);
		break;

	default:
		break;
	}
};

export async function submit(routine, payload) {
	const body = [];
	for (const p in payload)
		body.push(
			encodeURIComponent(p) +
				"=" +
				encodeURIComponent(payload[p]));

	const infopre = document.getElementById('infopre');

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

async function outline(obj) {
	const d = obj.data;

	const payload = {
		geographyid: d.geography_id,
		datasetid: d.id,
		dataseturl: null,
		field: null,
	};

	await obj.fetch();

	payload.dataseturl = maybe(d.source_files.find(x => x.func === 'vectors'), 'endpoint');

	if (!payload.dataseturl) {
		alert("Could not get endpoint for the vectors source file. Check that...");
		return;
	}

	const r = await dt_client.get('geographies', {
		"id": `eq.${d.geography_id}`,
		"select": ["configuration"],
	}, { one: true });

	const t = await remote_tmpl('datasets/paver-outline.html');

	const m = new modal('paver-modal', {
		header: "Outline",
		content: t.innerHTML,
	});

	const c = m.content;
	c.querySelector('button[bind=geojson]').onclick = function() {
		geojson_summary_iframe(obj);
	};

	const f = c.querySelector('form');
	f.onsubmit = function(e) {
		e.preventDefault();

		payload.field = f.querySelector('form input[name=field]').value;

		submit('admin-boundaries', payload)
			.then(async r => {
				const j = await r.json();

				dt_client.patch('datasets', { "id": `eq.${d.id}` }, {
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
				console.log(j.info.bounds);

				dt_client.patch('geographies', { "id": `eq.${d.geography_id}` }, {
					payload: {
						"envelope": [Left, Bottom, Right, Top]
					}
				});
			});

		this.disabled = true;
	};

	m.show();
};

async function admin_boundaries(obj) {
	const d = obj.data;

	const payload = {
		geographyid: d.geography_id,
		datasetid: d.id,
		dataseturl: null,
		field: null,
	};

	await obj.fetch();

	payload.dataseturl = maybe(d.source_files.find(x => x.func === 'vectors'), 'endpoint');

	if (!payload.dataseturl) {
		alert("Could not get endpoint for the vectors source file. Check that...");
		return;
	}

	const r = await dt_client.get('geographies', {
		"id": `eq.${payload.geographyid}`,
		"select": ["configuration"],
	}, { one: true });

	const t = await remote_tmpl('datasets/paver-admin-boundaries.html');

	const m = new modal('paver-modal', {
		header: "Admin Boundaries",
		content: t.innerHTML,
	});

	const c = m.content;
	c.querySelector('button[bind=geojson]').onclick = function() {
		geojson_summary_iframe(obj);
	};

	const f = c.querySelector('form');
	f.onsubmit = function(e) {
		e.preventDefault();

		payload.field = f.querySelector('form input[name=field]').value;

		submit('admin-boundaries', payload)
			.then(async r => {
				const j = await r.json();

				dt_client.patch('datasets', { "id": `eq.${d.id}` }, {
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

		this.disabled = true;
	};

	m.show();
};

async function clip_proximity(obj) {
	const d = obj.data;

	const payload = {
		datasetid: d.id,
		geographyid: d.geography_id,
		dataseturl: null,
		referenceurl: null,
		fields: [],
	};

	await obj.fetch();

	let f;
	if (f = maybe(d, 'configuration', 'attributes_map'))
		payload.fields = payload.fields.concat(f.map(x => x['dataset']));

	if (f = maybe(d, 'configuration', 'features_specs'))
		payload.fields = payload.fields.concat(f.map(x => x['key']));

	if (f = maybe(d, 'configuration', 'properties_search'))
		payload.fields = payload.fields.concat(f);

	payload.fields = Array.from(new Set(payload.fields)).sort();

	payload.dataseturl = maybe(d.source_files.find(x => x.func === 'vectors'), 'endpoint');

	if (!payload.dataseturl) {
		alert("Could not get endpoint for the vectors source file. Check that...");
		return;
	}

	const r = await dt_client.get('geographies', {
		"id": `eq.${payload.geographyid}`,
		"select": ["configuration"],
	}, { one: true });

	const referencedsid = maybe(r, 'configuration', 'divisions', 0, 'dataset_id');

	if (!referencedsid) {
		alert("The outline for this geography is not setup properly.");
		return;
	}

	const refs = await dt_client.get('datasets', {
		"id": `eq.${referencedsid}`,
		"select": ["processed_files"],
	}, { one: true });

	payload.referenceurl = maybe(refs.processed_files.find(x => x.func === 'vectors'), 'endpoint');

	const t = await remote_tmpl('datasets/paver-clip-proximity.html');

	const m = new modal('paver-modal', {
		header: "Clip Proximity",
		content: t.innerHTML,
	});

	const c = m.content;
	c.querySelector('button[bind=geojson]').onclick = function() {
		geojson_summary_iframe(obj);
	};

	c.querySelector('button#submit').onclick = function(e) {
		e.preventDefault();

		submit('clip-proximity', payload)
			.then(async r => {
				const j = await r.json();

				dt_client.patch('datasets', { "id": `eq.${d.id}` }, {
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

		this.disabled = true;
	};

	const form = c.querySelector('form');

	form.querySelector('input[name=fields]').value = payload.fields;

	m.show();
};
