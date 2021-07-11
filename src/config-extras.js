dt_fetchables = {
	"geographies": {
		primary: 'name',
		placeholder: "name",
		options: function(v) {
			return {
				table: 'geographies',
				query: {
					"select": ['id', 'name'],
					"name": `ilike.*${v}*`
				},
				input: x => x['id'],
				descriptor: x => x['name'],
				value: v,
				threshold: 2
			};
		}
	},

	"categories": {
		primary: 'id',
		placeholder: "name",
		options: function(v) {
			return {
				table: 'categories',
				query: {
					"select": ['id', 'name', 'name_long', 'unit'],
					"name": `ilike.*${v}*`
				},
				input: x => x['id'],
				descriptor: x => `${x.name} - ${x.name_long}`,
				value: v,
				threshold: 2
			}
		}
	},

	"datasets": {
		primary: 'id',
		placeholder: "category_name",
		options: function(v) {
			return {
				table: 'datasets',
				query: {
					"select": ['id', 'name', 'name_long', 'geography_name', 'category_name', 'category_id'],
					"category_name": `ilike.*${v}*`
				},
				input: x => x['id'],
				descriptor: x => `${x.geography_name} - ${x.category_name} -- ${x.name} -- ${x.name_long}`,
				value: v,
				threshold: 2
			}
		}
	},

	"files": {
		primary: 'id',
		placeholder: "label (optional)",
		options: function(v) {
			const u = new URL(location);
			const em = u.searchParams.get('edit_model');

			const q = {
				"select": ['id', 'label', 'endpoint'],
			};

			if (dt_model === 'datasets' && em && em.match(UUID_REGEXP))
				q['dataset_id'] = `eq.${em}`;

			if (v === '' || v === null) ;
			else q['label'] = `ilike.*${v}*`;

			return {
				table: 'files',
				query: q,
				input: x => x['id'],
				descriptor: x => `${x.label} - <code>${x.endpoint}</code>`,
				value: v,
				threshold: 0
			};
		}
	}
};

dt_navlist = [
	["geographies", "Geographies", "globe"],
	["categories", "Categories", "list-nested"],
	["files", "Files", "file-earmark"],
];

dt_paver = {
	base: "/paver",
};
