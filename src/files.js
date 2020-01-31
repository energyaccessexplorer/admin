dt_modules['files'] = (function() {
  const url = new URL(location);

  const file_id = url.searchParams.get('id');
  const dataset_id = url.searchParams.get('dataset_id');

  const model = {
    "main": 'label',

    "columns": ["*", "datasets(*)"],

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
    },

    "parse": function(m) {
      m.dscount = m.datasets.length;
      return m;
    }
  };

  const collection = {
    "url": function() {
      const attrs = '*,datasets(*)';

      if (file_id)
        return `/files?id=eq.${file_id}&select=${attrs}`;

      else
        return `/files?select=${attrs}`;
    },

    "sort_by": 'endpoint',

    "parse": model.parse
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

  return {
    base: "/files",
    model: model,
    collection: collection,
    header: header,
  };
})();
