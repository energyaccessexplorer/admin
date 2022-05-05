import {
	email_user,
} from './extras.js';

export const base = 'categories';

export const header = "Categories";

export const model = {
	"main": "name",

	"schema": {
		"name_long": {
			"type": "string",
			"label": "Long Name",
			"required": true
		},

		"name": {
			"type": "string",
			"label": "Name",
			"editable": false,
			"required": true,
			"pattern": "^[a-z][a-z0-9\-]+$"
		},

		"unit": {
			"type": "string",
			"label": "Unit"
		},

		"mutant": {
			"type": "boolean",
			"default": false,
			"validate": mutant_validate,
		},

		"description": {
			"type": "text",
			"nullable": true,
			"label": "Description",
			"hint": "Description of the category and its use",
		},

		"domain": {
			"type": "object",
			"nullable": true,
			"schema": {
				"min": {
					"type": "number",
					"required": true,
					"hint": "minimum category value",
				},
				"max": {
					"type": "number",
					"required": true,
					"hint": "maximum category value",
				}
			}
		},

		"domain_init": {
			"type": "object",
			"collapsed": false,
			"nullable": true,
			"validate": domain_init_validate,
			"schema": {
				"min": {
					"type": "number",
					"required": true,
					"hint": "Preset minimum initialization value (optional)",
				},
				"max": {
					"type": "number",
					"required": true,
					"hint": "Preset maximum initialization value (optional)"
				}
			}
		},

		"colorstops": {
			"type": "array",
			"nullable": true,
			"sortable": true,
			"hint": "Configuration of colorstops. Left first (top). Right last (bottom)",
			"schema": {
				"type": "colour",
			}
		},

		"raster": {
			"type": "object",
			"label": "Raster configuration",
			"nullable": true,
			"validate": raster_validate,
			"schema": {
				"proximity": {
					"type": "boolean",
					"default": true,
				},
				"intervals": {
					"type": "array",
					"nullable": true,
					"sortable": true,
					"hint": "Configuration of intervals for a TIFF file",
					"schema": {
						"type": "number",
						"required": true
					}
				},
				"paver": {
					"type": "object",
					"nullable": true,
					"schema": {
						"resample": {
							"type": "select",
							"required": true,
							"hint": "Resample setting for PAVER processing",
							"options": [
								"average",
								"sum",
								"near",
								"max",
								"min",
								"med",
								"bilinear",
								"cubic",
								"cubicspline",
								"lanczos",
								"rms",
								"mode",
								"q1",
								"q3",
							],
							"default": "average",
						},
						"numbertype": {
							"type": "select",
							"required": true,
							"hint": "Number type setting for PAVER processing",
							"options": [
								"Byte",
								"UInt16",
								"Int16",
								"UInt32",
								"Int32",
								"Float32",
								"Float64",
								"CInt16",
								"CInt32",
								"CFloat32",
								"CFloat64",
							],
							"default": "Int16"
						},
						"nodata": {
							"type": "number",
							"required": true,
							"default": -1,
							"hint": "No data values setting for PAVER processing",
						}
					}
				},
			}
		},

		"vectors": {
			"type": "object",
			"label": "Vectors configuration",
			"nullable": true,
			"appendable": true,
			"validate": vectors_validate,
			"schema": {
				"shape_type": {
					"type": "select",
					"required": true,
					"options": ["points", "polygons", "lines"],
					"hint": "GeoJSON file shape type",
				},
				"opacity": {
					"type": "number",
					"step": 0.01,
					"default": 1,
					"nullable": true,
					"hint": "Applies to polygons and points",
				},
				"stroke": {
					"type": "colour",
					"nullable": true,
					"hint": "Refers to the border color for point and polygon features, and to the line color for linear features.",
				},
				"stroke-width": {
					"type": "number",
					"nullable": false,
					"droppable": true,
					"default": 1,
					"hint": "The width of linear features, or borders for point. Does not apply for polygon features.",
				},
				"fill": {
					"type": "colour",
					"nullable": true,
					"droppable": true,
					"hint": "Applies to polygons and points",
				},
				"radius": {
					"label": "radius",
					"type": "number",
					"droppable": true,
					"nullable": false,
					"hint": "Refers to the radius size only for point features.",
				},
				"dasharray": {
					"type": "string",
					"nullable": true,
					"droppable": true,
					"hint": "Lines only",
					"needs": m => maybe(m.vectors, 'shape_type') === "lines",
				},
			}
		},

		"csv": {
			"type": "object",
			"label": "CSV configuration",
			"nullable": true,
			"schema": {
				"enabled": {
					"type": "boolean",
					"hint": "If enabled category includes a CSV file",
				}
			}
		},

		"analysis": {
			"type": "object",
			"label": "Analysis configuration",
			"nullable": true,
			"schema": {
				"index": {
					"type": "select",
					"required": true,
					"label": "index",
					"options": ['', "ani", "eai", "demand", "supply"],
					"default": '',
					"hint": "Analysis index of the category",
				},

				"weight": {
					"type": "number",
					"default": 2,
					"min": 1,
					"max": 5,
					"nullable": false,
					"hint": "Level of importance of the dataset in analysis",
				},

				"intervals": {
					"type": "array",
					"nullable": true,
					"sortable": true,
					"schema": {
						"type": "number",
						"required": true,
					}
				},

				"indexes": {
					"type": "array",
					"collapsed": false,
					"schema": {
						"type": "object",
						"collapsed": false,
						"nullable": false,
						"schema": {
							"index": {
								"type": "string",
								"required": true,
								"options": ["eai", "ani", "supply", "demand"],
								"hint": "Other analysis indexes that apply",
							},
							"invert": {
								"type": "boolean",
								"default": false,
								"hint": "If a higher value of the select category, imply a lower value for the index, then enable \"invert\". For instance",
							},
							"scale": {
								"type": "select",
								"label": "functionality",
								"default": null,
								"options": ["", "linear", "key-delta", "exclusion-buffer", "inclusion-buffer", "intervals"],
								"hint": "Functionality of index according to data type and preference",
							}
						}
					}
				}
			}
		},

		"timeline": {
			"type": "object",
			"label": "Timeline configuration",
			"nullable": true,
			"schema": {
				"enabled": {
					"type": "boolean",
					"default": true,
					"hint": "For data with historical timeline component (optional)",
				},
			}
		},

		"controls": {
			"type": "object",
			"nullable": true,
			"schema": {
				"range": {
					"type": "select",
					"options": ["", "single", "double"],
					"default": "double",
					"hint": "Configuration of scroll range type",
				},
				"range_steps": {
					"type": "number",
					"nullable": true,
					"default": 0,
					"hint": "Configuration of scroll range steps (optional)",
				},
				"range_label": {
					"type": "string",
					"hint": "Configuration of scroll range label",
				},
				"weight": {
					"type": "boolean",
					"default": true,
				},
				"path": {
					"type": "array",
					"collapsed": false,
					"hint": "Branch and Subbranch of the category",
					"schema": {
						"type": "string",
						"pattern": "^[a-z][a-z0-9\-]+$",
						"required": true,
					}
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

	"new_modal_jobs": [
		function(_, form) {
			const l = qs('[name="name"]', form);
			qs('[name="name_long"]', form).addEventListener('input', function() {
				l.value = this.value
					.toLowerCase()
					.replace(/[\ ]/g, '-')
					.replace(/[\.\,]/g, '');
			});
		}
	]
};

export const collection = {
	"filters": ['name', 'name_long', 'unit', 'features'],

	"endpoint": function() {
		const attrs = [
			'id',
			'name',
			'name_long',
			'unit',
			'datatype',
			'timeline',
			'analysis',
			'raster',
			'vectors',
			'csv',
			'datasets(id)',
			'created',
			'created_by',
			'updated',
			'updated_by',
		];

		const params = {
			"select": attrs,
			"order": 'name_long.asc'
		};

		const url = new URL(location);
		const class_id	= url.searchParams.get('id');
		if (class_id) params['id'] = `eq.${class_id}`;

		return params;
	},

	"parse": function(m) {
		m.dscount = m.datasets.length;

		const sym = ['analysis', 'timeline', 'raster', 'vectors', 'csv']
			.reduce((a,c) => m[c] ? a + c[0] : a, "")
			.toUpperCase();

		m.features = sym + "-" + (m.vectors ? m.vectors.shape_type : "raster") + "-" + (m.analysis ? m.analysis.index : "") + "-" + ((m.analysis && m.analysis.indexes) ? m.analysis.indexes.map(i => i.index).sort() : 0);

		return m;
	},

	"sort_by": 'dscount',

	"order": -1
};

window.email_user = email_user;

const FLASH = dt.FLASH;

function err(title, message) {
	FLASH.clear();

	FLASH.push({
		type: 'error',
		title,
		message,
	});
};

function within(i,d) {
	if (Array.isArray(i))
		i = { "min": i[0], "max": i[i.length-1]};

	if (Array.isArray(d))
		d = { "min": d[0], "max": d[d.length-1]};

	return or(
		and(d['min'] < d['max'], and(i['min'] >= d['min'], i['max'] <= d['max'])),
		and(d['min'] > d['max'], and(i['min'] <= d['min'], i['max'] >= d['max'])),
	);
};

function domain_init_validate(newdata, data) {
	return and(
		domain_init_containment_validate(newdata, data),
		domain_init_slope_validate(newdata, data),
	);
}

function domain_init_slope_validate(newdata) {
	const d = newdata['domain'];
	const i = newdata['domain_init'];

	if (!i) return true;

	if (or(
		and(d['min'] < d['max'], i['min'] < i['max']),
		and(d['min'] > d['max'], i['min'] > i['max']),
	)) return true;

	err(
		"Paver configuration error",
		"Domain and domain init must be both strictly decreasing or both strictly increasing",
	);

	return false;
};

function domain_init_containment_validate(newdata) {
	const d = newdata['domain'];
	const i = newdata['domain_init'];

	if (!i) return true;

	if (within(i,d)) return true;

	err(
		"Paver configuration error",
		"Domain init values must be within domain values",
	);

	return false;
};

function raster_validate(newdata) {
	return and(
		raster_paver_validate(newdata),
		raster_proximity_validate(newdata),
		raster_intervals_validate(newdata),
		raster_colorstops_validate(newdata),
	);
};

function raster_paver_validate(newdata) {
	if (and(maybe(newdata, 'raster', 'paver'),
	        or(newdata['vectors'], newdata['csv']))) {
		err(
			"Paver configuration error",
			"Only pure raster categories require a paver->raster configuration",
		);

		return false;
	}

	return true;
};

function raster_proximity_validate(newdata) {
	const r = newdata['raster'];

	if (and(maybe(r, 'proximity'),
	        or(maybe(r, 'intervals'),
	           maybe(r, 'paver')))) {
		err(
			"Raster configuration error",
			"If raster->proximity is set to 'true', no other raster configuration should be set",
		);

		return false;
	}

	return true;
};

function raster_intervals_validate(newdata) {
	const r = newdata['raster']['intervals'];

	if (!r) return true;

	if (!or(
		r.every((v,i,a) => !i || a[i-1] > v),
		r.every((v,i,a) => !i || a[i-1] < v),
	)) {
		err(
			"Raster configuration error",
			"Raster->invervals should be strictly increasing or strictly decreasing",
		);

		return false;
	}

	if (!within(r, newdata['domain'])) {
		err(
			"Raster configuration error",
			"Raster->invervals first and last values should be within the domain",
		);

		return false;
	}

	return true;
};

function raster_colorstops_validate(newdata) {
	if (newdata.raster) return true;

	const r = newdata['colorstops'];
	const i = maybe(newdata, 'raster', 'intervals');

	if (r && !i) return true;

	const diff = i.length - r.length;

	if (and(-1 < diff, diff < 3)) return true;

	err(
		"Raster configuration error",
		"Colorstops length must be greater or equal to the raster->intervals length and differ by less that 2",
	);

	return false;
};

function vectors_validate(newdata) {
	return and(
		vectors_shape_type_requirements_validate(newdata)
	);
};

function vectors_shape_type_requirements_validate(newdata) {
	const v = newdata['vectors'];
	const t = v['shape_type'];

	const base = ['shape_type', 'opacity', 'stroke'];
	let n, m;

	switch (t) {
	case "points":
		n = ['radius', 'fill'];
		m = "Vectors of shape type 'points' must include radius and fill";
		break;

	case "polygons":
		n = ['fill'];
		m = "Vectors of shape type 'polygons' must include fill";
		break;

	case "lines":
		n = ['stroke-width'];
		m = "Vectors of shape type 'lines' must include stroke and stroke-width";
		break;

	default:
		n = [];
		m = null;
		break;
	}

	n = base.concat(n);

	const keys = Object.keys(v);
	if (n.every(x => keys.includes(x))) return true;

	err("Vectors configuration error", m);

	return false;
};

function mutant_validate(newdata) {
	if (and(newdata['mutant'],
	        or(newdata['raster'],
	           newdata['vectors'],
	           newdata['csv']))) {
		err(
			"Mutant configuration error",
			"If mutant is set to 'true', no other (raster,csv,vectors) configuration should be set",
		);

		return false;
	}

	return true;
};
