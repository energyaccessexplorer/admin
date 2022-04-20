/* eslint no-global-assign: "off" */

const claims = jwt_decode(localStorage.getItem('token'));

if (!['leader', 'master','root'].includes(claims['role']))
	qs(`nav#dt-nav a[href="${dt_config.base}/?model=users"]`).remove();

API = new pgrest(dt_config.auth_server + "/admin/api", FLASH);

const url = new URL(location);
url.searchParams.set('world', 'ea');
history.replaceState(null, null, url);

import * as _u from 'https://auth.chestnut.vision/admin/src/users.js';

export const model = _u.model;
export const collection = _u.collection;
export const base = _u.base;
export const header = _u.header;
export const new_disabled = false;
