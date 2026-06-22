import {
	ce,
	maybe,
	qs,
	until,
} from '../lib/helpers.js';

// Use the DB role from SELF, not the JWT (always "guest"); wait for it since
// pre_view sets SELF after this module imports.
until(_ => maybe(window.SELF, 'role'))
	.then(role => {
		if (!['leader', 'manager', 'director', 'root'].includes(role))
			qs(`nav#dt-nav a[href="${dt.config.base}/?model=users"]`)?.remove();
	})
	.catch(() => {});

export const model = {
	"main": "email",

	"schema": {
		"email": {
			"type":     "email",
			"required": true,
		},

		"role": {
			"type":     "string",
			"required": true,
		},

		"disabled": {
			"type":    "boolean",
			"default": false,
		},

		"about": {
			"type": "json",
		},
	},

	"edit_modal_jobs": [
		async function follows(object, form) {
			const follows = await dt.API.get('follows', {
				"select": ['*', 'dataset:datasets(info)'],
				"email":  `eq.${object.data.email}`,
			});
			const d = ce('details');
			d.append(ce('summary', ce('label', 'follows')));

			const x = ce('div', null, { "id": "badges" });
			x.append(...follows.map(f => ce(
				'span',
				ce('a', f.dataset.info, { "href": `./?model=datasets&id=${f.dataset_id}&edit_model=${f.dataset_id}` }),
				{ "class": "badge" },
			)));

			d.append(x);

			if (follows.length === 0)
				d.append(ce('p', "Not following any datasets"));

			qs('fieldset', form).append(d);
		},
		async function access(object, form) {
			const access = await dt.API.get('access', {
				"select":  ['*'],
				"user_id": `eq.${object.data.id}`,
			});
			const d = ce('details', null, { "open": '' });
			d.append(ce('summary', ce('label', ce('a', 'access', { "href": `./?model=access&user_id=${object.data.id}` }))));

			const x = ce('div', null, { "id": "badges" });
			x.append(...access.map(a => ce(
				'span',
				ce('a', `${a.circle} - ${a.deployment}`, { "href": `./?model=access&user_id=${a.user_id}&edit_model=${a.user_id},${a.circle},${a.deployment}` }),
				{ "class": "badge" },
			)));

			d.append(x);

			if (access.length === 0)
				d.append(ce('p', "Nothing granted"));

			qs('fieldset', form).append(d);
		},
	],

	"delete_disabled": true,
};

export const collection = {
	"filters": ['email+name'],

	"endpoint": {
		"select": [
			'id',
			'email',
			'role',
			'about',
		],
		"order": 'email.asc',
	},

	"parse": function($) {
		const a = $['about'] || {};

		$._country = a['country'];
		$._aoi = maybe(a, 'areas_of_interest', 'length') ? a['areas_of_interest'][0] : a['areas_of_interest'];

		$._first_name = a['first_name'];
		$._last_name = a['last_name'];

		$._email_name = `${$.email};;;${a['last_name']};;;${a['first_name']}`;

		$['email+name'] = $._email_name; // just so that it looks pretty.

		return $;
	},
};

export const base = 'users';

export const header = "Users";

export const new_disabled = true;
