dt_modules['datasets'] = (function() {
  const u = new URL(location);

  const dataset_id = u.searchParams.get('id');
  const geography_id = u.searchParams.get('geography_id');
  const category_id = u.searchParams.get('category_id');

  var model = {
    "main": "category_name",

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
        "label": "Show Online",
        "default": false,
      },

      "raster_file_id": {
        "type": "uuid",
        "fkey": "files",
        "label": "Raster file ID",
        "columns": ['*'],
        "needs": m => m.categories.raster
      },

      "vectors_file_id": {
        "type": "uuid",
        "fkey": "files",
        "label": "Vectors file ID",
        "columns": ['*'],
        "needs": m => m.categories.vectors
      },

      "csv_file_id": {
        "type": "uuid",
        "fkey": "files",
        "label": "CSV file ID",
        "columns": ['*'],
        "needs": m => m.categories.csv
      },

      "configuration": {
        "type": "json",
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
      // cannos ask for files(id): postgrest does not understand this many-to-one relation with files
      const attrs = 'id,online,category_name,circle,geography_id,raster_file_id,vectors_file_id,csv_file_id';

      if (dataset_id)
        return `/datasets?id=eq.${dataset_id}&select=${attrs}`;

      else if (geography_id)
        return `/datasets?geography_id=eq.${geography_id}&select=${attrs}`;

      else if (category_id)
        return `/datasets?category_id=eq.${category_id}&select=${attrs}`;

      else
        return `/datasets?select=${attrs}`;
    },

    "parse": function(m) {
      m.file_count = ['raster_file_id','vectors_file_id','csv_file_id'].reduce((a,c) => m[c] ? a + 1 : a, 0);
      return m;
    },

    "sort_by": 'category_name',
  };

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
  };
})();
