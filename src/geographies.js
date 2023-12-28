import modal from '../lib/modal.js';

import {
	circles_user,
} from './circles.js';

import {
	email_user,
	external_link_base,
} from './extras.js';

import * as paver from './paver.js';

import * as datasets_module from './datasets.js';

import deployment_options from './deployment-options.js';

let ADM = 0;

const FLASH = dt.FLASH;
const API = dt.API;

export const base = 'geographies';

export const header = "Geographies";

window.email_user = email_user;

export async function init() {
	const d = 'body main header .actions-drawer';
	const t = await remote_tmpl("geographies/offroad-form.html");

	function offroad() {
		const content = t.cloneNode(true);

		const arr = dt.collections.geographies.objects.slice(0)
			.sort((a,b) => a.data.name > b.data.name ? 1 : -1)
			.map(g => ce('option', g.data.name, { "value": g.data.id }));

		qs('select[name="ids"]', content).append(...arr);
		const form = qs('form', content);

		const depth = qs('[name="depth"]', form);
		depth.value = ADM;
		depth.setAttribute('min', ADM);

		const m = new modal({
			"header": ce('h3', "Offroad build"),
			content,
		});

		form.onsubmit = function(e) {
			e.preventDefault();

			fetch(`${dt.config.departer_endpoint}/build`, {
				"method":  'POST',
				"headers": {
					"Authorization": `Bearer ${localStorage.getItem('token')}`,
				},
				"body": JSON.stringify({
					"os":    qs('[name="os"]', form).value,
					"ids":   arr.filter(o => o.selected).map(o => o.value),
					"depth": +depth.value,
				}),
			})
				.then(r => r.json())
				.then(r => {
					const c = m.content;

					qs('#offroad-info', c).style.display = "";
					qs('#log', c).href = `${dt.config.departer_endpoint}/builds/${r.id}.log`;
				});
		};

		m.show();
	};

	until(_ => typeof (ADM = maybe(dt.collections, 'geographies', 'objects', 0, 'data', 'adm')) === 'number')
		.then(function() {
			const a = ce('button', ce('i', null, { "class": 'bi-signpost-split-fill', "title": 'Offroad Build' }));

			a.onclick = offroad;

			qs(d).append(a);
		});

	return true;
};

function configuration_validate(newdata, data) {
	return and(
		configuration_sort_datasets_validate(newdata, data),
	);
};

async function configuration_sort_datasets_validate(newdata, data) {
	const datasets = await dt.API.get('datasets', {
		"geography_id": `eq.${data.id}`,
		"select":       ["name", "category_name"],
	});

	const arr = maybe(newdata, 'configuration', 'sort_datasets');

	if (!maybe(arr, 'length')) return true;

	if (!arr.every(t => datasets.find(d => or(d.name === t, d.category_name === t)))) {
		FLASH.clear();

		const e = arr.find(t => !datasets.find(d => or(d.name === t, d.category_name === t)));
		FLASH.push({
			"type":    'error',
			"title":   "Configuration -> sort_datasets",
			"message": `'${e}' not found`,
		});

		return false;
	}

	return true;
};

function envelope_validate(newdata) {
	if (!maybe(newdata, 'envelope', 'length')) return true;

	const e = newdata['envelope'];

	return and(e[0] >= -180,
	           e[2] <=  180,
	           e[0] <  e[2],
	           e[1] >=  -90,
	           e[3] <=   90,
	           e[1] <  e[3]);
};

async function generate_subgeographies() {
	const dsid = maybe(this, 'configuration', 'divisions', 1, 'dataset_id');
	if (!dsid)
		throw new Error("buah!");

	const div1 = await API.get('datasets', { "id": 'eq.' + dsid }, { "one": true });

	paver.subgeographies(this, {
		"csv": {
			"id":       maybe(div1, 'configuration', 'polygons_valued_columns', 'key'),
			"value":    maybe(div1, 'configuration', 'polygons_valued_columns', 'value'),
			"endpoint": div1.source_files.find(f => f.func === 'csv').endpoint,
		},
		"vectors": {
			"id":       maybe(div1, 'configuration', 'vectors_id'),
			"endpoint": div1.source_files.find(f => f.func === 'vectors').endpoint,
		},
	});
};

function inherit_datasets() {
	API.get('datasets', {
		"select":        "*,category_name",
		"geography_id":  'eq.' + this.data.parent_id,
		"category_name": 'not.in.(indicator,timeline-indicator,boundaries,admin-tiers,outline)',
		"datatype":      'not.in.(raster-mutant)',
	}).then(async datasets => {
		const content = await remote_tmpl("geographies/paver-inherit-datasets.html");

		const m = new modal({
			content,
		});

		m.show();

		const errors = [];

		for (const d of datasets) {
			const infopre = content.querySelector('pre') || document.querySelector('pre');
			infopre.innerText = "";

			const o = new dt.object({
				"module": datasets_module,
				"data":   d,
			});

			const n = await o.clone({
				"deployment":      ['staging'],
				"processed_files": [],
				"geography_id":    this.data.id,
				"source_files":    d.source_files,
				"name":            d.name,
			});

			await n.fetch();

			const t = await paver.routine(n, { "pre": infopre });

			if (typeof t !== 'function') {
				errors.push(Object.assign(t,n));
				continue;
			}

			const x = await t();
			if (x.error) errors.push(Object.assign(x,n));
		}

		for (const e of errors)
			dt.FLASH.push({
				"type":    "error",
				"title":   maybe(e, 'data', 'category_name'),
				"message": "Routine: " + maybe(e, 'routine') + " - " + maybe(e, 'error'),
			});

		dt.FLASH.push({
			"type":    "error",
			"title":   "Inheritance errors",
			"message": "The following datasets were created and flagged.",
		});

		console.error(errors);
	});
};

function external_link(object, form) {
	dt.external_link(object, form, m => `${external_link_base(m)}/a/?id=${m.id}&inputs=boundaries`);
};

function subgeographies_button(object, _, edit_modal) {
	if (!and(!object.data.has_subgeographies, maybe(object.data, 'configuration', 'divisions', 1))) return;

	const p = ce('button', ce('i', null, { "class": 'bi-filter', "title": 'Subgeographies' }));
	p.onclick = _ => generate_subgeographies.call(object.data);

	qs('.actions-drawer', edit_modal.dialog).append(p);
};

function inherit_button(object, _, edit_modal) {
	if (!object.data.parent_id) return;

	const p = ce('button', ce('i', null, { "class": 'bi-box-arrow-in-up-right', "title": 'Inherit' }));
	p.onclick = _ => inherit_datasets.call(object);

	qs('.actions-drawer', edit_modal.dialog).append(p);
};

export const model = {
	"main": "name",

	"schema": {
		"name": {
			"type":     "string",
			"required": true,
			"label":    "Geography Name",
			"hint":     "The short name of the geography.",
		},

		"parent_id": {
			"type":       "uuid",
			"fkey":       "geographies",
			"label":      "Parent Geography",
			"constraint": "subgeographies:geographies!parent_id",
			"required":   false,
			"editable":   false,
			"columns":    ['id', 'name'],
			"hint":       "The name of the parent geography. This applies to adm. 1, 2, 3 divisions. For instance, for a adm.1 geography, the parent geography is the name of the country.",
		},

		"adm": {
			"type":     "number",
			"required": true,
			"editable": false,
			"label":    "Adm. Level",
			"hint":     "Indicates the level of an administrative boundary",
		},

		"deployment": {
			"type":   "array",
			"hint":   "Select the environments where the geography will be deployed",
			"schema": {
				"type":     "string",
				"options":  deployment_options,
				"required": true,
			},
		},

		"envelope": {
			"type":     "array",
			"validate": envelope_validate,
			"hint":     "Geography extent coordinates (4 coordinates values)",
			"schema":   {
				"type":     "number",
				"step":     "any",
				"editable": false,
				"required": true,
			},
		},

		"resolution": {
			"type":     "number",
			"required": true,
			"editable": false,
			"hint":     "Raster resolution in meters",
		},

		"flagged": {
			"type": "boolean",
			"hint": "Flagging a geography will automatically remove it from the production environment for revision. Flagged geographies can be reviewed in the staging environment. Unflagging does not add the geography back into the production environment",
		},

		"circle": {
			"type":     "string",
			"label":    "Circle",
			"pattern":  "^[a-z][a-z0-9\\-]+[^\\-]$",
			"default":  "public",
			"required": true,
		},

		"configuration": {
			"type":      "object",
			"label":     "Configuration",
			"collapsed": false,
			"nullable":  true,
			"validate":  configuration_validate,
			"schema":    {
				"timeline": {
					"type":    "boolean",
					"default": false,
				},

				"exclude_sector_presets": {
					"type":    "boolean",
					"default": false,
				},

				"filtered_geographies": {
					"type":    "boolean",
					"default": true,
					"hint":    "Whether to enable the filtered tab on the tool for this geography",
				},

				"introduction": {
					"type":    "text",
					"default": null,
				},

				"divisions": {
					"type":      "array",
					"nullable":  false,
					"sortable":  true,
					"collapsed": false,
					"hint":      "The national/subnational administrative level that corresponds with the geography boundaries.",
					"schema":    {
						"type":   "object",
						"schema": {
							"name": {
								"type":     "string",
								"required": true,
								"hint":     "Provinces/Territories/States? County/Municipality?",
							},
							"dataset_id": {
								"type":     "uuid",
								"nullable": true,
								"fkey":     "datasets",
								"hint":     "Outline or Admin boundaries dataset id",
							},
						},
					},
				},

				"timeline_dates": {
					"type":     "array",
					"nullable": true,
					"enabled":  m => maybe(m.configuration, 'timeline'),
					"hint":     "Configuration of dates for historical timeline component (optional)",
					"schema":   {
						"type":     "date",
						"required": true,
					},
				},

				"flag": {
					"type":     "object",
					"nullable": true,
					"enabled":  m => m.adm === 0,
					"schema":   {
						"x": {
							"type": "number",
						},
						"y": {
							"type": "number",
						},
						"width": {
							"type": "number",
						},
						"height": {
							"type": "number",
						},
						"aspect-ratio": {
							"type":    "string",
							"default": "none",
							"options": ["none", "xMaxYMax", "xMaxYMid", "xMaxYMin", "xMidYMax", "xMidYMid", "xMidYMin", "xMinYMax", "xMinYMid", "xMinYMin" ],
						},
					},
				},

				"sort_branches": {
					"type":     "array",
					"nullable": true,
					"sortable":  true,
					"hint":     "Configuration of dataset branches within the geography",
					"schema":   {
						"type":     "string",
						"required": true,
					},
				},

				"sort_subbranches": {
					"type":     "array",
					"nullable": true,
					"sortable":  true,
					"hint":     "Configuration of dataset sub-branches within the geography",
					"schema":   {
						"type":     "string",
						"required": true,
					},
				},

				"sort_datasets": {
					"type":     "array",
					"nullable": true,
					"sortable":  true,
					"hint":     "Configuration of dataset order within the geography",
					"schema":   {
						"type":     "string",
						"required": true,
					},
				},
			},
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
	},

	"edit_modal_jobs": [
		external_link,
		subgeographies_button,
		inherit_button,
	],

	"after_patch": function(m, changes) {
		if (!changes['deployment']) return;

		const [before, after] = changes['deployment'];

		const c = `DEPLOYMENTS CHANGED

Select 'OK' if ALL of ${m.data.name}'s the __datasets__ deployments be updated to match.

Select 'Cancel' if you are unsure or if someone has already customised some datasets to appear in certain deployments but not others.`;

		if (after && (before.length !== after.length) && confirm(c))
			dt.API.patch('datasets', { "geography_id": `eq.${m.data.id}` }, { "payload": { "deployment": after } });

		console.warn(m, changes);
	},

	"parse": function(m) {
		m.inproduction = m.deployment.indexOf("production") > -1;
		m.instaging = m.deployment.indexOf("staging") > -1;
		m.intest = m.deployment.indexOf("test") > -1;
		m.intraining = m.deployment.indexOf("training") > -1;
		m.indev = m.deployment.indexOf("dev") > -1;

		m.deployments = m.deployment.join(',');

		m.ok = !m.flagged;

		return m;
	},
};

export const collection = {
	"filters": ['name'],

	"switches": {
		"deployment": deployment_options,
	},

	"endpoint": function() {
		const select = [
			'id',
			'name',
			'adm',
			'deployment',
			'flagged',
			'configuration',
			'has_subgeographies',
			'created',
			'created_by',
			'updated',
			'updated_by',
		];

		const params = { select };
		const url = new URL(location);
		const geography_id = url.searchParams.get('id');
		let adm = url.searchParams.get('adm');
		const parent_id = url.searchParams.get('parent_id');

		if (geography_id)
			params['id'] = `eq.${geography_id}`;
		else if (parent_id)
			params['parent_id'] = `eq.${parent_id}`;
		else
			params['adm'] = `eq.${adm ?? 0}`;

		if (parent_id)
			model['schema']['parent_id']['required'] = true;

		const circles = circles_user();
		if (circles)
			params['circle'] = `in.(${circles})`;

		return params;
	},

	"rowevents": {
		"td[bind=name]": ["dblclick", flag],
	},

	"parse": model.parse,
};

async function flag(obj) {
	await obj.fetch();

	const data = Object.assign({}, obj.data);
	data.flagged = !data.flagged;

	obj.patch(data);
};
