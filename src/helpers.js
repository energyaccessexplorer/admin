function email_user(str) {
	if (!str || str === "") return "?";

	if (!str.match('@')) return str;

	return str.split('@')[0];
};
