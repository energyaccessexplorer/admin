import * as _u from 'https://noop.nu/auth/admin/src/users.js';

import pgrest from 'https://noop.nu/dist/duck-tape/lib/pgrest.js';

dt.API.base = dt.config.auth_server + "/admin/api";

const claims = jwt_decode(localStorage.getItem('token'));

if (!['leader', 'manager', 'director', 'root'].includes(claims['role']))
	qs(`nav#dt-nav a[href="${dt.config.base}/?model=users"]`).remove();

const url = new URL(location);
url.searchParams.set('world', 'eae');
history.replaceState(null, null, url);

_u.model['edit_modal_jobs'] = [
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
		x.append(...follows.map(f => ce(
			'span',
			ce('a', f.dataset.info, { "href": `./?model=datasets&id=${f.dataset_id}&edit_model=${f.dataset_id}` }),
			{ "class": "badge" },
		)));

		d.append(x);

		qs('fieldset', form).append(d);
	},
];

export const model = _u.model;
export const collection = _u.collection;
export const base = _u.base;
export const header = _u.header;
export const new_disabled = false;
