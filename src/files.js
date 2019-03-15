dt_modules['files'] = (function() {
  var file_id = location.get_query_param('id');
  var dataset_id = location.get_query_param('dataset_id');

  window._storage_prefix = "";

  var model = {
    "schema": {
      "dataset_id": {
        "type": "uuid",
        "fkey": "datasets",
        "required": true,
        "editable": false,
        "columns": ['*']
      },

      "test": {
        "type": "boolean",
        "default": true,
      },

      "label": {
        "type": "string",
        "default": null,
      },

      "endpoint": {
        "type": "string",
        "resource": true,
        "required": true,
      },

      "comment": {
        "type": "text",
        "required": true
      }
    }
  };

  var collection = {
    "url": function() {
      var attrs = 'id,dataset_id,test,endpoint,comment,label';

      if (file_id)
        return `/files?id=eq.${file_id}&select=${attrs}`;

      else if (dataset_id)
        return `/files?dataset_id=eq.${dataset_id}&select=${attrs}`;

      else
        return `/files?select=${attrs}`;
    },

    "sort_by": 'endpoint',
  };

  var header = `
<th>Label</th>
<th>Endpoint</th>
`;

  var row = m => `
<td><a bind="edit"></a> ${m.label}</td>
<td>${m.endpoint}</td>
`;

  var style = `
table td:nth-of-type(1),
table td:nth-of-type(2) {
  font-family: monospace;
}`;

  return {
    base: "/files",
    model: model,
    collection: collection,
    header: 'Files',
    th: header,
    row: row,
    style: style,
  };
})();
