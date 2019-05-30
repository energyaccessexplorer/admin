dt_modules['datasets'] = (function() {
  var dataset_id = location.get_query_param('id');
  var country_id = location.get_query_param('country_id');
  var category_id = location.get_query_param('category_id');

  var model = {
    "schema": {
      "category_id": {
        "type": "uuid",
        "fkey": "categories",
        "required": true,
        "editable": false,
        "columns": ['*']
      },

      "country_id": {
        "type": "uuid",
        "fkey": "countries",
        "required": true,
        "editable": false,
        "columns": ['*']
      },

      "online": {
        "type": "boolean",
        "default": false,
      },

      "heatmap_file_id": {
        "type": "uuid",
        "fkey": "files",
        "columns": ['*']
      },

      "vectors_file_id": {
        "type": "uuid",
        "fkey": "files",
        "columns": ['*']
      },

      "csv_file_id": {
        "type": "uuid",
        "fkey": "files",
        "columns": ['*']
      },

      "configuration": {
        "type": "json",
        "schema": null,
        "nullable": true
      },

      "presets": {
        "type": "array",
        "nullable": true,
        "schema": {
          "type": "object",
          "schema": {
            "name": {
              "type": "string",
              "required": true,
              "options": ["market", "planning", "investment"]
            },
            "weight": {
              "type": "number",
              "required": true,
              "default": 2
            },
            "min": {
              "type": "number",
              "default": 0
            },
            "max": {
              "type": "number",
              "default": 100
            }
          }
        }
      },

      "metadata": {
        "type": "object",
        "schema": {
          "description": {
            "type": "text",
            "nullable": true
          },
          "suggested_citation": {
            "type": "text",
            "nullable": true
          },
          "cautions": {
            "type": "text",
            "nullable": true
          },
          "spatial_resolution": {
            "type": "string",
            "nullable": true
          },
          "download_original_url": {
            "type": "string",
            "nullable": true
          },
          "learn_more_url": {
            "type": "string",
            "nullable": true
          },
          "license": {
            "type": "text",
            "nullable": true
          },
          "sources": {
            "type": "text",
            "nullable": true
          },
          "content_date": {
            "type": "string",
            "pattern": "^[0-9]{4}(-[0-9]{4})?$",
            "nullable": true
          }
        }
      }
    }
  };

  var collection = {
    "url": function() {
      var attrs = 'id,online,metadata,category_id,category_name,files(*)';

      if (dataset_id)
        return `/datasets?id=eq.${dataset_id}&select=${attrs}`;

      else if (country_id)
        return `/datasets?country_id=eq.${country_id}&select=${attrs}`;

      else if (category_id)
        return `/datasets?category_id=eq.${category_id}&select=${attrs}`;

      else
        return `/datasets?select=${attrs}`;
    },

    "sort_by": 'category_name',
  };

  var table_header = `
<th>category</th> <th>files</th>
`;

  var row = m => `
<td ${!m.online ? 'class="disabled"' : ''}><a bind="edit"></a>${m.category_name}</td>
<td><a href="/?model=files&dataset_id=${m.id}">files</a></td>
`;

  var style = null;

  var header = async function() {
    let h = null;
    let str = null;

    if (country_id)
      h = [`/countries?select=name&id=eq.${country_id}`, 'name'];

    else
      h = "";

    await fetch(dt_config.origin + h[0])
      .then(r => r.json())
      .then(j => str = j[0][h[1]]);

    return str + " datasets";
  };

  return {
    base: "/datasets",
    model: model,
    collection: collection,
    header: header,
    th: table_header,
    row: row,
    style: style,
  };
})();
