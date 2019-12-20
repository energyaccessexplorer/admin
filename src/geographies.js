dt_modules['geographies'] = (function() {
  const u = new URL(location);

  let geography_id  = u.searchParams.get('id');

  let ds_options = [];

  const edit_callback = model => {
    geography_id = geography_id || u.searchParams.get('edit_model');

    sortable('[name="category"]', { forcePlaceholderSize: true });
    sortable('[name="subcategories"]', { forcePlaceholderSize: true });
    sortable('[name="datasets"]', { forcePlaceholderSize: true });

    geography_id = u.searchParams.get('edit_model');

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
  };

  var model = {
    "edit_callback": model => edit_callback(model),

    "schema": {
      "name": {
        "type": "string",
        "required": true,
        "hint": "The short name of the geography.",
        "label": "Geography Name"
      },

      "parent_id": {
        "type": "uuid",
        "fkey": "geographies",
        "label": "Parent Geography",
        "required": false,
        "editable": false,
        "columns": ['*']
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
        "label": "Adm. Level"
      },

      "online": {
        "type": "boolean",
        "default": false,
        "label": "Show online?"
      },

      "configuration": {
        "type": "json",
        "label": "Configuration",
        "nullable": true
      }
    }
  };

  var collection = {
    "url": function() {
      var attrs = 'id,name,cca3,adm,online,configuration';

      if (geography_id)
        return `/geographies?id=eq.${geography_id}&select=${attrs}`;

      else
        return `/geographies?select=${attrs}`;
    },
  };

  return {
    base: "/geographies",
    model: model,
    collection: collection,
    header: 'Geographies',
  };
})();
