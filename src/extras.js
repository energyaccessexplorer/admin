export function email_user(str) {
	if (!str || str === "") return "?";

	if (!str.match('@')) return str;

	return str.split('@')[0];
};

export function external_link_base(m) {
	let base;

	if (or(dt.config.production.match(/localhost/),
	       m.deployment.includes('production')))
		base = dt.config.production;

	else if (dt.config.production.match(/www/))
		base = dt.config.production.replace('www', 'staging');

	return base;
};
