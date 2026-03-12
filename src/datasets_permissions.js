import bind from '../lib/bind.js';

import modal from '../lib/modal.js';

import {
	ce,
	remote_tmpl,
	qs,
	qsa,
	until,
} from '../lib/helpers.js';

const url = new URL(location);

const user_id = url.searchParams.get('user_id');
const dataset_id = url.searchParams.get('dataset_id');

export const base = 'datasets_permissions';

export const model = {
	"main": _ => "&nbsp;",

	"pkey": ['user_id', 'dataset_id'],

	"base": base,

	"clonable_attrs": [
		'user_id',
		'dataset_id',
		'type',
	],

	"schema": {
		"user_id": {
			"type":       "uuid",
			"fkey":       "users",
			"constraint": "user",
			"required":   true,
			"editable":   false,
			"label":      "User",
			"columns":    ['*'],
		},

		"dataset_id": {
			"type":       "uuid",
			"fkey":       "datasets",
			"constraint": "dataset",
			"required":   true,
			"editable":   false,
			"label":      "Dataset ID",
			"columns":    ['*'],
		},

		"type": {
			"type":       "select",
			"required":   true,
			"editable":   false,
			"label":      "Type",
			"default":    "read",
			"options":    ["read", "write", "publish"],
		},
	},
};

export const collection = {
	"endpoint": function() {
		const select = [
			"*",
			'user(*)',
			'dataset(*,category_name,geography_name)',
		];

		const params = { select };

		if (user_id)
			params['user_id'] = `eq.${user_id}`;

		else if (dataset_id)
			params['dataset_id'] = `eq.${dataset_id}`;

		return params;
	},
};

async function bulk_insert(dataset) {
	const users = await dt.API.get('users', {
		"select": ["id", "email", "role"],
		"order":  ["role.desc", "email"],
		"role":   "not.in.(director,root)",
	});

	const existing = dt.collections.datasets_permissions.objects.map(x => x.data);

	for (const e of existing) {
		let u;
		if (u = users.find(x => x.id === e.user_id))
			users.splice(users.indexOf(u), 1);
	}

	const content = bind(
		await remote_tmpl("datasets_permissions/bulk-insert.html"),
		{ users, dataset, submit },
	);

	const m = new modal({
		"header": ce('h4', `Bulk Insert permissions for ${dataset.geography_name} - ${dataset.name || dataset.category_name}`),
		content,
	});

	function submit() {
		const type = qs('select[name=type]', m.content).value;
		Promise.all(
			qsa('input:checked', document.body, true)
				.map(i => dt.API.post('datasets_permissions', null, { "payload": { "user_id": i.value, dataset_id, type }})),
		).then(r => { if (r.filter(x => x !== null).length) location.reload(); });
	};

	m.show();
};

export async function init() {
	if (!["leader", "manager", "director", "root"].includes(SELF.role)) return true;

	const dataset = await dt.API.get('datasets', {
		"id":     `eq.${dataset_id}`,
		"select": ["*", "category_name", "geography_name"],
	}, { "one": true });

	until(_ => qs('body main header .actions-drawer'))
		.then(_ => {
			const a = ce('button', ce('i', null, { "class": "bi-list-check", "title": 'Bulk insert' }));
			a.onclick = _ => bulk_insert(dataset);
			qs('body main header .actions-drawer').append(a);
		});

	return true;
};
