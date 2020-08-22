export const base = 'geographies';

export const header = "Geographies";

export const model = {
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
  },

  "edit_jobs": [
    (o,f) => dt_external_link(o, f, m => `${dt_config.production}/a/?id=${m.id}&inputs=boundaries`),
  ],
};

export const collection = {
  "filters": ['name'],

  "endpoint": function() {
    const attrs = ['id', 'name', 'cca3', 'adm', 'online', 'configuration', 'circle', 'datasets(id)', 'created', 'created_by', 'updated', 'updated_by'];

    const params = {
      "select": attrs
    };

    const url = new URL(location);
    let geography_id  = url.searchParams.get('id');
    if (geography_id) params['id'] = `eq.${geography_id}`;

    return params;
  },

  "parse": function(m) {
    m.dscount = m.datasets.length;
    return m;
  },
};
