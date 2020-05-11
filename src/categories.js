dt_modules['categories'] = (function() {
  const u = new URL(location);

  const class_id  = u.searchParams.get('id');

  const model = {
    "main": "name",

    "schema": {
      "name": {
        "type": "string",
        "label": "Name",
        "editable": false,
        "required": true,
        "pattern": "^[a-z][a-z0-9\-]+$"
      },

      "name_long": {
        "type": "string",
        "label": "Long Name",
        "required": true
      },

      "unit": {
        "type": "string",
        "label": "Unit"
      },

      "colorstops": {
        "type": "array",
        "collapsed": false,
        "nullable": true,
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
            "type": "json",
            "nullable": true,
            "needs": m => m.scale === "intervals"
          },
          "precision": {
            "type": "number",
            "hint": "Tell the tool to show numbers with this amount of decimals."
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
          "init": {
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
        }
      },

      "vectors": {
        "type": "object",
        "label": "Vectors configuration",
        "nullable": true,
        "schema": {
          "shape_type": {
            "type": "select",
            "required": true,
            "options": ["points", "polygons", "lines"]
          },
          "fill": {
            "type": "colour",
            "nullable": true,
            "hint": "Applies to polygons and points"
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
            "default": 1
          },
          "width": {
            "label": "width/size",
            "type": "number",
            "nullable": false
          },
          "dasharray": {
            "type": "string",
            "nullable": true,
            "needs": m => m.shape_type === "lines",
          },
          "specs": {
            "type": "json",
            "nullable": true
          }
        }
      },

      "csv": {
        "type": "object",
        "label": "CSV configuration",
        "nullable": true,
        "schema": {
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
            "type": "json",
            "nullable": true,
            "placeholder": "[0, 10, 1000, 5000]\n\nNeeds scale == intervals",
            "needs": m => m.scale === "intervals"
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
    },
  };

  const collection = {
    "endpoint": function() {
      const attrs = ['id', 'name', 'name_long', 'unit', 'timeline', 'analysis', 'raster', 'vectors', 'csv', 'datasets(id)'];

      const params = {
        "select": attrs,
        "order": 'name_long.asc'
      };

      if (class_id) params['id'] = `eq.${class_id}`;

      return params;
    },

    "parse": m => {
      m.dscount = m.datasets.length;

      m.features = ['analysis', 'timeline', 'raster', 'vectors', 'csv']
        .reduce((a,c) => m[c] ? a + c[0] : a, "")
        .toUpperCase()

      return m;
    },

    "sort_by": 'dscount',

    "order": -1
  };

  return {
    base: "categories",
    model: model,
    collection: collection,
    header: 'Categories',
  };
})();
