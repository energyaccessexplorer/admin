import * as _u from './base_user.js';

import pgrest from './pgrest.js';

dt.API.base = dt.config.api;

const claims = jwt_decode(localStorage.getItem('token'));

if (!['leader', 'manager', 'director', 'root'].includes(claims['role']))
	qs(`nav#dt-nav a[href="${dt.config.base}/?model=users"]`).remove();

const url = new URL(location);
history.replaceState(null, null, url);

_u.model['edit_modal_jobs'].push(
	async function(object, form) {
		const fapi = new pgrest();
		fapi.base = dt.config.api;
		fapi.FLASH = dt.FLASH;

		const follows = await fapi.get('follows', {
			"select": ['*', 'dataset:datasets(info)'],
			"email":  `eq.${object.data.email}`,
		});
		const d = ce('details');
		d.append(ce('summary', ce('label', 'follows')));

		const x = ce('div', null, { "id": "badges" });
		console.log('DATASET:', f)
		x.append(...follows.map(f => ce(
			'span',
			ce('a', f.dataset.info, { "href": `./?model=datasets&id=${f.dataset_id}&edit_model=${f.dataset_id}` }),
			{ "class": "badge" },
		)));

		d.append(x);

		qs('fieldset', form).append(d);
	},
);

_u.collection['parse'] = function($) {
	const a = $['data'] || {};

	$._country = a['country'];
	$._aoi = maybe(a, 'areas_of_interest', 'length') ? a['areas_of_interest'][0] : a['areas_of_interest'];

	$._first_name = a['first_name'];
	$._last_name = a['last_name'];

	$._email_name = `${$.email};;;${a['last_name']};;;${a['first_name']}`;

	$['email+name'] = $._email_name; // just so that it looks pretty.

	return $;
};

_u.collection['endpoint'] = {
	"select": [
		'id',
		'email',
		'role',
		'data',
	],
	"order": 'email.asc',
};

_u.collection['filters'] = ['email+name'];

export const model = _u.model;
export const collection = _u.collection;
export const base = _u.base;
export const header = _u.header;
export const new_disabled = false;
