const url = new URL(location);

const dataset_id = url.searchParams.get('id');
const geography_id = url.searchParams.get('geography_id');
const category_id = url.searchParams.get('category_id');

const model = {
  "main": m => m.category_name + " - " + m.geography_name,

  "external_url": m => `${dt_config.production}/tool/a/?id=${m.geography_id}&inputs=${m.name}`,

  "columns": ["category_name", "geography_name"],

  "schema": {
    "category_id": {
      "type": "uuid",
      "fkey": "categories",
      "required": true,
      "label": "Category",
      "columns": ['*']
    },

    "geography_id": {
      "type": "uuid",
      "fkey": "geographies",
      "required": true,
      "editable": false,
      "label": "Geography",
      "columns": ['*']
    },

    "name": {
      "type": "string",
      "label": "Name",
      "pattern": "^[a-z][a-z0-9\-]+$",
      "placeholder": "leave blank to inherit from category"
    },

    "name_long": {
      "type": "string",
      "label": "Name Long",
      "placeholder": "leave blank to inherit from category"
    },

    "online": {
      "type": "boolean",
      "label": "Show Online",
      "default": false,
    },

    "circle": {
      "type": "string",
      "label": "Circle",
      "pattern": "^[a-z][a-z0-9\-]+$",
      "default": "public",
    },

    "pack": {
      "type": "string",
      "label": "Pack",
      "pattern": "^[a-z][a-z0-9\-]+$",
      "default": "all",
    },

    "configuration": {
      "type": "json",
      "label": "Configuration",
      "nullable": true
    },

    "category_overrides": {
      "type": "json",
      "label": "Category Overrides",
      "nullable": true
    },

    "presets": {
      "type": "array",
      "nullable": true,
      "schema": {
        "type": "object",
        "schema": {
          "name": {
            "type": "string",
            "required": true,
            "options": ["market", "planning", "investment"]
          },
          "weight": {
            "type": "number",
            "required": true,
            "default": 2
          },
          "min": {
            "type": "number",
            "default": 0
          },
          "max": {
            "type": "number",
            "default": 100
          }
        }
      }
    },

    "metadata": {
      "type": "object",
      "schema": {
        "description": {
          "type": "text",
          "nullable": true
        },
        "suggested_citation": {
          "type": "text",
          "nullable": true
        },
        "cautions": {
          "type": "text",
          "nullable": true
        },
        "spatial_resolution": {
          "type": "string",
          "nullable": true
        },
        "download_original_url": {
          "type": "string",
          "nullable": true
        },
        "learn_more_url": {
          "type": "string",
          "nullable": true
        },
        "license": {
          "type": "text",
          "nullable": true
        },
        "sources": {
          "type": "text",
          "nullable": true
        },
        "content_date": {
          "type": "string",
          "pattern": "^[0-9]{4}(-[0-9]{4})?$",
          "nullable": true
        }
      }
    }
  },

  "parse": function(m) {
    m.file_count = m.files ? m.files.length : 0;
    return m;
  },

  "edit_callback": function(model, form) {
    const metadatadetails = form.querySelector('details[name="metadata"]');

    const button = document.createElement('button');
    button.type = 'button';
    button.innerText = "import metadata";
    button.style = "float: right;";

    const input = document.createElement('input');
    input.type = 'hidden';
    input.onchange = function() {
      fetch(dt_config.origin + `/datasets?select=metadata&id=eq.${this.value}`)
        .then(r => r.json())
        .then(r => {
          let metadata;
          if (!r[0] || !(metadata = r[0]['metadata'])) return;

          for (let k in metadata)
            metadatadetails.querySelector(`[name=${k}]`).value = metadata[k];
        })
    };

    button.onclick = function() {
      dt_model_search_modal('datasets', input, null);
    };

    metadatadetails.querySelector('summary').append(button);
  }
};

const collection = {
  "filters": ['name', 'category_name'],

  "endpoint": function() {
    const attrs = ['id', 'online', 'name', 'category_name', 'circle', 'pack', 'geography_id', 'files(id)'];
    const params = { "select": attrs };

    if (dataset_id)
      params['id'] = `eq.${dataset_id}`;

    else if (geography_id) {
      params['geography_id'] = `eq.${geography_id}`;
      params['order'] = ['online.desc', 'name.asc'];
    }

    else if (category_id)
      params['category_id'] = `eq.${category_id}`;

    return params;
  },

  "parse": model.parse,

  "order": -1
};

const header = async function() {
  let str = null;
  let sufix = null;
  let gid = geography_id;

  const geoobj = _ => dt_collections["datasets"][0].array[0];

  if (!gid) {
    await until(geoobj)
      .then(_ => {
        const g = geoobj();

        sufix = g['category_name'];
        gid = g['geography_id'];
      });
  }

  const h = [`/geographies?select=name&id=eq.${gid}`, 'name'];

  if (!gid) return "";

  await fetch(dt_config.origin + h[0])
    .then(r => r.json())
    .then(j => str = j[0][h[1]]);

  return str + " - " + (sufix ? sufix : "datasets");
};

const wants = {
  "dt_external": _ => null,
};

dt_modules['datasets'] = {
  base: "datasets",
  model,
  collection,
  header,
  wants,
};
