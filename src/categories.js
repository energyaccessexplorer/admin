dt_modules['categories'] = (function() {
  var class_id  = location.get_query_param('id');

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

      "timeline": {
        "type": "boolean",
        "default": false
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
          },
          "factor": {
            "type": "number",
            "step": "any",
            "required": false,
            "hint": `
Example: Say the raster represents 'small' numbers with 3 decimals. But it's more economic (filesize-wise) to store 16bui than 32bf.
So the factor would be 0.001 = 10*e-3.
Windspeed is a good example of this: with factor 0.1, it stores
numbers 10 - 170 but the tool shows numbers from 1.00 - 17.00.
See also: 'precision' attribute.`
          },
          "precision": {
            "type": "number",
            "hint": "Tell the tool to show numbers with this amount of decimals. This is calculated AFTER the 'factor'."
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
          },
          "color_stops": {
            "type": "array",
            "collapsed": false,
            "schema": {
              "type": "colour"
            }
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
          "dummy": {
            "type": "boolean",
            "default": true
          }
        }
      },

      "analysis": {
        "type": "object",
        "label": "Analysis configuration",
        "nullable": true,
        "schema": {
          "weight": {
            "type": "number",
            "default": 2,
            "nullable": false
          },
          "scale": {
            "type": "select",
            "required": true,
            "options": ["linear", "key-delta", "multi-key-delta", "exclusion-buffer", "intervals"],
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
    }
  };

  var collection = {
    "url": function() {
      var attrs = 'id,name,name_long,unit,datasets(*)';

      if (class_id)
        return `/categories?id=eq.${class_id}&select=${attrs}&order=name_long.asc`;

      else
        return `/categories?select=${attrs}&order=name_long.asc`;
    }
  };

  var header = `
<th>Name</th> <th>ID</th> <th>Unit</th> <th>DS count</th>
`;

  var row = m => `
<td><a bind="edit"></a>${m.name_long}</td>
<td>${m.name}</td>
<td>${m.unit || ''}</td>
<td>${m.datasets.length || 0}</td>
`;

  var style = `
table td:nth-of-type(2) {
  font-family: monospace;
}

table td:nth-of-type(3),
table td:nth-of-type(4) {
  text-align: center;
}

details[name="color_stops"] .input-group {
  display: inline-block !important;
}`;

  return {
    base: "/categories",
    model: model,
    collection: collection,
    header: 'Categories',
    th: header,
    row: row,
    style: style,
  };
})();
