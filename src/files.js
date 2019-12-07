dt_modules['files'] = (function() {
  var file_id = location.get_query_param('id');
  var dataset_id = location.get_query_param('dataset_id');

  window._storage_prefix = "";

  var model = {
    "main": "label",

    "schema": {
      "dataset_id": {
        "type": "uuid",
        "fkey": "datasets",
        "label": "Dataset",
        "required": true,
        "editable": false,
        "columns": ['*']
      },

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

  const header = async function() {
    let h = null;
    let str = null;
    let geography_id;

    if (!dataset_id) return "Files";

    h = [`/datasets?select=name:category_name,geography_id&id=eq.${dataset_id}`, 'name'];

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

  return {
    base: "/files",
    model: model,
    collection: collection,
    header: header,
  };
})();
