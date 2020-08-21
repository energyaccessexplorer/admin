const model = {
  "main": 'rolname',

  "pkey": "rolname",

  "schema": {
    "oid": {
      "type": "string",
      "required": false,
      "editable": false,
    },

    "rolname": {
      "type": "string",
      "label": "Name",
      "required": true,
    },

    "parents": {
      "type": "array",
      "required": false,
      "editable": false,
      "schema": {
        "type": "string",
        "editable": false,
      }
    },
  },
};

const collection = {
  "endpoint": function() {
    const attrs = ['*'];
    const params = { "select": attrs };

    return params;
  },
};

const base = "circles";

const header = "Circles";

export {
  base,
  header,
  model,
  collection,
};
