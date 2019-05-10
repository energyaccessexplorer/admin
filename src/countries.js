dt_modules['countries'] = (function() {
  var country_id  = location.get_query_param('id');

  let ds_options = [];

  const edit_callback = model => {
    country_id = country_id || location.get_query_param('edit_model');

    sortable('[name="category"]', { forcePlaceholderSize: true });
    sortable('[name="subcategories"]', { forcePlaceholderSize: true });
    sortable('[name="datasets"]', { forcePlaceholderSize: true });

    country_id = location.get_query_param('edit_model');

    fetch(`${dt_config.origin}/datasets?select=category_name&country_id=eq.${model.data.id}`)
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
        "collapsed": false,
        "nullable": true,
      }
    }
  };

  var collection = {
    "url": function() {
      var attrs = 'id,name,ccn3,cca3,online,bounds,category_tree';

      if (country_id)
        return `/countries?id=eq.${country_id}&select=${attrs}`;

      else
        return `/countries?select=${attrs}`;
    },

    "sort_by": '',
  };

  var header = '<th>Name</th><th>CCN3</th><th>Datasets</th>';

  var row = m => `
<td ${!m.online ? 'class="disabled"' : ''}><a bind="edit"></a> ${m.name}</td>
<td>${m.cca3}</td>
<td><a href="/?model=datasets&country_id=${m.id}">datasets</a></td>
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
    base: "/countries",
    model: model,
    collection: collection,
    header: 'Countries',
    th: header,
    row: row,
    style: style,
  };
})();
