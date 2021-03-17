import {circles_user} from './circles.js';

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
      "constraint": "parent",
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

    "envs": {
      "type": "array",
      "schema": {
        "label": "deployment",
        "type": "string",
        "options": ["staging", "production"],
        "required": true
      }
    },

    "flagged": {
      "type": "boolean"
    },

    "circle": {
      "type": "string",
      "label": "Circle",
      "pattern": "^[a-z][a-z0-9\-]+$",
      "default": "public",
      "required": true,
    },

    "configuration": {
      "type": "object",
      "label": "Configuration",
      "collapsed": false,
      "nullable": true,
      "schema": {
        "timeline": {
          "type": "boolean",
          "default": false,
        },

        "boundaries_name": {
          "type": "string",
          "required": true,
          "hint": "Provinces/Territories/States? County/Municipality?",
        },

        "timeline_dates": {
          "type": "array",
          "nullable": true,
          "needs": m => maybe(m.configuration, 'timeline'),
          "schema": {
            "type": "date",
            "required": true
          }
        },

        "flag": {
          "type": "object",
          "nullable": true,
          "needs": m => m.adm === 0,
          "schema": {
            "x": {
              "type": "number",
            },
            "y": {
              "type": "number",
            },
            "width": {
              "type": "number",
            },
            "height": {
              "type": "number",
            },
            "aspect-ratio": {
              "type": "string",
              "default": "none",
              "options": ["none", "xMaxYMax", "xMaxYMid", "xMaxYMin", "xMidYMax", "xMidYMid", "xMidYMin", "xMinYMax", "xMinYMid", "xMinYMin", ]
            },
          }
        },

        "sort_branches": {
          "type": "array",
          "nullable": false,
          "schema": {
            "type": "string",
            "required": true,
          }
        },

        "sort_subbranches": {
          "type": "array",
          "nullable": false,
          "schema": {
            "type": "string",
            "required": true,
          }
        },

        "sort_datasets": { // TODO: should come from dataset's name (or category_name)
          "type": "array",
          "nullable": false,
          "schema": {
            "type": "string",
            "required": true,
          }
        },
      }
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

  "parse": function(m) {
    m.inproduction = m.envs.indexOf("production") > -1;
    m.instaging = m.envs.indexOf("staging") > -1;
    m.dscount = m.datasets ? m.datasets.length : 0;
    m.ok = !m.flagged;
    return m;
  }
};

export const collection = {
  "filters": ['name'],

  "endpoint": function() {
    const attrs = ['id', 'name', 'cca3', 'adm', 'envs', 'flagged', 'configuration', 'datasets(id)', 'created', 'created_by', 'updated', 'updated_by'];

    const params = {
      "select": attrs
    };

    const url = new URL(location);
    let geography_id  = url.searchParams.get('id');
    if (geography_id)
      params['id'] = `eq.${geography_id}`;

    const circles = circles_user();
    if (circles) params['circle'] = `in.(${circles})`;

    return params;
  },

  "parse": model.parse,
};
