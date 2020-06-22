const url = new URL(location);
let geography_id  = url.searchParams.get('id');

let ds_options = [];

const model = {
  "main": "name",

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

    "circle": {
      "type": "string",
      "label": "Collection",
      "pattern": "^[a-z][a-z0-9\-]+$",
      "default": "public",
    },

    "configuration": {
      "type": "json",
      "label": "Configuration",
      "nullable": true
  "edit_jobs": [
    (o,f) => dt_plugins.external.add_link(o, f, m => `${dt_config.production}/a/?id=${m.id}&inputs=boundaries`),
  ],
};

const collection = {
  "filters": ['name'],

  "endpoint": function() {
    const attrs = ['id', 'name', 'cca3', 'adm', 'online', 'configuration', 'circle', 'datasets(id)'];

    const params = {
      "select": attrs
    };

    if (geography_id) params['id'] = `eq.${geography_id}`;

    return params;
  },

  "parse": function(m) {
    m.dscount = m.datasets.length;
    return m;
  }
};

const wants = {
  "dt_external": _ => null,
};

dt_modules['geographies'] = {
  base: "geographies",
  header: 'Geographies',
  model,
  collection,
  wants,
};
