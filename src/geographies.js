import {
	circles_user,
} from './circles.js';

import {
	email_user,
	external_link_base,
} from './helpers.js';

import * as paver from './paver.js';

export const base = 'geographies';

export const header = "Geographies";

window.email_user = email_user;

function envelope_validate(data, newdata) {
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

	const div1 = await dt_client.get('datasets', { id: 'eq.' + dsid }, { one: true });

	paver.subgeographies(this, {
		"csv": {
			"id": maybe(div1, 'configuration', 'csv_columns', 'id'),
			"value": maybe(div1, 'configuration', 'csv_columns', 'value'),
			"endpoint": div1.source_files.find(f => f.func === 'csv').endpoint,
		},
		"vectors": {
			"id": maybe(div1, 'configuration', 'vectors_id'),
			"endpoint": div1.source_files.find(f => f.func === 'vectors').endpoint,
		}
	});
};

export const model = {
	"main": "name",

	"schema": {
		"name": {
			"type": "string",
			"required": true,
			"label": "Geography Name",
			"hint": "The short name of the geography.",
		},

		"parent_id": {
			"type": "uuid",
			"fkey": "geographies",
			"label": "Parent Geography",
			"constraint": "subgeographies:parent",
			"required": false,
			"editable": false,
			"columns": ['id', 'name'],
			"hint": "The name of the parent geography. This applies to adm. 1, 2, 3 divisions. For instance, for a adm.1 geography, the parent geography is the name of the country."
		},

		"adm": {
			"type": "number",
			"required": true,
			"editable": false,
			"label": "Adm. Level",
			"hint": "Indicates the level of an administrative boundary",
		},

		"deployment": {
			"type": "array",
			"hint": "Select the environments where the geography will be deployed",
			"schema": {
				"type": "string",
				"options": ["staging", "production"],
				"required": true
			}
		},

		"envelope": {
			"type": "array",
			"validate": envelope_validate,
			"hint": "Geography extent coordinates (4 coordinates values)",
			"schema": {
				"type": "number",
				"step": "any",
				"editable": false,
				"required": true
			}
		},

		"resolution": {
			"type": "number",
			"required": true,
			"editable": false,
			"hint": "Raster resolution in meters",
		},

		"flagged": {
			"type": "boolean",
			"hint": "Flagging a geography will automatically remove it from the production environment for revision. Flagged geographies can be reviewed in the staging environment. Unflagging does not add the geography back into the production environment",
		},

		"circle": {
			"type": "string",
			"label": "Circle",
			"pattern": "^[a-z][a-z0-9\-]+$",
			"default": "public",
			"required": true,
		},

		"configuration": {
			"type": "object",
			"label": "Configuration",
			"collapsed": false,
			"nullable": true,
			"schema": {
				"timeline": {
					"type": "boolean",
					"default": false,
				},

				"exclude_sector_presets": {
					"type": "boolean",
					"default": false,
				},

				"introduction": {
					"type": "text",
					"default": null
				},

				"divisions": {
					"type": "array",
					"nullable": false,
					"sortable": true,
					"collapsed": false,
					"hint": "The national/subnational administrative level that corresponds with the geography boundaries.",
					"schema": {
						"type": "object",
						"schema": {
							"name": {
								"type": "string",
								"required": true,
								"hint": "Provinces/Territories/States? County/Municipality?",
							},
							"dataset_id": {
								"type": "uuid",
								"nullable": true,
								"fkey": "datasets",
								"hint": "Outline or Admin boundaries dataset id",
							}
						}
					}
				},

				"timeline_dates": {
					"type": "array",
					"nullable": true,
					"needs": m => maybe(m.configuration, 'timeline'),
					"hint": "Configuration of dates for historical timeline component (optional)",
					"schema": {
						"type": "date",
						"required": true
					}
				},

				"flag": {
					"type": "object",
					"nullable": true,
					"needs": m => m.adm === 0,
					"schema": {
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
							"type": "string",
							"default": "none",
							"options": ["none", "xMaxYMax", "xMaxYMid", "xMaxYMin", "xMidYMax", "xMidYMid", "xMidYMin", "xMinYMax", "xMinYMid", "xMinYMin", ]
						},
					}
				},

				"sort_branches": {
					"type": "array",
					"nullable": false,
					"hint": "Configuration of dataset branches within the geography",
					"schema": {
						"type": "string",
						"required": true,
					}
				},

				"sort_subbranches": {
					"type": "array",
					"nullable": false,
					"hint": "Configuration of dataset sub-branches within the geography",
					"schema": {
						"type": "string",
						"required": true,
					}
				},

				"sort_datasets": { // TODO: should come from dataset's name (or category_name)
					"type": "array",
					"nullable": false,
					"hint": "Configuration of dataset order within the geography",
					"schema": {
						"type": "string",
						"required": true,
					}
				},
			}
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
	},

	"edit_modal_jobs": [
		function(object, form) {
			dt_external_link(object, form, m => `${external_link_base(m)}/a/?id=${m.id}&inputs=boundaries`);
		},
		function(object, _, modal) {
			const p = ce('button', ce('i', null, { class: 'bi-filter', title: 'Subgeographies' }));
			p.onclick = _ => generate_subgeographies.call(object.data);

			const d = qs('.actions-drawer', modal.dialog);

			const s = and(!object.data.has_subgeographies,
			              maybe(object.data, 'configuration', 'divisions', 1));

			if (s) d.append(p);
		},
	],

	"parse": function(m) {
		m.inproduction = m.deployment.indexOf("production") > -1;
		m.instaging = m.deployment.indexOf("staging") > -1;
		m.ok = !m.flagged;
		return m;
	}
};

export const collection = {
	"filters": ['name'],

	"endpoint": function() {
		const select = [
			'id',
			'name',
			'cca3',
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

function flag(obj) {
	const data = Object.assign({}, obj.data);
	data.flagged = !data.flagged;

	obj.patch(data);
};
