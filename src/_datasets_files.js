const url = new URL(location);
const dataset_id = url.searchParams.get('dataset_id');
const file_id = url.searchParams.get('file_id');

export const base = '_datasets_files';

export const model = {
	"main": m => {
		// TODO: fix this with a proper relation
		//
		if (m.dataset)
			return `${m.dataset.geography_name} - ${m.dataset.category.name_long} (${m.dataset.category.name})`;
		else
			return `${m.dataset_id}--${m.file_id}`;
	},

	"pkey": ['dataset_id', 'file_id'],

	"schema": {
		"dataset_id": {
			"type": "uuid",
			"fkey": "datasets",
			"constraint": "datasets!dataset", // AKTA! postgrest gets confused with the geogrphy_boundaries view!
			"label": "Dataset",
			"required": true,
			"editable": false,
			"columns": ['id', 'name']
		},

		"file_id": {
			"type": "uuid",
			"fkey": "files",
			"constraint": "file",
			"label": "File",
			"required": true,
			"editable": false,
			"columns": ['id', 'endpoint']
		},

		"active": {
			"type": "boolean"
		},

		"func": {
			"type": "select",
			"required": true,
			"options": ['', 'raster' ,'vectors', 'csv'],
		}
	},

	"parse": function(m) {
		for (let k in m.file) m[`_file_${k}`] = m.file[k];

		m['_category_name'] = maybe(m, 'dataset', 'category', 'name');
		m['_geography_name'] = maybe(m, 'dataset', 'geography_name');

		return m;
	}
};

export const collection = {
	"endpoint": function() {
		const params = {
			"select": [
				'file_id',
				'dataset_id',
				'func',
				'active',
				'file(label,endpoint)',
				'dataset:datasets(geography_name, category(name, name_long))'
			]
		};

		if (dataset_id) params['dataset_id'] = `eq.${dataset_id}`;
		else if (file_id) params['file_id'] = `eq.${file_id}`;

		return params;
	},

	"parse": model.parse,

	"sort_by": 'active',

	"order": -1
};

export const header = "Dataset/File relations";
