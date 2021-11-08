function email_user(str) {
	if (!str || str === "") return "?";

	if (!str.match('@')) return str;

	return str.split('@')[0];
};

function external_link_base(m) {
	let base;

	if (or(dt_config.production.match(/localhost/),
	       m.deployment.includes('production')))
		base = dt_config.production;

	else if (dt_config.production.match(/www/))
		base = dt_config.production.replace('www', 'staging');

	return base;
};
