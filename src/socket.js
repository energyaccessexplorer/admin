export function listen(id, fn) {
	const u = dt.config.paver_endpoint.replace(/^http/, 'ws');

	let resolve_ready;
	let done = false;

	const ready = new Promise(r => resolve_ready = r);

	const connect = _ => {
		if (done) return;

		const c = new WebSocket(`${u}/socket?id=${id}`);

		c.addEventListener("open", e => {
			console.log("WebSocket Connected", e);
			resolve_ready();
		});

		// 1000 = server closed it on purpose (job finished). Anything else
		// is a drop: reconnect — the server keys progress on `id`. The
		// caller's close() (end of the job) stops the loop.
		c.addEventListener("close", e => {
			console.log(`WebSocket Disconnected`, e);

			if (e.code === 1000) done = true;

			setTimeout(connect, 3000);
		});

		c.addEventListener("message", e => typeof fn === 'function' ? fn(e.data) : null);
	};

	connect();

	return {
		ready,
		"close": _ => done = true,
	};
};
