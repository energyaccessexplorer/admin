dt_model_module = (function() {
  var country_id  = location.get_query_param('id');

  let ds_options = [];

  const edit_callback = model => {
    sortable('fieldset[name="category"]', { forcePlaceholderSize: true });
    sortable('fieldset[name="subcategories"]', { forcePlaceholderSize: true });
    sortable('fieldset[name="datasets"]', { forcePlaceholderSize: true });

    country_id = location.get_query_param('edit_model');

    fetch(`${dt_config.origin}/datasets?select=category_name&country_id=eq.${country_id}`)
      .then(r => r.json())
      .then(j => j.map(x => x['category_name']))
      .then(m => {
        const pattern = `(${m.join('|')})`;

        let options_html = "";
        for (n of m) options_html += `<option value="${n}">${n}</option>`;

        const dls = document.querySelectorAll(`[name="datasets"] datalist[bind="id"]`);
        for (let d of dls) d.innerHTML = options_html;

        const ins = document.querySelectorAll(`[name="datasets"] input[name="id"]`);
        for (let i of ins) i.pattern = pattern;
      });

    if (!model.get('category_tree')) {
      console.log("empty 'category_tree'. filling in with default...");

      const form = document.querySelector(`form[id="edit-form"]`)

      form.querySelector(`fieldset[name="category_tree"]`).remove();
      form.querySelector(':scope > fieldset').appendChild(
        formalize.array_fieldset(category_tree_schema, category_tree_default, "category_tree", "category_tree")
      );
    };
  };

  const category_tree_schema = {
    "type": "object",
    "schema": {
      "name": {
        "type": "string",
        "required": true,
        "options": ["demand", "supply"]
      },
      "subbranches": {
        "type": "array",
        "schema": {
          "type": "object",
          "schema": {
            "name": {
              "type": "string",
              "required": true,
            },
            "datasets": {
              "type": "array",
              "schema": {
                "type": "object",
                "schema": {
                  "id": {
                    "type": "string",
                    "options": [],
                    "required": true,
                  },
                  "invert": {
                    "type": "array",
                    "schema": {
                      "type": "string",
                      "options": ["eai", "ani", "supply", "demand"],
                      "pattern": "(eai|ani|supply|demand)",
                      "required": true,
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  const category_tree_default = [{
    "name": "demand",
    "subbranches": [{
      "name": "demographics",
      "datasets": [
        {
          "id": "population",
          "invert": []
        },
        {
          "id": "poverty",
          "invert": ["eai", "demand", "supply"]
        },
        {
          "id": "districts",
          "invert": ["ani"]
        }
      ]
    }, {
      "name": "productive-uses",
      "datasets": [
        {
          "id": "schools",
          "invert": ["eai", "ani", "demand", "supply"]
        },
        {
          "id": "health",
          "invert": ["eai", "ani", "demand", "supply"]
        },
        {
          "id": "crops",
          "invert": ["ani"]
        },
        {
          "id": "mines",
          "invert": ["eai"]
        }
      ]
    }
    ]
  }, {
    "name": "supply",
    "subbranches": [{
      "name": "resources",
      "datasets": [
        {
          "id": "ghi",
          "invert": ["ani"]
        },
        {
          "id": "windspeed",
          "invert": ["ani"]
        },
        {
          "id": "hydro",
          "invert": ["ani"]
        }
      ]
    }, {
      "name": "infrastructure",
      "datasets": [
        {
          "id": "powerplants",
          "invert": ["eai", "demand", "supply"]
        },
        {
          "id": "minigrids",
          "invert": ["eai", "demand", "supply"]
        },
        {
          "id": "transmission-lines",
          "invert": ["eai", "supply", "demand"]
        },
        {
          "id": "nighttime-lights",
          "invert": ["ani"]
        }
      ]
    }]
  }];

  var model = {
    "base": "/countries",

    "edit_callback": model => edit_callback(model),

    "schema": {
      "name": {
        "type": "string",
        "required": true,
        "hint": "The short name of the country.",
        "label": "Country name"
      },

      "ccn3": {
        "type": "number",
        "required": true,
        "editable": false,
        "label": "CCN3 code"
      },

      "cca3": {
        "type": "string",
        "required": true,
        "editable": false,
        "label": "CCA3 code"
      },

      "bounds": {
        "type": "json",
        "schema": null
      },

      "online": {
        "type": "boolean",
        "default": false,
        "label": "Show online?"
      },

      "category_tree": {
        "type": "array",
        "schema": category_tree_schema,
        "nullable": true,
      }
    }
  };

  var collection = {
    "url": function() {
      var attrs = 'id,name,ccn3,online,bounds,category_tree';

      if (country_id)
        return `/countries?id=eq.${country_id}&select=${attrs}`;

      else
        return `/countries?select=${attrs}`;
    },

    "refresh_after_new": true,

    "sort_by": '',
  };

  var header = '<th colspan="2">Name</th><th>CCN3</th><th>Datasets</th>';

  var row = `
<td bind="edit"></td>
<td <%= !online ? 'class="disabled"' : '' %>><%= name %></td>
<td><%= ccn3 %></td>
<td><a href="/?model=datasets&country_id=<%= id %>">datasets</a></td>
`;

  var style = `
table td:nth-of-type(3) {
  text-align: center;
}`;

  return {
    Model: model,
    Collection: collection,
    Header: 'Countries',
    TableHeader: header,
    TableRow: row,
    Style: style,
  };
})();
