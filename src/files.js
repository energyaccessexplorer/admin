const url = new URL(location);
const dataset_id = url.searchParams.get('dataset_id');
const file_id = url.searchParams.get('id');

export const base = 'files';

export const model = {
	"main": 'label',

	"schema": {
		"label": {
			"type": "string",
			"default": null,
			"label": "Label",
			"required": true
		},

		"endpoint": {
			"type": "string",
			"label": "Endpoint",
			"resource": true,
			"required": true,
		},

		"comment": {
			"type": "text",
			"label": "Comment",
			"required": true
		},

		"configuration": {
			"type": "object",
			"label": "Configuration",
			"nullable": true,
			"schema": {
				"key": {
					"type": "string",
					"hint": "This must be an identifier in the GEOJSON that references to a unique value in a column of the CSV",
					"required": true,
				}
			}
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
	},
};

export const collection = {
	"endpoint": function() {
		const attrs = ['id', 'label', 'endpoint', 'datasets(*)', 'created', 'created_by', 'updated', 'updated_by'];
		const params = { "select": attrs };

		if (file_id) params['id'] = `eq.${file_id}`;

		return params;
	},

	"sort_by": 'endpoint',

	"parse": function(m) {
		m.dscount = m.datasets.length;
		return m;
	}
};

export function init() {
	const edit_model = url.searchParams.get('edit_model');

	if (file_id || dataset_id || edit_model) return true;

	else {
		const s = url.searchParams.get('search');
		const f = dt_model_search('files');

		document.querySelector('body > main').append(f);
		f.querySelector('select.type').style.display = 'none';
	}

	return false;
};

export async function header() {
	if (!dataset_id) return "Files";

	let geography_id;
	const g = await (dt_client.get('datasets', { select: ['category_name', 'geography_name'], id: `eq.${dataset_id}`}, { one: true }));

	return `${g.geography_name} - ${g.category_name} - files`;
};
