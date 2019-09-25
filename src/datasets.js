dt_modules['datasets'] = (function() {
  var dataset_id = location.get_query_param('id');
  var geography_id = location.get_query_param('geography_id');
  var category_id = location.get_query_param('category_id');

  var model = {
    "schema": {
      "category_id": {
        "type": "uuid",
        "fkey": "categories",
        "required": true,
        "editable": false,
        "label": "Category",
        "columns": ['*']
      },

      "geography_id": {
        "type": "uuid",
        "fkey": "geographies",
        "required": true,
        "editable": false,
        "label": "Geography",
        "columns": ['*']
      },

      "online": {
        "type": "boolean",
        "default": false,
      },

      "heatmap_file_id": {
        "type": "uuid",
        "fkey": "files",
        "label": "Raster file ID",
        "columns": ['*']
      },

      "vectors_file_id": {
        "type": "uuid",
        "fkey": "files",
        "label": "Vectors file ID",
        "columns": ['*']
      },

      "csv_file_id": {
        "type": "uuid",
        "fkey": "files",
        "label": "CSV file ID",
        "columns": ['*']
      },

      "configuration": {
        "type": "json",
        "schema": null,
        "label": "Configuration",
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
    },

    "edit_callback": function(model, form) {
      const metadatadetails = form.querySelector('details[name="metadata"]');

      const button = document.createElement('button');
      button.type = 'button';
      button.innerText = "import metadata";
      button.style = "float: right;";

      const input = document.createElement('input');
      input.type = 'hidden';
      input.onchange = function() {
        fetch(dt_config.origin + `/datasets?select=metadata&id=eq.${this.value}`)
          .then(r => r.json())
          .then(r => {
            let metadata;
            if (!r[0] || !(metadata = r[0]['metadata'])) return;

            for (let k in metadata)
              metadatadetails.querySelector(`[name=${k}]`).value = metadata[k];
          })
      };

      button.onclick = function() {
        dt_model_search_modal('datasets', input, null);
      };

      metadatadetails.querySelector('summary').append(button);
    }
  };

  var collection = {
    "url": function() {
      var attrs = 'id,online,metadata,category_id,category_name,files(*),geography_id';

      if (dataset_id)
        return `/datasets?id=eq.${dataset_id}&select=${attrs}`;

      else if (geography_id)
        return `/datasets?geography_id=eq.${geography_id}&select=${attrs}`;

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
    let str = null;
    let sufix = null;
    let gid = geography_id;

    const geoobj = _ => dt_collections["datasets"][0].array[0];

    if (!gid) {
      await until(geoobj)
        .then(_ => {
          const g = geoobj();

          sufix = g['category_name'];
          gid = g['geography_id'];
        });
    }

    const h = [`/geographies?select=name&id=eq.${gid}`, 'name'];

    if (!gid) return "";

    await fetch(dt_config.origin + h[0])
      .then(r => r.json())
      .then(j => str = j[0][h[1]]);

    return str + " - " + (sufix ? sufix : "datasets");
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
