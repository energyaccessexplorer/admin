export const base = '_datasets_files';

export const header =  "Dataset files";

export const model = {
  "main": m => `${m.dataset.geography_name} - ${m.dataset.category.name_long} (${m.dataset.category.name})`,

  "pkey": ['dataset_id', 'file_id'],

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

export const collection = {
  "endpoint": function() {
    const params = {
      "select": [
        'file_id',
        'dataset_id',
        'func',
        'active',
        'file(endpoint)',
        'dataset:datasets(geography_name, category(name, name_long))'
      ]
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
