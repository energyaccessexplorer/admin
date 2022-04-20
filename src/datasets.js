import {
	circles_user,
} from './circles.js';

import {
	email_user,
	external_link_base,
} from './extras.js';

import {
	routine as paver_routine
} from './paver.js';

window.email_user = email_user;

const url = new URL(location);
const dataset_id = url.searchParams.get('id');
const geography_id = url.searchParams.get('geography_id');
const category_id = url.searchParams.get('category_id');

export const base = 'datasets';

export const model = {
	"main": _ => "&nbsp;",

	"base": base,

	"columns": [
		"datatype",
		"category_name",
		"geography_name"
	],

	"clonable_attrs": [
		'geography_id',
		'category_id',
		'name_long',
		'configuration',
		'category_overrides',
		'metadata',
		'source_files',
	],

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

		"flagged": {
			"type": "boolean",
			"hint": "Flagging a dataset will automatically remove it from the production environment for revision. Flagged datasets can be reviewed in the staging environment. Unflagging does not add the dataset back into the production environment.",
		},

		"deployment": {
			"type": "array",
			"unique": true,
			"hint": "Select the environment(s) where the dataset will be deployed.",
			"schema": {
				"type": "string",
				"options": ["test", "staging", "production", "training", "development"],
				"required": true
			}
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
						"options": ["vectors", "raster", "csv"],
						"hint": "Select the type of dataset: vector, raster, or csv",
					},

					"endpoint": {
						"type": "string",
						"required": true,
						"pattern": "^https://(.+)",
						"bind": "storage",
						"hint": "Enter the secure URL that corresponds to the dataset in the cloud",
					},
				}
			}
		},

		"processed_files": {
			"type": "array",
			"nullable": false,
			"hint": "These fields will generate automatically with PAVER",
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
			"validate": configuration_attributes_validate,
			"schema": {
				"divisions_tier": {
					"type": "number",
					"nullable": true,
					"needs": m => m.category_name.match(/indicator/),
					"hint": "The national/subnational administrative level that corresponds with the CSV data. 0 = National",
				},

				"vectors_id": {
					"hint": "IDs for geographic features in linked GeoJSON file. This corresponds to the csv_columns->id value below.",
					"type": "string",
					"needs": m => m.category_name.match(/boundaries/),
				},

				"csv_columns": {
					"type": "object",
					"nullable": true,
					"hint": "CSV file configuration",
					"schema": {
						"id": {
							"type": "string",
							"required": true,
							"hint": "Column header containing IDs for geographic divisions in linked CSV file. This corresponds to the vectors_id value above.",
						},

						"value": {
							"type": "string",
							"nullable": true,
							// TODO: "needs" to be 'boundaries' ds
							"hint": "Column header containing numerical values for indicator in linked CSV file. Percentages should be formatted as decimal numbers (i.e. 25% should be 25.0)",
						}
					}
				},

				"attributes_map": {
					"type": "array",
					"nullable": true,
					"hint": "GeoJSON file attributes configuration",
					"schema": {
						"type": "object",
						"nullable": false,
						"schema": {
							"target": {
								"type": "string",
								"required": true,
								"hint": "Display name for feature attributes in EAE",
							},
							"dataset": {
								"type": "string",
								"required": true,
								"hint": "Column header for feature attributes in linked GeoJSON file",
							}
						}
					}
				},

				"properties_search": {
					"type": "array",
					"nullable": true,
					"hint": "GeoJSON file properties search configuration",
					"schema": {
						"type": "string",
						"required": true,
						"hint": "Column header containing attributes to make searchable in EAE",
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
					"hint": "GeoJSON file features visual configuration",
					"schema": {
						"type": "object",
						"nullable": false,
						"appendable": true,
						"schema": {
							"key": {
								"type": "string",
								"required": true,
								"hint": "Key refers to the column header corresponding to the desired display attribute in the linked GeoJSONfile.",
							},
							"match": {
								"type": "regexp",
								"required": true,
								"hint": "Match refers to the corresponding value under the desired attribute column in the linked GeoJSON file.",
							},
							"radius": {
								"type": "number",
								"droppable": true,
								"required": true,
								"hint": "Refers to the radius size only for point features.",
							},
							"stroke": {
								"type": "colour",
								"droppable": true,
								"required": true,
								"hint": "Refers to the border color for point and polygon features, and to the line color for linear features.",
							},
							"stroke-width": {
								"type": "number",
								"droppable": true,
								"required": true,
								"hint": "The width of linear features, or borders for point. Does not apply for polygon features.",
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
			"nullable": true,
			"hint": "Category overrides enable users to override category-level settings to customize dataset configuration for a specific geography. To override a category-level setting, import the GeoJSON section of interest, and enter the values to modify.",
		},

		"metadata": {
			"type": "object",
			"schema": {
				"description": {
					"type": "text",
					"nullable": true,
					"hint": "Description of the dataset, methodology, and its sources",
				},

				"suggested_citation": {
					"type": "text",
					"nullable": true,
					"hint": "Suggested citation of dataset. Includes \"Available from [original link]. Accessed through Energy Access Explorer, [date]. www.energyaccessexplorer.org.\"",
				},

				"cautions": {
					"type": "text",
					"nullable": true,
					"hint": "Description of any limitations or cautions in the use of the dataset",
				},

				"spatial_resolution": {
					"type": "string",
					"nullable": true,
					"hint": "Dataset resolution (e.g. 1 km2 , sub-national, etc.)",
				},

				"download_original_url": {
					"type": "string",
					"nullable": true,
					"hint": "Online link to original dataset (optional)",
				},

				"learn_more_url": {
					"type": "string",
					"nullable": true,
					"hint": "Online link to original dataset methodology",
				},

				"license": {
					"type": "text",
					"nullable": true,
					"hint": "Dataset license for attribution requirements",
				},

				"sources": {
					"type": "text",
					"nullable": true,
					"hint": "Dataset sources"
				},

				"content_date": {
					"type": "string",
					"pattern": "^[0-9]{4}(-[0-9]{4})?$",
					"nullable": true,
					"hint": "Date of the dataset content",
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
			'raster',
			'polygons',
			'polygons-boundaries',
		].includes(m.datatype);

		m.deployments = m.deployment.join(',');

		m.inproduction = m.deployment.indexOf("production") > -1;
		m.instaging = m.deployment.indexOf("staging") > -1;
		m.intest = m.deployment.indexOf("test") > -1;
		m.intraining = m.deployment.indexOf("training") > -1;
		m.indevelopment = m.deployment.indexOf("development") > -1;

		m.ok = !m.flagged;

		return m;
	},

	"edit_modal_jobs": [
		async function(object) {
			if (!["points", "lines", "polygons"].includes(object.data.datatype)) return;

			const s = object.data.source_files.find(f => f.func === 'vectors')['endpoint'];
			const p = object.data.processed_files.find(f => f.func === 'vectors')['endpoint'];

			fetch(s).then(r => r.json())
				.then(r => object.data._selectable_attributes = Object.keys(r.features[0]['properties']));

			fetch(p).then(r => r.json())
				.then(r => object.data._selected_attributes = Object.keys(r.features[0]['properties']));
		},
		function(object, form, edit_modal) {
			const p = ce('button', ce('i', null, { class: 'bi-gem', title: 'Paver' }));
			p.onclick = _ => paver_routine(object, { edit_modal });

			const c = ce('button', ce('i', null, { class: 'bi-files', title: 'Clone' }));
			c.onclick = _ => object.clone({ name: (object.data.name || object.data.category_name) + "-clone-" + (new Date).getTime() });

			const d = qs('.actions-drawer', edit_modal.dialog);
			d.append(c, object.data.haspaver ? p : "");
		},
		function(object, form) {
			dt_external_link(object, form, m => `${external_link_base(m)}/a/?id=${m.geography_id}&inputs=${m.name}`);
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
					});
			};

			button.onclick = function() {
				dt_model_search_modal('datasets', input, null);
			};

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

				const m = new modal({
					header: "Select a segment from the category configuration",
					content: select,
					destroy: true
				});

				select.onchange = async function() {
					const k = this.value;

					const p = await fetch(dt_config.api + `/categories?id=eq.${object.data.category_id}`)
						.then(r => r.json())
						.then(r => r[0][k]);

					let co;

					try {
						co = JSON.parse(ta.value);
					} catch (e) {
						FLASH.push({
							type: "warn",
							message: "Failed to parse JSON from configuration overrides. Using an empty object.",
						});
						co = {};
					}
					co[k] = p;

					ta.value = JSON.stringify(co, null, 2);

					m.hide();
				};

				for (let k of ['analysis', 'controls', 'domain', 'domain_init', 'metadata', 'raster', 'vectors'])
					select.append(ce('option', k));

				m.show();
			};

			button.onclick = function() {
				selectkey();
			};

			ig.prepend(button);
		},
	],
};

export const collection = {
	"filters": ['name', 'deployments', 'name_long', 'category_name'],

	"endpoint": function() {
		const attrs = [
			'id',
			'datatype',
			'deployment',
			'flagged',
			'name',
			'category(*)',
			'category_id',
			'category_name',
			'geography_circle',
			'geography_id',
			'created',
			'created_by',
			'updated',
			'updated_by',
		];

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
		"td[bind=name]": ["dblclick", flag],
	},

	"parse": model.parse,

	"order": -1
};

export async function header() {
	if (geography_id) {
		const name = (await API.get('geographies', { select: ['name'], id: `eq.${geography_id}` }, { one: true }))['name'];
		return `${name} - datasets`;
	} else if (category_id) {
		const name = (await API.get('categories', { select: ['name'], id: `eq.${category_id}` }, { one: true }))['name'];
		return `${name} - datasets`;
	}
};

export async function init() {
	if (!geography_id) return true;

	function dump_table() {
		const a = ce('a', ce('i', null, { class: 'bi-download', title: 'Dump Table' }));

		a.onclick = _ => API.get('datasets', {
			select: [
				"id",
				"geography_name",
				"name_long",
				"name",
				"category_name",
				"datatype",
				"deployment",
				"flagged",
				"configuration",
				"category_overrides",
				"source_files",
				"processed_files",
				"metadata",
				"created",
				"updated",
			],
			geography_id: `eq.${geography_id}`
		}, { 'expect': "csv" }).then(r => fake_blob_download(r, `${geography_id}-dataset-dump.csv`));

		qs('body main header .actions-drawer').prepend(a);
	};

	until(_ => qs('body main header .actions-drawer')).then(dump_table);

	return true;
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

	new modal({
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

function source_files_requirements(m) {
	let n;

	switch (m.datatype) {
	case 'points':
	case 'polygons':
	case 'lines':
		n = ['vectors'];
		break;

	case 'polygons-boundaries':
		if (m.category_name === 'outline')
			n = ['vectors'];
		else
			n = ['vectors', 'csv'];
		break;

	case 'raster':
		n = ['raster'];
		break;

	case 'table':
		n = ['csv'];
		break;

	case 'raster-mutant':
	case 'polygons-fixed':
	case 'polygons-timeline':
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

			FLASH.push({
				type: 'error',
				title: `Source Files are incomplete`,
				message: `'${r}' element is missing.`
			});
		}
	}

	return ok;
};

function configuration_attributes_validate(data, newdata) {
	const config = newdata.configuration;
	const selected = data._selected_attributes;

	if (!config) return true;

	function err(p, n) {
		FLASH.push({
			type: 'error',
			title: `Configuration -> ${p}`,
			message: `'${n}' attribute does not belong.

Available values are '${selected}'`
		});
	};

	if (config.attributes_map)
		for (const n of config.attributes_map.map(a => a.dataset)) {
			if (!selected.includes(n)) {
				err("Attributes Map", n);
				return false;
			}
		}

	if (config.properties_search)
		for (const n of config.properties_search) {
			if (!selected.includes(n)) {
				err("Properties Search", n);
				return false;
			}
		}

	if (config.features_specs)
		for (const n of config.features_specs.map(a => a.key)) {
			if (!selected.includes(n)) {
				err("Features Specs", n);
				return false;
			}
		}

	return true;
};
