const model = {
  "id": ['dataset_id', 'file_id'],

  "schema": {
    "dataset_id": {
      "type": "uuid",
      "fkey": "datasets",
      "constraint": "datasets!dataset", // AKTA! postgrest gets confused with the geogrphy_boundaries view!
      "label": "Dataset",
      "required": true,
      "editable": false,
      "columns": ['id', 'name']
    },

    "file_id": {
      "type": "uuid",
      "fkey": "files",
      "constraint": "file",
      "label": "File",
      "required": true,
      "editable": false,
      "columns": ['id', 'endpoint']
    },

    "active": {
      "type": "boolean"
    },

    "func": {
      "type": "select",
      "required": true,
      "options": ['', 'raster' ,'vectors', 'csv'],
    }
  },

  "parse": function(m) {
    for (let k in m.file) m[`_file_${k}`] = m.file[k];
    return m;
  }
};

const collection = {
  "endpoint": function() {
    const params = {
      "select": ['file_id', 'dataset_id', 'func', 'active', 'file(endpoint)']
    };

    const url = new URL(location);
    const dataset_id = url.searchParams.get('dataset_id');
    const file_id = url.searchParams.get('file_id');

    if (dataset_id) params['dataset_id'] = `eq.${dataset_id}`;
    else if (file_id) params['file_id'] = `eq.${file_id}`;

    return params;
  },

  "parse": model.parse,

  "sort_by": 'active',

  "order": -1
};

const base = '_datasets_files';

const header =  "Dataset files";

export {
  base,
  header,
  model,
  collection
};
