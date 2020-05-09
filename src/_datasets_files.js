dt_modules['_datasets_files'] = (function() {
  const url = new URL(location);

  const dataset_id = url.searchParams.get('dataset_id');
  const file_id  = url.searchParams.get('file_id');

  const model = {
    "id": ['dataset_id', 'file_id'],

    "columns": ["*"],

    "schema": {
      "dataset_id": {
        "type": "uuid",
        "fkey": "datasets",
        "label": "Dataset",
        "required": true,
        "editable": false,
        "columns": ['name']
      },

      "file_id": {
        "type": "uuid",
        "fkey": "files",
        "label": "File",
        "required": true,
        "editable": false,
        "columns": ['endpoint']
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
    "url": function() {
      let id;
      if (dataset_id) id = `dataset_id=eq.${dataset_id}`;
      else if (file_id) id = `file_id=eq.${file_id}`;

      return `/_datasets_files?${id}&select=*,file:files(*),dataset:datasets(*)`;
    },

    "parse": model.parse,

    "sort_by": 'active',

    "order": -1
  };

  return {
    base: '/_datasets_files',
    model: model,
    collection: collection,
    header: "Dataset files"
  };
})();
