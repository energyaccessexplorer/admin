/* eslint no-undef: "off" */
// this file will be "cat'ed" with another "config" is there. See the duck-tape.mk

Object.assign(config, {
	"storage_track_files": false,
	"storage_use_prefix":  true,
	"landing":             config.base + "/?model=geographies",
	"email_reset":         "https://www.energyaccessexplorer.org/password-reset/",

	// Same-origin, not the build-time host: paver/departer reject cross-origin
	// requests (their Origin header won't match Host on a worktree/PR-preview
	// domain), so this must track wherever this page is actually being served.
	"paver_endpoint":      `${location.origin}/paver`,
	"departer_endpoint":   `${location.origin}/departer`,
	"pre_view":            async _ => {
		try {
			const id = jwt_decode(localStorage['token']).id;
			const u = (await dt.API.get('users', { "id": `eq.${id}` }, { "one": true }));

			window.SELF = u;
		} catch(_err) {
			console.warn("Failed to fetch SELF (this might be OK)", _err);
			window.SELF = { "data": { "circles": [], "envs": [] }, "role": "guest" };
		}
	},
});

export const fetchables = {
	"geographies": {
		"primary":     'name',
		"placeholder": "name",
		"options":     v => ({
			"table": 'geographies',
			"query": {
				"select": ['id', 'name'],
				"name":   `ilike.*${v}*`,
			},
			"input":      x => x['id'],
			"descriptor": x => x['name'],
			"value":      v,
			"threshold":  2,
		}),
	},

	"categories": {
		"primary":     'id',
		"placeholder": "name",
		"options":     v => ({
			"table": 'categories',
			"query": {
				"select": ['id', 'name', 'name_long', 'unit'],
				"name":   `ilike.*${v}*`,
			},
			"input":      x => x['id'],
			"descriptor": x => `${x.name} - ${x.name_long}`,
			"value":      v,
			"threshold":  2,
		}),
	},

	"datasets": {
		"primary":     'id',
		"placeholder": "category_name",
		"options":     v => ({
			"table": 'datasets',
			"query": {
				"select":        ['id', 'name', 'name_long', 'geography_name', 'category_name', 'category_id'],
				"category_name": `ilike.*${v}*`,
			},
			"input":      x => x['id'],
			"descriptor": x => `${x.geography_name} - ${x.category_name} -- ${x.name} -- ${x.name_long}`,
			"value":      v,
			"threshold":  2,
		}),
	},

	"users": {
		"primary":     'id',
		"placeholder": "email",
		"options":     v => ({
			"table": 'users',
			"query": {
				"select": ['id', 'email'],
				"email":  `eq.${v}`,
			},
			"input":      x => x['id'],
			"descriptor": x => x.email,
			"value":      v,
			"threshold":  7,
		}),
	},
};

export const navlist = [
	["geographies", "Geographies", "globe"],
	["categories", "Categories", "list-nested"],
	["users", "Users", "people-fill"],
];
