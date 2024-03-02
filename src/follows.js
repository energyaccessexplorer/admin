// import modal from '../lib/modal.js';

export const base = 'follows';

export const header = "Follows";

export const model = {
	"base": base,

	"schema": {
		"email": {
			"type":     "string",
			"label":    "Admin's email",
			"required": true,
			"editable": false,
		},

		"dataset_id": {
			"type":       "uuid",
			"fkey":       "datasets",
			"label":      "Dataset ID",
			"constraint": "datasets!id",
			"columns":    [],
			"required":   true,
			"editable":   false,
		},
	},
};

export const collection = {
	"endpoint": function() {
		const url = new URL(location);
		const dataset_id = url.searchParams.get('dataset_id');
		const email = url.searchParams.get('email');

		const select = ['*', 'dataset_info'];
		const params = { select };

		if (dataset_id)
			params['dataset_id'] = `eq.${dataset_id}`;
		else if (email)
			params['email'] = `eq.${email}`;

		return params;
	},
};
