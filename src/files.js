const url = new URL(location);

const file_id = url.searchParams.get('id');
const dataset_id = url.searchParams.get('dataset_id');
const edit_model = url.searchParams.get('edit_model');

const model = {
  "main": 'label',

  "schema": {
    "label": {
      "type": "string",
      "default": null,
      "label": "Label",
      "required": true
    },

    "endpoint": {
      "type": "string",
      "label": "Endpoint",
      "resource": true,
      "required": true,
    },

    "comment": {
      "type": "text",
      "label": "Comment",
      "required": true
    },

    "configuration": {
      "type": "json",
      "label": "Configuration",
      "nullable": true
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
};

const collection = {
  "endpoint": function() {
    const attrs = ['id', 'label', 'endpoint', 'datasets(*)', 'created', 'created_by', 'updated', 'updated_by'];
    const params = { "select": attrs };

    if (file_id) params['id'] = `eq.${file_id}`;

    return params;
  },

  "sort_by": 'endpoint',

  "parse": function(m) {
    m.dscount = m.datasets.length;
    return m;
  }
};

const init = function() {
  if (file_id || dataset_id || edit_model) return true;

  else {
    const s = url.searchParams.get('search');
    const f = dt_model_search('files');

    document.querySelector('body > main').append(f);
    f.querySelector('select.type').style.display = 'none';
  }

  return false;
};

const header = async function() {
  let h = null;
  let str = null;
  let geography_id;

  if (!dataset_id) return "Files";

  h = [`/datasets?select=category_name,geography_id&id=eq.${dataset_id}`, 'category_name'];

  await fetch(dt_config.origin + h[0])
    .then(r => r.json())
    .then(j => {
      geography_id = j[0]['geography_id'];
      str = j[0][h[1]];
    });

  if (dataset_id)
    h = [`/geographies?select=name&id=eq.${geography_id}`, 'name'];

  await fetch(dt_config.origin + h[0])
    .then(r => r.json())
    .then(j => str = j[0][h[1]] + " " + str)

  return str + " files";
};

const base = "files";

export {
  base,
  model,
  collection,
  header,
  init,
};
