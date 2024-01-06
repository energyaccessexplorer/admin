dt.API.base = dt.config.status;

const claims = jwt_decode(localStorage.getItem('token'));

if (!['leader', 'manager', 'director', 'root'].includes(claims['role'])) {
	qs(`nav#dt-nav a[href="${dt.config.base}/?model=users"]`).remove();
	qs(`nav#dt-nav a[href="${dt.config.base}/?model=status"]`).remove();
}

export const base = "tasks";

export const model = {
	"schema": {
		"id": {
			"type": "string",
		},
		"info": {
			"type": "string",
		},
		"status": {
			"type": "string",
		},
	},

	"parse": function(m) {
		switch (m['state']) {
		case 1:
			m['_failed'] = true;
			break;
		case 0:
			m['_running'] = true;
			break;
		case -1:
			m['_not_running'] = true;
			break;
		}

		m['infos'] = m['info'] ? m['info'].join("\n") : "";

		return m;
	},
};

export const collection = {
	"endpoint": { "world": "eae" },
	"parse":    model.parse,
};

export const header = "System Status";

export const new_disabled = true;
