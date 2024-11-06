export default class pgrest {
	constructor(base, flash, login_redirect) {
		this.base = base;
		this.flash = flash || { push: x => console.log(x), clear: _ => null };
		this.login_redirect = login_redirect;

		return this;
	};

	async parse(response, options = {}) {
		let body;

		try {
			switch (options.expect) {
			case 'csv':
			case 'text':
				body = await response.text();
				break;

			case 'blob':
				body = await response.blob();
				break;

			case 'json':
			default:
				body = await response.json();
				break;
			}
		}
		catch(err) {
			console.error(err);
			body = { "message": `pgrst#parse: failed to parse '${options.expect}' response` };
		}

		return body;
	};

	req(method, options) {
		const {contenttype, one, expect} = options;

		const t = localStorage.getItem('token');

		const r = {
			"method": method,
			"headers": {
				"Authorization": t ? `Bearer ${t}` : undefined,
				"Content-Type": (contenttype || 'application/json'),
			}
		};

		if (one) r.headers['Accept'] = "application/vnd.pgrst.object+json";

		if (expect === 'csv') r.headers['Accept'] = "text/csv";

		for (let k in r.headers)
			if (undefined === r.headers[k]) delete r.headers[k];

		return r;
	};

	go(request, table, params = {}, options = {}) {
		const url = new URL(this.base + "/" + table);

		for (let k in params) {
			let v = params[k];
			if (v instanceof Array) v = params[k].join(',');

			url.searchParams.set(k,v);
		}

		return fetch(url, request)
			.catch(e => ({
				"ok": false,
				"status": 0,
				"json": _ => null,
			}))
			.then(async r => {
				if (r.ok)
					return this.parse(r, options);

				else {
					let title, message;
					let type = 'error';
					const body = await r.json();

					switch (r.status) {
					case 0: {
						title = "Connection error";
						message = "No response from server";
						break;
					}

					case 400: {
						title = "Bad Request";
						message = body.message;
						break;
					}

					case 401: {
						localStorage.removeItem('token');

						title = "Unauthorised";
						message = body.message;

						if (body.message === 'JWT expired') {
							type = null;
							title = "Session expired";
							message = "Log in on the other tab.";
						}

						if (typeof this.login_redirect === 'function')
							this.login_redirect();

						break;
					}

					case 500: {
						title = "Server crash";
						message = "This is probably a bug";
						break;
					}

					case 502: {
						title = "Service is not running!";
						message = `NOT GOOD. Contact someone that knows better. Tell them: "Gateway Error"`;
						break;
					}

					default: {
						if (options.soft) {
							console.warn("SOFT request", r);
							throw new Error("SOFT request");
						}

						title = `${r.status}: ${r.statusText}`;
						message = body.message;

						break;
					}
					}

					this.flash.push({ type, title, message });

					throw new Error("pgrest: FAILED request", { cause: r });
				}
			});
	};

	get(table, params = {}, options = {}) {
		const req = this.req('GET', options);
		return this.go.call(this, req, ...arguments);
	};

	post(table, params = {}, options = {}) {
		const req = this.req('POST', options);

		req.headers["Prefer"] = "return=representation";
		if (req.headers['Content-Type'] === 'multipart/form-data')
			delete req.headers['Content-Type']; // OMFG...

		if (options.payload) {
			req.body = (req.headers['Content-Type'] === 'application/json') ?
				JSON.stringify(options.payload) :
				options.payload;
		}

		return this.go.call(this, req, ...arguments);
	};

	patch(table, params = {}, options = {}) {
		const req = this.req('PATCH', options);
		req.headers["Prefer"] = "return=representation";

		if (options.payload) {
			req.body = (req.headers['Content-Type'] === 'application/json') ?
				JSON.stringify(options.payload) :
				options.payload;
		}

		return this.go.call(this, req, ...arguments);
	};

	delete(table, params = {}, options = {}) {
		const req = this.req('DELETE', options);
		req.headers["Prefer"] = "return=representation";

		return this.go.call(this, req, ...arguments);
	};
}