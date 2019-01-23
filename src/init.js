requirejs.config({
  'baseUrl': '/javascripts',
  'paths': {
    'location':   "/lib/location",
    'sortable':   "/lib/htmlsortable",
    'jquery':     "/lib/jquery",
    'underscore': "/lib/underscore",
    'backbone':   "/lib/backbone",
    'duck-tape':  "/lib/duck-tape/duck-tape",
  },
  'shim': {
    'backbone': {
      'deps': ['jquery', 'underscore']
    },

    'duck-tape': {
      'deps': ['backbone']
    },
  }
});

require(['duck-tape'], _ => {
  dt_model_root = '/';
  dt_default_model = 'countries';

  dt_fetchables = {
    "countries": {
      primary: 'ccn3',
      placeholder: "name or ccn3",
      handler: function(v, fill_target) {
        dt_string_fetch_handler({
          table: 'countries',
          query: `select=id,name&name=ilike.*${v}*`,
          input: x => x['id'],
          descriptor: x => x['name'],
          value: v,
          threshold: 2,
          fill_target: fill_target
        });
      }
    },

    "categories": {
      primary: 'id',
      placeholder: "name",
      handler: function(v, fill_target) {
        dt_string_fetch_handler({
          table: 'categories',
          query: `select=id,name,name_long,unit&name=ilike.*${v}*`,
          input: x => x['id'],
          descriptor: x => `${x.name} - ${x.name_long}`,
          value: v,
          threshold: 2,
          fill_target: fill_target
        });
      }
    },

    "files": {
      primary: 'id',
      placeholder: "label (optional)",
      handler: function(v, fill_target) {
        let em = location.get_query_param('edit_model');

        let dataset_param = '';
        let label_param = '';

        if (dt_model === 'datasets' && em.match(UUID_REGEXP))
          dataset_param = `dataset_id=eq.${em}`;

        if (v === '' || v === null) ;
        else
          label_param = `&label=ilike.*${v}*`

        dt_string_fetch_handler({
          table: 'files',
          query: `select=id,label,endpoint&${dataset_param}${label_param}`,
          input: x => x['id'],
          descriptor: x => `${x.label} - ${x.endpoint}`,
          value: v,
          threshold: 0,
          fill_target: fill_target
        });
      }
    },

    "id": {
      placeholder: "uuid",
      handler: function(tablename, v, descriptor) {
        dt_reverse_string_fetch_handler(
          tablename,
          `${tablename}?select=id,${descriptor}&id=eq.${v}`,
          (x) => x['id'],
          (x) => x[descriptor],
          v, 36
        );
      }
    },
  };
});
