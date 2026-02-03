import modal from '../lib/modal.js';

import {
	email_user,
	external_link_base,
} from './extras.js';

import {
	server_check as paver_server_check,
	routine as paver_routine,
} from './paver.js';

import {
	and,
	ce,
	fake_blob_download,
	human_time,
	maybe,
	or,
	qs,
	until,
} from '../lib/helpers.js';

import deployment_options from './deployment-options.js';

window.email_user = email_user;
window.human_time = human_time;

const FLASH = dt.FLASH;
const API = dt.API;

const url = new URL(location);

const dataset_id = url.searchParams.get('id');
const geography_id = url.searchParams.get('geography_id');
const category_id = url.searchParams.get('category_id');

export const base = 'datasets';

export const model = {
	"main": _ => "&nbsp;",

	"base": base,

	"columns": [
		"type",
		"category_name",
		"geography_name",
	],

	"clonable_attrs": [
		'geography_id',
		'category_id',
		'vectors_configuration',
		'mutant_configuration',
		'category_overrides',
		'metadata',
		'source_files',
	],

	"schema": {
		"category_id": {
			"type":       "uuid",
			"fkey":       "categories",
			"constraint": "category",
			"required":   true,
			"label":      "Category",
			"show":       m => `<strong>${m.category_name}</strong>`,
			"columns":    ['*'],
		},

		"geography_id": {
			"type":       "uuid",
			"fkey":       "geographies",
			"constraint": "geography",
			"required":   true,
			"editable":   false,
			"label":      "Geography",
			"show":       m => `<strong>${m.geography_name}</strong>`,
			"columns":    ['*'],
		},

		"name": {
			"type":        "string",
			"label":       "Name",
			"pattern":     "^[a-z][a-z0-9\\-]+[^\\-]$",
			"placeholder": "leave blank to inherit from category",
		},

		"name_long": {
			"type":        "string",
			"label":       "Name Long",
			"placeholder": "leave blank to inherit from category",
		},

		"flagged": {
			"type": "boolean",
			"hint": "Flagging a dataset will automatically remove it from the public environment for revision. Flagged datasets can be reviewed in the protected environment. Unflagging does not add the dataset back into the public environment.",
		},

		"private": {
			"type":    "boolean",
			"hint":    "Private datasets require permissions for admins and guests to access",
			"default": false,
		},

		"deployment": {
			"type":     "array",
			"unique":   true,
			"hint":     "Select the environment(s) where the dataset will be deployed.",
			"validate": deployments_public_content_date_validate,
			"required": true,
			"nullable": false,
			"schema":   {
				"type":     "select",
				"options":  deployment_options,
				"required": true,
			},
		},

		"source_files": {
			"type":     "array",
			"nullable": false,
			"validate": source_files_validate,
			"schema":   {
				"type":   "object",
				"schema": {
					"func": {
						"type":     "select",
						"required": true,
						"options":  ["vectors", "raster", "csv"],
						"hint":     "Select the type of dataset: vector, raster, or csv",
					},

					"endpoint": {
						"type":     "string",
						"required": true,
						"pattern":  "^https://(.+)",
						"bind":     "storage",
						"callback": show_modal,
						"hint":     "Enter the secure URL that corresponds to the dataset in the cloud",
					},
				},
			},
		},

		"processed_files": {
			"type":     "array",
			"nullable": false,
			"hint":     "These fields will generate automatically with PAVER",
			"schema":   {
				"type":   "object",
				"schema": {
					"func": {
						"type":     "string",
						"required": true,
						"editable": false,
						"options":  ["vectors", "raster", "csv"],
					},

					"endpoint": {
						"type":     "string",
						"required": true,
						"editable": false,
						"pattern":  "^https://(.+)",
						"callback": show_modal,
					},
				},
			},
		},

		"vectors_configuration": {
			"type":     "object",
			"label":    "Vectors Configuration",
			"nullable": true,
			"validate": vectors_configuration_validate,
			"schema":   {
				"divisions_tier": {
					"type":     "number",
					"nullable": true,
					"default":  null,
					"required": true,
					"enabled":  m => and(m.type.match(/polygons-(valued|timeline)/), m.category_name.match(/^(timeline-)?indicator/)),
					"hint":     "Indicators: Subdivision level corresponds to the CSV. 0 = Entire geography.",
				},

				"vectors_id": {
					"hint":     "GEOJSON: Name of the features' property that will work as an identifier.",
					"type":     "string",
					"required": true,
					"enabled":  m => and(
						m.type.match(/polygons-(valued|boundaries|timeline)/),
						m.category_name !== 'outline',                             // outlines have no data
						!m.category_name.match(/^(timeline-)?indicator/),          // indicators inherit from the divisions[i]
					),
				},

				"csv_column": {
					"type":     "string",
					"nullable": true,
					"hint":     "CSV column dedicated for polygons-valued (generally indicators) and boundaries datasets",
					"enabled":  m => m.type.match(/polygons-(valued|boundaries)/),
				},

				"attributes_map": {
					"type":     "array",
					"nullable": true,
					"hint":     "GeoJSON file attributes configuration",
					"schema":   {
						"type":     "object",
						"nullable": false,
						"schema":   {
							"target": {
								"type":     "string",
								"required": true,
								"hint":     "Display name for feature attributes in EAE",
							},
							"dataset": {
								"type":     "string",
								"required": true,
								"hint":     "Column header for feature attributes in linked GeoJSON file",
							},
						},
					},
				},

				"properties_search": {
					"type":     "array",
					"nullable": true,
					"hint":     "GeoJSON file properties search configuration",
					"schema":   {
						"type":     "string",
						"required": true,
						"hint":     "Column header containing attributes to make searchable in EAE",
					},
				},

				"features_specs": {
					"type":     "array",
					"nullable": true,
					"hint":     "GeoJSON file features visual configuration",
					"schema":   {
						"type":       "object",
						"nullable":   false,
						"appendable": true,
						"schema":     {
							"key": {
								"type":     "string",
								"required": true,
								"hint":     "Key refers to the column header corresponding to the desired display attribute in the linked GeoJSONfile.",
							},
							"match": {
								"type":      "regexp",
								"droppable": true,
								"required":  true,
								"hint":      "Match refers to the corresponding value under the desired attribute column in the linked GeoJSON file.",
							},
							"range": {
								"type":      "regexp",
								"droppable": true,
								"required":  true,
								"pattern":   "^[0-9]+,[0-9]+$",
								"hint":      "Range refers to the corresponding value under the desired attribute column in the linked GeoJSON file.",
							},
							"radius": {
								"type":      "number",
								"droppable": true,
								"required":  true,
								"hint":      "Refers to the radius size. Only for point features.",
							},
							"fill": {
								"type":      "colour",
								"droppable": true,
								"required":  true,
								"hint":      "Refers to the fill colour. Use is discouraged - features might get confused with other datasets'.",
							},
							"stroke": {
								"type":      "colour",
								"droppable": true,
								"required":  true,
								"hint":      "Refers to the border color for point and polygon features, and to the line color for linear features.",
							},
							"stroke-width": {
								"type":      "number",
								"droppable": true,
								"required":  true,
								"hint":      "The width of linear features, or borders for point. Does not apply for polygon features.",
							},
							"dasharray": {
								"type":      "string",
								"droppable": true,
								"required":  true,
								"pattern":   "^[0-9]([0-9\ ]*[0-9])?$",
							},
						},
					},
				},
			},
		},

		"mutant_configuration": {
			"type":     "object",
			"label":    "Mutant Configuration",
			"nullable": true,
			"validate": mutant_configuration_validate,
			"schema":   {
				"hosts": {
					"type":     "array",
					"nullable": true,
					"schema":   {
						"type": "string",
					},
				},
			},
		},

		"category_overrides": {
			"type":     "json",
			"label":    "Category Overrides",
			"nullable": true,
			"hint":     "Category overrides enable users to override category-level settings to customize dataset configuration for a specific geography. To override a category-level setting, import the GeoJSON section of interest, and enter the values to modify.",
			"schema":   null,
		},

		"metadata": {
			"type":   "object",
			"schema": {
				"description": {
					"type":     "text",
					"nullable": true,
					"hint":     "Description of the dataset, methodology, and its sources",
				},

				"suggested_citation": {
					"type":     "text",
					"nullable": true,
					"hint":     "Suggested citation of dataset. Includes \"Available from [original link]. Accessed through Energy Access Explorer, [date]. www.energyaccessexplorer.org.\"",
				},

				"cautions": {
					"type":     "text",
					"nullable": true,
					"hint":     "Description of any limitations or cautions in the use of the dataset",
				},

				"spatial_resolution": {
					"type":     "string",
					"nullable": true,
					"hint":     "Dataset resolution (e.g. 1 km2 , sub-national, etc.)",
				},

				"download_original_url": {
					"type":     "string",
					"nullable": true,
					"hint":     "Online link to original dataset (optional)",
				},

				"learn_more_url": {
					"type":     "string",
					"nullable": true,
					"hint":     "Online link to original dataset methodology",
				},

				"license": {
					"type":     "text",
					"nullable": true,
					"hint":     "Dataset license for attribution requirements",
				},

				"sources": {
					"type":     "text",
					"nullable": true,
					"hint":     "Dataset sources",
				},

				"content_date": {
					"type":     "string",
					"pattern":  "^[0-9]{4}(-[0-9]{4})?$",
					"nullable": true,
					"hint":     "Date of the dataset content. Timeline uses this.",
				},

				"publication_date": {
					"type":     "string",
					"pattern":  "^[0-9]{4}$",
					"nullable": true,
					"hint":     "Date of the dataset's publication",
				},
			},
		},

		"created": {
			"type":     "string",
			"label":    "Created",
			"editable": false,
		},

		"created_by": {
			"type":     "string",
			"label":    "Created by",
			"editable": false,
		},

		"updated": {
			"type":     "string",
			"label":    "Last update",
			"editable": false,
		},

		"updated_by": {
			"type":     "string",
			"label":    "Last update by",
			"editable": false,
		},

		"notification_interval": {
			"type":        "string",
			"label":       "Notification Interval. Every:",
			"pattern":     "^[0-9]{1,2} (day|week|month|year)s?$",
			"placeholder": "eg: \"5 days\", \"2 weeks\", \"1 year\"",
		},
	},

	"parse": function(m) {
		//
		// raster-mutant
		// raster-timeline
		// points-timeline
		// lines-timeline
		// table
		//
		m.haspaver = [
			"lines",
			"points",
			"polygons",
			"polygons-boundaries",
			"polygons-valued",
			"polygons-timeline",
			"raster",
			"raster-valued",
		].includes(m.type);

		m.deployments = m.deployment.join(',');

		m.inpublic = m.deployment.indexOf("public") > -1;
		m.inprotected = m.deployment.indexOf("protected") > -1;
		m.intest = m.deployment.indexOf("test") > -1;
		m.intraining = m.deployment.indexOf("training") > -1;

		m.ok = !m.flagged;

		return m;
	},

	"edit_modal_jobs": [
		async function columns_and_paver(object, _, edit_modal) {
			if (!object.data.haspaver) return;

			const s = maybe(object.data.source_files?.find(f => f.func === 'vectors'), 'endpoint');

			if (s) fetch(s)
				.then(r => r.json())
				.catch(e => {
					console.warn("ERROR", e);
					console.log("zipfile? auto available_properties feature on paver will not work.");

					return { "features": [ { "properties": {} } ] };
				})
				.then(r => object.data._available_properties = Object.keys(r.features[0]['properties']));

			if (or(object.data.type === 'points', object.data.type === 'raster')) {
				const ps = maybe(object.data.source_files?.find(f => f.func === 'csv'), 'endpoint');

				if (ps) fetch(ps).then(r => r.text())
					.then(r => object.data._available_properties = r.split(/(\r\n|\n)/)[0].split(','));
			}

			const v = maybe(object.data.processed_files?.find(f => f.func === 'vectors'), 'endpoint');

			if (v) await fetch(v)
				.then(async r => {
					if (!r.ok) {
						FLASH.push({
							"type":    "error",
							"title":   "Missing vectors processed file",
							"message": v,
						});

						return null;
					}

					const d = await r.json();
					object.data._features = d.features;
					object.data._existing_properties = Object.keys(d.features[0]['properties']);
				});

			const c = maybe(object.data.source_files?.find(f => f.func === 'csv'), 'endpoint');

			if (c) await fetch(c)
				.then(async r => {
					if (!r.ok) {
						FLASH.push({
							"type":    "error",
							"title":   "Missing CSV source file",
							"message": c,
						});

						return null;
					}

					const d = await r.text();
					object.data._existing_columns = d.split(/\r?\n/)[0].split(',');
				});

			if (!await paver_server_check()) return;

			const p = ce('button', ce('i', null, { "class": 'bi-gem', "title": 'Paver' }));
			p.onclick = _ => paver_routine(object, { edit_modal });

			const d = qs('.actions-drawer', edit_modal.dialog);
			d.append(object.data.haspaver ? p : "");
		},
		function clone_button(object, form, edit_modal) {
			const c = ce('button', ce('i', null, { "class": 'bi-files', "title": 'Clone' }));
			c.onclick = _ => object.clone({ "name": (object.data.name || object.data.category_name) + "-clone-" + (new Date).getTime() });

			const d = qs('.actions-drawer', edit_modal.dialog);
			d.append(c);
		},
		function external_link(object, form) {
			dt.external_link(object, form, m => `${external_link_base(m)}/a/?id=${m.geography_id}&inputs=${m.name}`);
		},
		function metadata_import(_, form) {
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
				fetch(dt.config.api + `/datasets?select=metadata&id=eq.${this.value}`)
					.then(r => r.json())
					.then(r => {
						let metadata;
						if (!r[0] || !(metadata = r[0]['metadata'])) return;

						for (const k in metadata)
							metadatadetails.querySelector(`[name=${k}]`).value = metadata[k];
					});
			};

			button.onclick = function() {
				dt.model_search_modal('datasets', input, null);
			};

			summary.append(button);
		},
		function json_segment(object, form) {
			const ta = form.querySelector('textarea[name="category_overrides"]');
			const ig = ta.parentElement;

			const button = document.createElement('button');
			button.type = 'button';
			button.innerText = "import JSON segment";
			button.style = "float: right;";

			function selectkey() {
				const select = ce('select');

				select.append(ce('option', "", { "disabled": '', "selected": '' }));

				const m = new modal({
					"header":  "Select a segment from the category configuration",
					"content": select,
					"destroy": true,
				});

				select.onchange = async function() {
					const k = this.value;

					const p = await fetch(dt.config.api + `/categories?id=eq.${object.data.category_id}`)
						.then(r => r.json())
						.then(r => r[0][k]);

					let co;

					try {
						co = JSON.parse(ta.value);
					} catch (err) {
						console.warn(err);

						FLASH.push({
							"type":    "warn",
							"message": "Failed to parse JSON from configuration overrides. Using an empty object.",
						});
						co = {};
					}
					co[k] = p;

					ta.value = JSON.stringify(co, null, 2);

					m.hide();
				};

				for (const k of ['analysis', 'controls', 'colorstops', 'description', 'domain', 'domain_init', 'metadata', 'raster', 'unit', 'vectors'])
					select.append(ce('option', k));

				m.show();
			};

			button.onclick = function() {
				selectkey();
			};

			ig.prepend(button);
		},
		async function datasets_permissions(object, form) {
			const access = await API.get('access', {
				"user_id": `eq.${SELF.id}`,
				"circle":  `in.(${object.data.circles})`,
			});

			if (and(!access.length,
			        !['root', 'director'].includes(SELF.role))) return;

			const permissions = await API.get('datasets_permissions', {
				"select":     ["*", "user(email)"],
				"dataset_id": `eq.${object.data.id}`,
			});

			const d = ce('details');
			d.append(ce('summary', ce('label', ce('a', 'permissions', { "href": `./?model=datasets_permissions&dataset_id=${object.data.id}` }))));

			const x = ce('div', null, { "id": "badges" });
			x.append(...permissions.map(f => ce('span', `${f.user.email} (${f.type})`, { "class": "badge" })));

			d.append(x);

			if (permissions.length === 0)
				x.append(ce('p', "No users have special permissions"));

			qs('fieldset', form).append(d);
		},
		async function follows(object, form) {
			const follows = await API.get('follows', { "dataset_id": `eq.${object.data.id}` });
			const d = ce('details');
			const s = ce('summary', ce('label', ce('a', 'access', { "href": `./?model=follows&dataset_id=${object.data.id}` })));
			d.append(s);

			const x = ce('div', null, { "id": "badges" });
			x.append(...follows.map(f => ce('span', f.email, { "class": "badge" })));

			d.append(x);

			if (follows.length === 0)
				x.append(ce('p', "No followers"));

			qs('fieldset', form).append(d);
		},
	],
};

export const collection = {
	"filters": ['name', 'deployments', 'name_long', 'category_name', 'geography_name'],

	"switches": {
		"deployment": deployment_options,
	},

	"endpoint": function() {
		const select = [
			'id',
			'type',
			'deployment',
			'private',
			'flagged',
			'name',
			'category(*)',
			'category_id',
			'category_name',
			'geography_name',
			'circles',
			'geography_id',
			'content_date:metadata->>content_date',
			'created',
			'created_by',
			'updated',
			'updated_by',
		];

		const params = { select };

		if (dataset_id)
			params['id'] = `eq.${dataset_id}`;

		else if (category_id)
			params['category_id'] = `eq.${category_id}`;

		else if (geography_id) {
			params['geography_id'] = `eq.${geography_id}`;
			params['order'] = ['name.asc'];
		}

		return params;
	},

	"rowevents": {
		'[bind="name"]': ["dblclick", flag],
	},

	"parse": model.parse,

	"order": -1,
};

export async function header() {
	if (geography_id) {
		const name = (await API.get('geographies', { "select": ['name'], "id": `eq.${geography_id}` }, { "one": true }))['name'];
		return `${name} - datasets`;
	} else if (category_id) {
		const name = (await API.get('categories', { "select": ['name'], "id": `eq.${category_id}` }, { "one": true }))['name'];
		return `${name} - datasets`;
	}
};

export async function init() {
	if (!geography_id) return true;

	function dump_table() {
		const a = ce('button', ce('i', null, { "class": 'bi-download', "title": 'Dump Table' }));

		const meta = Object.keys(model.schema.metadata.schema).map(t => t+":metadata->>"+t);

		a.onclick = _ => API.get('datasets', {
			"select": [
				"id",
				"geography_name",
				"name_long",
				"name",
				"category_name",
				"type",
				"deployment",
				"flagged",
				"vectors_configuration",
				"category_overrides",
				"source_files",
				"processed_files",
				...meta,
				"created",
				"updated",
			],
			"geography_id": `eq.${geography_id}`,
		}, { "expect": "csv" }).then(r => fake_blob_download(r, `${geography_id}-dataset-dump.csv`));

		qs('body main header .actions-drawer').prepend(a);
	};

	until(_ => qs('body main header .actions-drawer')).then(dump_table);

	return true;
};

async function flag(obj) {
	await obj.fetch();

	const data = Object.assign({}, obj.data);
	data.flagged = !data.flagged;

	obj.patch(data);
};

function source_files_requirements(m) {
	let n = [];

	// points,raster are handled later
	//
	switch (m.type) {
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

	case 'raster-valued':
		n = ['raster', 'csv'];
		break;

	case 'raster':
		n = ['raster'];
		break;

	case 'table':
	case 'polygons-valued':
		n = ['csv'];
		break;

	case 'polygons-timeline':
		n = ['csv', 'vectors'];
		break;

	case 'raster-mutant':
	default:
		break;
	}

	return n;
};

async function source_files_validate(newdata, data) {
	let reqs = source_files_requirements(data);

	if (data.type === 'points') {
		const l = newdata.source_files.length;
		if (l === 0)
			reqs = ['vectors', 'csv'];
		else {
			const first = newdata.source_files.find(x => ['vectors', 'csv'].includes(x.func));

			if (first) reqs = [first.func];
			else {
				FLASH.push({
					"type":    'error',
					"title":   `Source Files are incomplete`,
					"message": `A 'vectors' or 'csv' item is required.`,
				});

				return false;
			}
		}
	}

	if (data.type === 'raster') {
		const l = newdata.source_files.length;
		if (l === 0)
			reqs = ['raster', 'csv'];
		else {
			const first = newdata.source_files.find(x => ['raster', 'csv'].includes(x.func));

			if (first) reqs = [first.func];
			else {
				FLASH.push({
					"type":    'error',
					"title":   `Source Files are incomplete`,
					"message": `A 'raster' or 'csv' item is required.`,
				});

				return false;
			}
		}
	}

	const existing = newdata['source_files'].map(s => s.func);

	let ok = true;

	for (const r of reqs) {
		if (existing.indexOf(r) < 0) {
			ok = false;

			FLASH.push({
				"type":    'error',
				"title":   `Source Files are incomplete`,
				"message": `A '${r}' item is missing.`,
			});
		}
	}

	ok = and(ok, await timeline_validate(newdata, data));
	ok = and(ok, await vectors_csv_validate(newdata, data));

	return ok;
};

async function vectors_csv_validate(newdata, data) {
	if (!maybe(data, 'category', 'csv')) return true;

	if (!data._features) return true;

	await fetch(maybe(newdata['source_files'].find(s => s.func === 'csv'), 'endpoint'))
		.then(r => r.text())
		.then(r => newdata._csv = parse_csv(r));

	if (data._features.length !== newdata._csv.length - 1) {
		FLASH.clear();

		FLASH.push({
			"type":    'error',
			"title":   "Vectors Configuration",
			"message": `CSV file rows count (${newdata._csv.length - 1}) and Vectors features count (${data._features.length}) must match`,
		});

		return false;
	}

	return true;
};

async function timeline_validate(newdata, data) {
	if (!maybe(data, 'category', 'timeline', 'enabled')) return true;

	const c = maybe(data, 'geography', 'configuration', 'timeline_dates');

	await fetch(maybe(newdata['source_files'].find(s => s.func === 'csv'), 'endpoint'))
		.then(r => r.text())
		.then(r => newdata._csv = parse_csv(r));

	const t = newdata._csv[0];

	const _c = c.filter(e => t.indexOf(e) < 0);
	const _t = t.filter(e => c.indexOf(e) < 0);

	if (_c.length > 0) {
		FLASH.clear();

		FLASH.push({
			"type":    'error',
			"title":   "Configuration",
			"message": `CSV file should have the following columns:

${_c}`,
		});

		return false;
	}

	if (_t.length > 1) {
		_t.splice(0,1);

		FLASH.clear();

		FLASH.push({
			"type":    'error',
			"title":   "Configuration",
			"message": `CSV file has some unknown columns:

${_t}`,
		});

		return false;
	}

	return true;
};

function vectors_configuration_validate(newdata, data) {
	const config = newdata.vectors_configuration;
	const selected = data._existing_properties;

	if (!data.category.vectors && !!newdata.vectors_configuration) {
		FLASH.clear();

		FLASH.push({
			"type":    'error',
			"title":   "Vectors Configuration",
			"message": `This datasets does not need any of it.

Just delete it. `,
		});

		return false;
	}

	const o = data.category_name === 'outline';

	if (config && o) {
		FLASH.clear();

		FLASH.push({
			"type":    'error',
			"title":   "Vectors Configuration",
			"message": `Outlines do not need any of it.

Just delete it. `,
		});

		return false;
	}

	if (!config) return true;

	const i = data.category.name.match(/indicator/);

	const b = data.type === 'polygons-boundaries';

	const v = data.type === 'polygons-valued';

	const t = data.type === 'polygons-timeline';

	const vb = or(v,b);

	function attrerr(p, n) {
		FLASH.clear();

		FLASH.push({
			"type":    'error',
			"title":   `Vectors Configuration -> ${p}`,
			"message": `'${n}' attribute does not belong.

Available values are: ${selected.join(', ')}`,
		});

		return false;
	};

	function colerr(p, n) {
		FLASH.clear();

		FLASH.push({
			"type":    'error',
			"title":   `Vectors Configuration -> ${p}`,
			"message": `'${n}' attribute does not belong.

Available values are: ${data._existing_columns.join(', ')}`,
		});

		return false;
	};

	function unnerr(p) {
		FLASH.clear();

		FLASH.push({
			"type":    'error',
			"title":   `Vectors Configuration -> ${p}`,
			"message": `Unnecessary attribute.

Just delete it. `,
		});

		return false;
	};

	function reqerr(p) {
		FLASH.clear();

		FLASH.push({
			"type":    'error',
			"title":   `Vectors Configuration -> ${p}`,
			"message": `Attribute is required.`,
		});

		return false;
	};

	if (config.divisions_tier) {
		if (!i) return unnerr("divisions_tier");
	}

	if (config.vectors_id) {
		if (selected && !selected.includes(config.vectors_id))
			return attrerr("vectors_id", config.vectors_id);
	}

	if (config.csv_column) {
		if (!vb)
			return unnerr("csv_columns");

		if (!data._existing_columns.includes(config.csv_column))
			return colerr("csv_column", config.csv_column);
	}
	else if (vb) return reqerr("csv_column");

	if (config.attributes_map) {
		if (vb || t) return unnerr("attributes_map");

		for (const n of config.attributes_map.map(a => a.dataset)) {
			if (selected && !selected.includes(n))
				return attrerr("attributes_map", n);
		}
	}

	if (config.properties_search) {
		if (vb || t) return unnerr("properties_search");

		for (const n of config.properties_search) {
			if (selected && !selected.includes(n))
				return attrerr("properties_search", n);
		}
	}

	if (config.features_specs) {
		if (vb || t) return unnerr("features_specs");

		for (const n of config.features_specs.map(a => a.key)) {
			if (selected && !selected.includes(n))
				return attrerr("features_specs", n);
		}
	}

	return true;
};

function deployments_public_content_date_validate(newdata) {
	if (!newdata.deployment.includes('public')) return true;

	if (!newdata.metadata.content_date?.match('^[0-9]{4}$')) {
		FLASH.push({
			"type":    'error',
			"title":   `Public Deployment + metadata -> content_date`,
			"message": `Datasets that are going into public MUST have a single-year content date.`,
		});

		return false;
	}

	return true;
};

async function features_table_modal(url) {
	const trunc = 100;

	const geojson = await fetch(url).then(r => r.json());

	const features = geojson.features.slice(0, trunc);

	const content = ce('table');
	content.className = 'feature-table';

	const c0 = maybe(features, 0, 'geometry', 'coordinates');

	const is_points = and(
		c0.length === 2,
		Number.isFinite(c0[0]),
		Number.isFinite(c0[1]),
	);

	const rows = features.map(f => {
		const columns = [];

		for (const p in f.properties) {
			if (p.match(/^__/)) continue;
			columns.push(f.properties[p]);
		}

		if (is_points) {
			columns.push(
				ce('code', "["+f.geometry.coordinates.map(x => x.toFixed(3)).join(',')+"]"),
			);
		}

		const tr = ce('tr');
		tr.append(...columns.map(c => ce('td', c)));

		return tr;
	});

	const head = ce('tr');

	for (const p in features[0].properties) {
		if (p.match(/^__/)) continue;
		head.append(ce('th', p));
	}

	if (is_points)
		head.append(ce('th', "long/lat"));

	rows.unshift(head);

	content.append(head, ...rows);

	let header = `${geojson.features.length} features.`;
	if (geojson.features.length > trunc)
		header += ` Showing ${trunc}.`;

	new modal({
		"id":      'ds-features-table',
		header,
		content,
		"destroy": true,
	}).show();
};

async function map_modal(url, gid, type) {
	const g = await dt.API.get('geographies', { "id": `eq.${gid}` }, { "one": true });
	const e = g.envelope;

	const content = document.createElement('iframe');
	content.src = `./mapbox-mini.html?endpoint=${url}&type=${type}&W=${e[0]}&S=${e[1]}&E=${e[2]}&N=${e[3]}`;
	content.width = 600;
	content.height = 600;

	new modal({
		content,
		"id":      "map-modal",
		"destroy": true,
	}).show();
};

function show_modal(data, input) {
	const type = this.type;

	const g = input.closest('.input-group');
	const l = qs('label', g);

	const gid = this.geography_id;

	function table() {
		if (data.func !== 'vectors') return "";

		const a = ce('a', ce('i', null, { "class": "bi-table" }));
		a.style = "margin-right: 1em;";
		a.onclick = _ => features_table_modal.call(this, data.endpoint);

		return a;
	};

	function image() {
		if (data.func !== 'raster') return "";

		const a = ce('a', ce('i', null, { "class": "bi-image" }));
		a.style = "margin-right: 1em;";
		a.onclick = _ => map_modal.call(this, data.endpoint, gid, "raster");

		return a;
	};

	function geojson() {
		if (data.func !== 'vectors') return "";

		let icon;
		if (type === "lines")
			icon = "align-center";
		else if (type === "points")
			icon = "geo-fill";
		else if (type === "polygons")
			icon = "hexagon";

		const a = ce('a', ce('i', null, { "class": `bi-${icon}` }));
		a.style = "margin-right: 1em;";
		a.onclick = _ => map_modal.call(this, data.endpoint, gid, type);

		return a;
	};

	l.prepend(table(), image(), geojson());
};

function parse_csv(x) {
	return x
		.split(/\r?\n/)
		.filter(r => r.trim() !== "")
		.map(e => e.split(","));
};

function mutant_configuration_validate(newdata, data) {
	const m = data.type.match(/mutant/);
	const c = newdata.mutant_configuration;

	if (!m && c) {
		FLASH.push({
			"type":    'error',
			"title":   `Mutant Configuration`,
			"message": `Unnecessary attribute.

Just delete it. `,
		});

		return false;
	}

	if (!m) return true;

	if (!c) {
		FLASH.push({
			"type":    'error',
			"title":   "Mutant Configuration",
			"message": `mutant datasets require it`,
		});

		return false;
	}

	if (!maybe(c, 'hosts', 'length')) {
		FLASH.push({
			"type":    'error',
			"title":   "Mutant Configuration",
			"message": `mutant_datasets -> hosts should have non-zero length`,
		});

		return false;
	}

	return true;
};
