dt.API.base = dt.config.auth_server + "/admin/api";

const claims = jwt_decode(localStorage.getItem('token'));

if (!['leader', 'manager', 'director', 'root'].includes(claims['role']))
	qs(`nav#dt-nav a[href="${dt.config.base}/?model=users"]`).remove();

const url = new URL(location);
url.searchParams.set('world', 'ea');
history.replaceState(null, null, url);

import * as _u from 'https://noop.nu/auth/admin/src/users.js';

export const model = _u.model;
export const collection = _u.collection;
export const base = _u.base;
export const header = _u.header;
export const new_disabled = false;
