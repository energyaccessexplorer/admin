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
};

dt_navlist = [
	["geographies", "Geographies", "globe"],
	["categories", "Categories", "list-nested"],
];

dt_paver = {
	base: "/paver",
};
