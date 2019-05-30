dt_modules['categories'] = (function() {
  var class_id  = location.get_query_param('id');

  var model = {
    "schema": {
      "name": {
        "type": "string",
        "required": true,
        "pattern": "[a-zA-Z0-9\-]+"
      },

      "name_long": {
        "type": "string",
        "required": true
      },

      "unit": {
        "type": "string",
      },

      "weight": {
        "type": "number",
        "default": 2
      },

      "heatmap": {
        "type": "object",
        "label": "Heatmap configuration",
        "nullable": true,
        "schema": {
          "number_type": {
            "type": "select", // careful here with 'type' as it should be a reserved word!
            "required": true,
            "options": ["8ui", "8si", "16ui", "16si", "32ui", "32si", "32f", "64f"],
          },
          "scale": {
            "type": "select",
            "required": true,
            "options": ["identity", "linear", "key-linear", "key-delta"],
            "default": "linear"
          },
          "clamp": {
            "type": "boolean",
            "default": false,
            "hint": "Clamping is explained at: \nhttps://github.com/d3/d3-scale#continuous_clamp"
          },
          "factor": {
            "type": "number",
            "step": "any",
            "required": false,
            "hint": `
Example: Say the heatmap represents 'small' numbers with 3 decimals. But it's more economic (filesize-wise) to store 16bui than 32bf.
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
            "count": 5,
            "schema": {
              "type": "colour"
            }
          },
          "init": {
            "type": "object",
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
          }
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
            "nullable": true,
            "hint": "Applies to polygons and points"
          },
          "stroke": {
            "type": "colour",
            "nullable": true
          },
          "width": {
            "type": "number",
            "nullable": false
          },
          "dasharray": {
            "type": "string",
            "nullable": true
          },
        }
      },

      "metadata": {
        "type": "object",
        "nullable": true,
        "schema": {
          "why": {
            "type": "text",
            "nullable": true
          }
        }
      }
    },
  };

  var collection = {
    "url": function() {
      var attrs = 'id,name,name_long,unit';

      if (class_id)
        return `/categories?id=eq.${class_id}&select=${attrs}`;

      else
        return `/categories?select=${attrs}`;
    },

    "sort_by": 'name',
  };

  var header = `
<th>Name</th> <th>Unit</th>
`;

  var row = m => `
<td><a bind="edit"></a>${m.name_long}</td>
<td>${m.unit || ''}</td>
`;

  var style = `
table td:nth-of-type(2) {
  font-family: monospace;
}

table td:nth-of-type(2),
table td:nth-of-type(3),
table td:nth-of-type(4) {
  text-align: center;
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
