import {
	geojson_summary_iframe
} from './datasets.js';

import * as socket from './socket.js';

export async function routine(obj) {
	const c = await dt_client.get('categories', {
		"id": `eq.${obj.data.category_id}`,
		"select": ["*"],
	}, { one: true });

	switch (obj.data.datatype) {
	case 'lines':
	case 'points':
	case 'polygons':
		clip_proximity(obj);
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

async function clip_proximity(obj) {
	const payload = {
		datasetid: obj.data.id,
		geographyid: obj.data.geography_id,
		dataseturl: null,
		referenceurl: null,
		fields: [],
	};

	await obj.fetch();

	let f;
	if (f = maybe(obj.data, 'configuration', 'attributes_map'))
		payload.fields = payload.fields.concat(f.map(x => x['dataset']));

	if (f = maybe(obj.data, 'configuration', 'features_specs'))
		payload.fields = payload.fields.concat(f.map(x => x['key']));

	if (f = maybe(obj.data, 'configuration', 'properties_search'))
		payload.fields = payload.fields.concat(f);

	payload.fields = Array.from(new Set(payload.fields)).sort();

	payload.dataseturl = maybe(obj.data.source_files.find(x => x.func === 'vectors'), 'endpoint');

	if (!payload.dataseturl) {
		alert("Could not get endpoint for the vectors source file. Check that...");
		return;
	}

	const r = await dt_client.get('geographies', {
		"id": `eq.${payload.geographyid}`,
		"select": ["configuration"],
	}, { one: true });

	const referencedsid = maybe(r, 'configuration', 'divisions', 0, 'dataset_id');

	if (referencedsid) {
		const refs = await dt_client.get('_datasets_files', {
			"dataset_id": `eq.${referencedsid}`,
			"select": ["*", "file:files(*)"],
		});

		payload.referenceurl = maybe(refs.find(x => x.active && x.func === 'vectors'), 'file', 'endpoint');
	} else {
		alert("No referenceurl");
		return;
	}

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

				await Promise.all([
					dt_client.post('files', null, {
						'one': true,
						'payload': {
							'label': "paver-clip-proximity",
							'endpoint': `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${j.vectors}`,
							'comment': "created by paver"
						}
					}),
					dt_client.post('files', null, {
						'one': true,
						'payload': {
							'label': "paver-clip-proximity",
							'endpoint': `https://wri-public-data.s3.amazonaws.com/EnergyAccess/paver-outputs/${j.raster}`,
							'comment': "created by paver"
						}
					}),
				]).then(function(responses) {
					const [v,r] = responses;

					dt_client.post('_datasets_files', null, {
						'one': true,
						'payload': {
							'active': true,
							'func': "vectors",
							'file_id': v.id,
							'dataset_id': payload.datasetid
						}
					});

					dt_client.post('_datasets_files', null, {
						'one': true,
						'payload': {
							'active': true,
							'func': "raster",
							'file_id': r.id,
							'dataset_id': payload.datasetid
						}
					});
				});
			});

		this.disabled = true;
	};

	const form = c.querySelector('form');

	form.querySelector('input[name=fields]').value = payload.fields;
	form.querySelector('input[name=dataseturl]').value = payload.dataseturl;

	m.show();
};
