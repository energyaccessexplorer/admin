dt_modules['categories'] = (function() {
  const u = new URL(location);

  const class_id  = u.searchParams.get('id');

  var model = {
    "columns": ["*", "datasets(id)"],

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

      "raster": {
        "type": "object",
        "label": "Raster configuration",
        "nullable": true,
        "schema": {
          "scale": {
            "type": "select",
            "required": true,
            "options": ["linear", "intervals"],
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
          "color_stops": {
            "type": "array",
            "collapsed": false,
            "schema": {
              "type": "colour"
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
          "min": {
            "type": "number",
            "default": 0,
          },
          "max": {
            "type": "number",
            "default": 100,
          },
        }
      },

      "analysis": {
        "type": "object",
        "label": "Analysis configuration",
        "nullable": true,
        "schema": {
          "index": {
            "type": "string",
            "nullable": true
          },
          "weight": {
            "type": "number",
            "default": 2,
            "nullable": false
          },
          "scale": {
            "type": "select",
            "required": true,
            "options": ["linear", "key-delta", "exclusion-buffer", "intervals"],
            "default": "linear"
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
          "invert": {
            "type": "array",
            "collapsed": false,
            "schema": {
              "type": "string",
              "required": true,
              "options": ["eai", "ani", "supply", "demand"]
            }
          }
        }
      },

      "timeline": {
        "type": "object",
        "label": "Timeline configuration",
        "nullable": true,
        "schema": {
          "color_stops": {
            "type": "array",
            "collapsed": false,
            "schema": {
              "type": "colour"
            }
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
      }
    },

    "parse": m => {
      m.dscount = m.datasets.length;

      m.features = ['analysis', 'timeline', 'raster', 'vectors', 'csv']
        .reduce((a,c) => m[c] ? a + c[0] : a, "")
        .toUpperCase()

      return m;
    }
  };

  var collection = {
    "url": function() {
      var attrs = 'id,name,name_long,unit,timeline,analysis,raster,vectors,csv,datasets(id)';

      if (class_id)
        return `/categories?id=eq.${class_id}&select=${attrs}&order=name_long.asc`;

      else
        return `/categories?select=${attrs}&order=name_long.asc`;
    },

    "parse": model.parse,

    "sort_by": 'dscount',

    "reverse": true
  };

  return {
    base: "/categories",
    model: model,
    collection: collection,
    header: 'Categories',
  };
})();
