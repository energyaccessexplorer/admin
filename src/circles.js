export const base = 'circles';

export const header = "Circles";

export const model = {
  "main": 'rolname',

  "pkey": 'rolname',

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

  "patch": function(d,n) {
    return dt_client.post('rpc/circles_update', null, {
      'payload': {
        'oldname': d.rolname,
        'newname': n.rolname
      },
      'one': true });
  }
};

export const collection = {
  "endpoint": function() {
    const attrs = ['*'];
    const params = { "select": attrs };

    return params;
  },
};
