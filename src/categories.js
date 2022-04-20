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

function raster_validate(data, newdata) {
	return and(
		raster_paver_validate(newdata),
		raster_proximity_validate(newdata),
	);
};

function raster_paver_validate(newdata) {
	if (and(maybe(newdata, 'raster', 'paver'),
	        or(newdata['vectors'], newdata['csv']))) {
		FLASH.push({
			type: 'error',
			title: "Paver configuration error",
			message: "Only pure raster categories require a paver->raster configuration",
		});
		return false;
	}

	return true;
};

function raster_proximity_validate(newdata) {
	const r = newdata['raster'];

	if (and(maybe(r, 'proximity'),
	        or(maybe(r, 'intervals'),
	           maybe(r, 'paver')))) {
		FLASH.push({
			type: 'error',
			title: "Raster configuration error",
			message: "If raster->proximity is set to 'true', no other raster configuration should be set",
		});

		return false;
	}

	return true;
};

function mutant_validate(data, newdata) {
	if (and(newdata['mutant'],
	        or(newdata['raster'],
	           newdata['vectors'],
	           newdata['csv']))) {

		FLASH.push({
			type: 'error',
			title: "Mutant configuration error",
			message: "If mutant is set to 'true', no other (raster,csv,vectors) configuration should be set",
		});

		return false;
	}

	return true;
};
