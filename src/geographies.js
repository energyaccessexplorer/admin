import {
	circles_user,
} from './circles.js';

export const base = 'geographies';

export const header = "Geographies";

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

export const model = {
	"main": "name",

	"schema": {
		"name": {
			"type": "string",
			"required": true,
			"hint": "The short name of the geography.",
			"label": "Geography Name"
		},

		"parent_id": {
			"type": "uuid",
			"fkey": "geographies",
			"label": "Parent Geography",
			"constraint": "parent",
			"required": false,
			"editable": false,
			"columns": ['*']
		},

		"cca3": {
			"type": "string",
			"required": true,
			"editable": false,
			"label": "CCA3 code"
		},

		"adm": {
			"type": "number",
			"required": true,
			"editable": false,
			"label": "Adm. Level"
		},

		"deployment": {
			"type": "array",
			"schema": {
				"type": "string",
				"options": ["staging", "production"],
				"required": true
			}
		},

		"envelope": {
			"type": "array",
			"validate": envelope_validate,
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
		},

		"flagged": {
			"type": "boolean"
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

				"divisions": {
					"type": "array",
					"nullable": false,
					"sortable": true,
					"collapsed": false,
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
							}
						}
					}
				},

				"timeline_dates": {
					"type": "array",
					"nullable": true,
					"needs": m => maybe(m.configuration, 'timeline'),
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
					"schema": {
						"type": "string",
						"required": true,
					}
				},

				"sort_subbranches": {
					"type": "array",
					"nullable": false,
					"schema": {
						"type": "string",
						"required": true,
					}
				},

				"sort_datasets": { // TODO: should come from dataset's name (or category_name)
					"type": "array",
					"nullable": false,
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
			dt_external_link(object, form, m => `${dt_config.production}/a/?id=${m.id}&inputs=boundaries`);
		},
	],

	"parse": function(m) {
		m.inproduction = m.deployment.indexOf("production") > -1;
		m.instaging = m.deployment.indexOf("staging") > -1;
		m.dscount = m.datasets ? m.datasets.length : "?";
		m.ok = !m.flagged;
		return m;
	}
};

export const collection = {
	"filters": ['name'],

	"endpoint": function() {
		const attrs = ['id', 'name', 'cca3', 'adm', 'deployment', 'flagged', 'configuration', 'datasets(id)', 'created', 'created_by', 'updated', 'updated_by'];

		const params = {
			"select": attrs
		};

		const url = new URL(location);
		let geography_id	= url.searchParams.get('id');
		if (geography_id)
			params['id'] = `eq.${geography_id}`;

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
