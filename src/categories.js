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

		"domain": {
			"type": "object",
			"collapsed": false,
			"nullable": true,
			"schema": {
				"min": {
					"type": "number",
					"required": true
				},
				"max": {
					"type": "number",
					"required": true
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
					"required": true
				},
				"max": {
					"type": "number",
					"required": true
				}
			}
		},

		"colorstops": {
			"type": "array",
			"collapsed": false,
			"nullable": true,
			"sortable": true,
			"schema": {
				"type": "colour"
			}
		},

		"raster": {
			"type": "object",
			"label": "Raster configuration",
			"nullable": true,
			"schema": {
				"scale": {
					"type": "select",
					"required": true,
					"options": ["", "linear", "intervals"],
					"default": "linear"
				},
				"intervals": {
					"type": "array",
					"nullable": true,
					"needs": m => maybe(m.raster, 'scale') === "intervals",
					"sortable": true,
					"schema": {
						"type": "number",
						"required": true
					}
				}
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
					"options": ["points", "polygons", "lines"]
				},
				"opacity": {
					"type": "number",
					"step": 0.01,
					"default": 1,
					"nullable": true,
					"hint": "Applies to polygons and points"
				},
				"stroke": {
					"type": "colour",
					"nullable": true
				},
				"stroke-width": {
					"type": "number",
					"nullable": false,
					"droppable": true,
					"default": 1,
					"hint": "Does not apply to polygons"
				},
				"fill": {
					"type": "colour",
					"nullable": true,
					"droppable": true,
					"hint": "Applies to polygons and points"
				},
				"radius": {
					"label": "radius",
					"type": "number",
					"hint": "Points only",
					"droppable": true,
					"nullable": false
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
					"type": "boolean"
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
					"default": ''
				},
				"weight": {
					"type": "number",
					"default": 2,
					"nullable": false
				},
				"clamp": {
					"type": "boolean",
					"default": false,
					"hint": "Clamping is explained at: \nhttps://github.com/d3/d3-scale#continuous_clamp"
				},
				"intervals": {
					"type": "array",
					"nullable": true,
					"sortable": true,
					"needs": m => maybe(m.raster, 'scale') === "intervals",
					"schema": {
						"type": "number",
						"required": true
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
								"options": ["eai", "ani", "supply", "demand"]
							},
							"invert": {
								"type": "boolean",
								"default": false
							},
							"scale": {
								"type": "select",
								"label": "functionality",
								"default": null,
								"options": ["", "linear", "key-delta", "exclusion-buffer", "inclusion-buffer", "intervals"]
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
				"dummy": {
					"type": "boolean",
					"default": true,
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
					"default": "double"
				},
				"range_steps": {
					"type": "number",
					"nullable": true,
					"default": 0
				},
				"range_label": {
					"type": "string"
				},
				"weight": {
					"type": "boolean",
					"default": true
				},
				"path": {
					"type": "array",
					"collapsed": false,
					"schema": {
						"type": "string",
						"pattern": "^[a-z][a-z0-9\-]+$",
						"required": true
					}
				}
			}
		},

		"metadata": {
			"type": "object",
			"nullable": true,
			"schema": {
				"why": {
					"type": "text",
					"nullable": true
				},
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
			qs('[name="name_long"]', form).addEventListener('input', function(e) {
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
		const attrs = ['id', 'name', 'name_long', 'unit', 'timeline', 'analysis', 'raster', 'vectors', 'csv', 'datasets(id)', 'created', 'created_by', 'updated', 'updated_by'];

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
