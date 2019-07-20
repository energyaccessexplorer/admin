dt_modules['geographies'] = (function() {
  var geography_id  = location.get_query_param('id');

  let ds_options = [];

  const edit_callback = model => {
    geography_id = geography_id || location.get_query_param('edit_model');

    sortable('[name="category"]', { forcePlaceholderSize: true });
    sortable('[name="subcategories"]', { forcePlaceholderSize: true });
    sortable('[name="datasets"]', { forcePlaceholderSize: true });

    geography_id = location.get_query_param('edit_model');

    fetch(`${dt_config.origin}/datasets?select=category_name&geography_id=eq.${model.data.id}`)
      .then(r => r.json())
      .then(j => j.map(x => x['category_name']))
      .then(m => {
        let options_html = "";
        for (n of m) options_html += `<option value="${n}">${n}</option>`;

        const dls = document.querySelectorAll(`[name="datasets"] datalist[bind="id"]`);
        for (let d of dls) d.innerHTML = options_html;

        const ins = document.querySelectorAll(`[name="datasets"] input[name="id"]`);

        if (m.length) {
          const pattern = m.join('|');
          for (let i of ins) i.pattern = `(${pattern})`;
        }
      });

    if (!model.data['category_tree']) {
      console.log("empty 'category_tree'. filling in with default...");

      const form = document.querySelector(`dialog[id="edit-modal"] form`);

      const ct = form.querySelector(`[name="category_tree"]`);
      if (ct) ct.remove();

      form.querySelector(':scope > fieldset').appendChild(
        formalize.array_fieldset(
          {
            "type": "array",
            "schema": category_tree_schema,
          },
          category_tree_default,
          "category_tree",
          "category_tree"
        )
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
    "edit_callback": model => edit_callback(model),

    "schema": {
      "name": {
        "type": "string",
        "required": true,
        "hint": "The short name of the geography.",
        "label": "Geography name"
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
        "label": "Administrative Boundary level"
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
        "type": "json",
        "schema": category_tree_schema,
        "collapsed": false,
        "nullable": true,
      },

      "configuration": {
        "type": "json",
        "schema": null
      }
    }
  };

  var collection = {
    "url": function() {
      var attrs = 'id,name,cca3,adm,online,bounds,category_tree';

      if (geography_id)
        return `/geographies?id=eq.${geography_id}&select=${attrs}`;

      else
        return `/geographies?select=${attrs}`;
    },

    "sort_by": '',
  };

  var header = '<th>Name</th><th>cca3</th><th>adm</th><th>Datasets</th>';

  var row = m => `
<td ${!m.online ? 'class="disabled"' : ''}><a bind="edit"></a> ${m.name}</td>
<td>${m.cca3}</td>
<td>${m.adm}</td>
<td><a href="/?model=datasets&geography_id=${m.id}">datasets</a></td>
`;

  var style = `
table td:nth-of-type(3),
table td:nth-of-type(2) {
  text-align: center;
}

table td:nth-of-type(2) {
  font-family: monospace;
}`;

  return {
    base: "/geographies",
    model: model,
    collection: collection,
    header: 'Geographies',
    th: header,
    row: row,
    style: style,
  };
})();
