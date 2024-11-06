import modal from './modal.js';

const API = dt.API;
const FLASH = dt.FLASH;

function pwgen() {
	let str = "";
	for (let i = 32; i < 127; ++i) {
		let c = String.fromCharCode(i);
		if (![' ', "~", "^", "'", "`", '"', "/", "\\", "|"].includes(c)) str += c;
	}

	return Array(8).fill(str.split('')).map(x => x[Math.floor(Math.random() * x.length)]).join('');
};

async function pwchange(object, form) {
	const i = qs('[name=pass]', form);

	const pc = ce('a', 'change', { href: '#', style: 'font-family: monospace; font-size: small;' });
	pc.onclick = function(e) {
		e.preventDefault();

		const f = ce('form');
		const i = ce('input', '', { type: 'text', style: 'font-size: xx-large; text-align: center; font-family: monospace; width: 36ch;' });
		f.append(i);

		const o = ce('a', "(try another)", { href: '#', style: 'font-family: monospace; margin-left: 3em;' });
		o.onclick = _ => i.value = pwgen();

		const m = new modal({
			header: ce('div', [ce('span', "Change password"), o]),
			content: f,
			destroy: true,
		});

		f.append(ce('hr'), ce('button', "submit", { type: "submit" }));

		f.onsubmit = async function(e) {
			e.preventDefault();

			API.patch('users', object.endpoint('PATCH'), {
				"payload": { "pass": i.value },
				"one": true
			})
				.then(_ => m.hide())
				.then(_ => {
					FLASH.clear();

					FLASH.push({
						type: 'success',
						title: 'Password Changed',
					});
				});

			return false;
		};

		m.show();

		i.value = pwgen();
		i.focus();

		return false;
	};

	i.setAttribute('type', 'password');
	i.closest('.input-group').prepend(pc);
};

export const model = {
	"main": "email",

	"schema": {
		"email": {
			"type": "email",
			"required": true,
		},

		"role": {
			"type": "string",
			"required": true,
		},

		"data": {
			"type": "json",
		}
	},

	"edit_modal_jobs": [
		pwchange
	]
};

export const collection = {
	"filters": ['email'],

	"endpoint": {
		"select": [
			'id',
			'email',
			'role',
		],
		"order": 'created.desc',
	}
};

export const base = 'users';

export const header = "Users";

export const new_disabled = false;