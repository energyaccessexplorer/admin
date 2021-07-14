import {
	circles_user,
} from './circles.js';

import * as paver from './paver.js';

const url = new URL(location);
const dataset_id = url.searchParams.get('id');
const geography_id = url.searchParams.get('geography_id');
const category_id = url.searchParams.get('category_id');

function source_files_requirements(m) {
	let n;

	switch (datatype(m)) {
	case 'points':
	case 'polygons':
	case 'lines':
		n = ['vectors'];
		break;

	case 'table':
	case 'polygons-boundaries':
		n = ['vectors', 'csv'];
		break;

	case 'raster':
		n = ['raster'];
		break;

	case 'raster-mutant':
		n = [];
		break;

	default:
		n = [];
		break;
	}

	return n;
};

function source_files_validate(data, newdata) {
	const reqs = source_files_requirements(data);

	const existing = newdata['source_files'].map(s => s.func);

	let ok = true;

	for (const r of reqs) {
		if (existing.indexOf(r) < 0) {
			ok = false;

			dt_flash.push({
				type: 'error',
				title: `Source Files are incomplete`,
				message: `'${r}' element is missing.`
			});
		}
	}

	return ok;
};

const clonable_attrs = [
	'geography_id',
	'category_id',
	'name_long',
	'configuration',
	'category_overrides',
	'pack',
	'presets',
	'metadata'
];

function clone() {
	const t = arguments[0];

	const data = {};

	for (const k of clonable_attrs)
		data[k] = t.data[k];

	const n = (t.data.name || t.data.category_name);

	data['name'] = n + "-clone-" + (new Date).getTime();

	const o = new dt_object({
		"model": model,
		"data": data,
		"collection": t.collection,
	});

	if (confirm(`Clone '${n}' dataset?`)) o.create();
};

export const base = 'datasets';

export const model = {
	"main": m => "&nbsp;",

	"columns": ["category_name", "geography_name"],

	"schema": {
		"category_id": {
			"type": "uuid",
			"fkey": "categories",
			"constraint": "category",
			"required": true,
			"label": "Category",
			"show": m => `<strong>${m.category_name}</strong>`,
			"columns": ['*']
		},

		"geography_id": {
			"type": "uuid",
			"fkey": "geographies",
			"constraint": "geography",
			"required": true,
			"editable": false,
			"label": "Geography",
			"show": m => `<strong>${m.geography_name}</strong>`,
			"columns": ['*']
		},

		"name": {
			"type": "string",
			"label": "Name",
			"pattern": "^[a-z][a-z0-9\-]+$",
			"placeholder": "leave blank to inherit from category"
		},

		"name_long": {
			"type": "string",
			"label": "Name Long",
			"placeholder": "leave blank to inherit from category"
		},

		"deployment": {
			"type": "array",
			"schema": {
				"type": "string",
				"options": ["staging", "production"],
				"required": true
			}
		},

		"flagged": {
			"type": "boolean"
		},

		"pack": {
			"type": "string",
			"label": "Pack",
			"pattern": "^[a-z][a-z0-9\-]+$",
			"default": "all",
		},

		"source_files": {
			"type": "array",
			"nullable": false,
			"validate": source_files_validate,
			"schema": {
				"type": "object",
				"schema": {
					"func": {
						"type": "select",
						"required": true,
						"options": ["vectors", "raster", "csv"]
					},

					"endpoint": {
						"type": "string",
						"required": true,
						"pattern": "^https://(.+)"
					},
				}
			}
		},

		"processed_files": {
			"type": "array",
			"nullable": false,
			"schema": {
				"type": "object",
				"schema": {
					"func": {
						"type": "string",
						"required": true,
						"editable": false,
						"options": ["vectors", "raster", "csv"]
					},

					"endpoint": {
						"type": "string",
						"required": true,
						"editable": false,
						"pattern": "^https://(.+)"
					},
				}
			}
		},

		"configuration": {
			"type": "object",
			"label": "Configuration",
			"nullable": true,
			"schema": {
				"divisions_tier": {
					"type": "number",
					"nullable": true,
					"needs": m => m.category_name.match(/indicator/),
				},

				"csv_columns": {
					"type": "object",
					"nullable": true,
					"schema": {
						"id": {
							"type": "string",
							"required": true,
						},

						"value": {
							"type": "string",
							"nullable": true,
							// TODO: "needs" to be 'boundaries' ds
							"hint": "",
						}
					}
				},

				"attributes_map": {
					"type": "array",
					"nullable": true,
					"schema": {
						"type": "object",
						"nullable": false,
						"schema": {
							"target": {
								"type": "string",
								"required": true
							},
							"dataset": {
								"type": "string",
								"required": true
							}
						}
					}
				},

				"properties_search": {
					"type": "array",
					"nullable": true,
					"schema": {
						"type": "string",
						"required": true,
					}
				},

				"features_specs": {
					"type": "array",
					"nullable": true,
					"callback": function(details) {
						const button = ce('button', "see GEOJSON summary", { style: "float: right;", type: "button" });

						button.onclick = _ => geojson_summary_iframe(this);

						details.querySelector(':scope > summary').append(button);
					},
					"schema": {
						"type": "object",
						"nullable": false,
						"appendable": true,
						"schema": {
							"key": {
								"type": "string",
								"required": true
							},
							"match": {
								"type": "regexp",
								"required": true
							},
							"radius": {
								"type": "number",
								"hint": "points only",
								"droppable": true,
								"required": true
							},
							"stroke": {
								"type": "colour",
								"droppable": true,
								"required": true
							},
							"stroke-width": {
								"type": "number",
								"hint": "does not apply to polygons",
								"droppable": true,
								"required": true
							}
						}
					}
				},

				"mutant_targets": {
					"type": "array",
					"nullable": true,
					"schema": {
						"type": "string",
					}
				}
			}
		},

		"category_overrides": {
			"type": "json",
			"label": "Category Overrides",
			"nullable": true
		},

		"presets": {
			"type": "array",
			"nullable": true,
			"schema": {
				"type": "object",
				"schema": {
					"name": {
						"type": "string",
						"required": true,
						"options": ["market", "planning", "investment"]
					},

					"weight": {
						"type": "number",
						"required": true,
						"default": 2
					},

					"min": {
						"type": "number",
						"default": 0
					},

					"max": {
						"type": "number",
						"default": 100
					}
				}
			}
		},

		"metadata": {
			"type": "object",
			"schema": {
				"description": {
					"type": "text",
					"nullable": true
				},

				"suggested_citation": {
					"type": "text",
					"nullable": true
				},

				"cautions": {
					"type": "text",
					"nullable": true
				},

				"spatial_resolution": {
					"type": "string",
					"nullable": true
				},

				"download_original_url": {
					"type": "string",
					"nullable": true
				},

				"learn_more_url": {
					"type": "string",
					"nullable": true
				},

				"license": {
					"type": "text",
					"nullable": true
				},

				"sources": {
					"type": "text",
					"nullable": true
				},

				"content_date": {
					"type": "string",
					"pattern": "^[0-9]{4}(-[0-9]{4})?$",
					"nullable": true
				}
			}
		},

		"created": {
			"type": "string",
			"label": "Created",
			"editable": false
		},

		"created_by": {
			"type": "string",
			"label": "Created by",
			"editable": false
		},

		"updated": {
			"type": "string",
			"label": "Last update",
			"editable": false
		},

		"updated_by": {
			"type": "string",
			"label": "Last update by",
			"editable": false
		},
	},

	"show": function(o) {
		const m = o.data;

		const u = new URL(dt_config.production + "/d");
		u.searchParams.set('id', m.geography_id);
		u.searchParams.set('dataset_id', m.id);

		const iframe = ce('iframe', null, { width: "600", height: "600" });
		iframe.src = u;

		return { content: iframe, header: null };
	},

	"parse": function(m) {
		m.haspaver = [
			'points',
			'lines',
			'polygons',
			'polygons-boundaries',
		].includes(m.datatype);

		m.inproduction = m.deployment.indexOf("production") > -1;
		m.instaging = m.deployment.indexOf("staging") > -1;
		m.file_count = m.files ? m.files.length : "?";
		m.ok = !m.flagged;
		return m;
	},

	"edit_modal_jobs": [
		function(object, form) {
			dt_external_link(object, form, m => `${dt_config.production}/a/?id=${m.geography_id}&inputs=${m.name}`);
		},
		function(_, form) {
			const metadatadetails = form.querySelector('details[name="metadata"]');
			const summary = metadatadetails.querySelector('summary');
			summary.style = "position: relative;";

			const button = document.createElement('button');
			button.type = 'button';
			button.innerText = "import metadata";
			button.style = "position: absolute; right: 0.5em; top: -1em;";

			const input = document.createElement('input');
			input.type = 'hidden';
			input.onchange = function() {
				fetch(dt_config.api + `/datasets?select=metadata&id=eq.${this.value}`)
					.then(r => r.json())
					.then(r => {
						let metadata;
						if (!r[0] || !(metadata = r[0]['metadata'])) return;

						for (let k in metadata)
							metadatadetails.querySelector(`[name=${k}]`).value = metadata[k];
					})
			};

			button.onclick = function() {
				dt_model_search_modal('datasets', input, null);
			}

			summary.append(button);
		},
		function(object, form) {
			const ta = form.querySelector('textarea[name="category_overrides"]');
			const ig = ta.parentElement;

			const button = document.createElement('button');
			button.type = 'button';
			button.innerText = "import JSON segment";
			button.style = "float: right;";

			function selectkey() {
				const select = ce('select');

				select.append(ce('option', "", { disabled: '', selected: '' }));

				select.onchange = async function() {
					const k = this.value;

					const p = await fetch(dt_config.api + `/categories?id=eq.${object.data.category_id}`)
						.then(r => r.json())
						.then(r => r[0][k]);

					let co;

					try {
						co = JSON.parse(ta.value);
					} catch (e) {
						dt_flash.push({
							type: "warn",
							message: "Failed to parse JSON from configuration overrides. Using an empty object.",
						});
						co = {};
					}
					co[k] = p;

					ta.value = JSON.stringify(co, null, 2);

					dt_modal.hide();
				};

				for (let k of ['analysis', 'controls', 'domain', 'domain_init', 'metadata', 'raster', 'vectors'])
					select.append(ce('option', k));

				dt_modal.set({
					header: "Select a segment from the category configuration",
					content: select
				}).show();
			};

			button.onclick = function() {
				selectkey();
			};

			ig.prepend(button);
		},
	],
};

export const collection = {
	"filters": ['name', 'name_long', 'category_name'],

	"endpoint": function() {
		const attrs = ['id', 'datatype', 'deployment', 'flagged', 'name', 'category(*)', 'category_id', 'category_name', 'geography_circle', 'pack', 'geography_id', 'files(id)', '_datasets_files(*,file:files(endpoint))', 'created', 'created_by', 'updated', 'updated_by'];
		const params = { "select": attrs };

		if (dataset_id)
			params['id'] = `eq.${dataset_id}`;

		else if (geography_id) {
			params['geography_id'] = `eq.${geography_id}`;
			params['order'] = ['name.asc'];
		}

		else if (category_id)
			params['category_id'] = `eq.${category_id}`;

		const circles = circles_user();
		if (circles)
			params['geography_circle'] = `in.(${circles})`;

		return params;
	},

	"rowevents": {
		"[action=paver]": ["click", paver.routine],
		"[action=clone]": ["click", clone],
		"td[bind=name]": ["dblclick", flag],
	},

	"parse": model.parse,

	"order": -1
};

export async function header() {
	if (geography_id) {
		const name = (await dt_client.get('geographies', { select: ['name'], id: `eq.${geography_id}` }, { one: true }))['name'];
		return `${name} - datasets`;
	} else if (category_id) {
		const name = (await dt_client.get('categories', { select: ['name'], id: `eq.${category_id}` }, { one: true }))['name'];
		return `${name} - datasets`;
	}
};

export function geojson_summary_url(m) {
	const u = new URL(dt_config.production + "/d");

	u.searchParams.set('id', m.geography_id);
	u.searchParams.set('dataset_id', m.id);
	u.searchParams.set('fn', 'geojson_summary');

	return u;
};

export function geojson_summary_iframe(o) {
	const iframe = ce('iframe', null, { width: "600", height: "600" });
	iframe.src = geojson_summary_url(o);

	const m = new modal('geojson-modal', {
		header: null,
		content: iframe,
		destroy: true,
	}).show();
};

function flag(obj) {
	const data = Object.assign({}, obj.data);
	data.flagged = !data.flagged;

	obj.patch(data);
};
