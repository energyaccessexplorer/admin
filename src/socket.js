export function listen(id, fn) {
	const u = dt.config.paver_endpoint.replace(/^http/, 'ws');

	let attempts = 0;
	let resolve_ready, reject_ready;

	const ready = new Promise((resolve, reject) => {
		resolve_ready = resolve;
		reject_ready = reject;
	});

	const connect = _ => {
		const c = new WebSocket(`${u}/socket?id=${id}`);

		c.addEventListener("open", e => {
			attempts = 0;
			console.log("WebSocket Connected", e);
			resolve_ready();
		});

		c.addEventListener("error", e => console.log("WebSocket Error", e));

		// 1000 = server closed it on purpose (job finished). Anything else
		// is a drop: reconnect — the server keys progress on `id`. Reject
		// (not just resolve-on-open) once retries are exhausted so a failed
		// handshake surfaces as an error instead of leaving callers awaiting
		// this forever — see submit() in paver.js, which awaits this before
		// doing any real work.
		c.addEventListener("close", e => {
			console.log(`WebSocket Disconnected`, e);

			if (e.code === 1000) return;

			if (++attempts > 20) return reject_ready(new Error(`Paver socket closed before opening (code ${e.code})`));

			setTimeout(connect, 3000);
		});

		c.addEventListener("message", e => typeof fn === 'function' ? fn(e.data) : null);
	};

	connect();

	return ready;
};
