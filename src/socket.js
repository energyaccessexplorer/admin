export function listen(id, fn) {
	const u = dt.config.paver_endpoint.replace(/^http/, 'ws');

	let attempts = 0;
	let resolve_ready;

	const ready = new Promise(r => resolve_ready = r);

	const connect = _ => {
		const c = new WebSocket(`${u}/socket?id=${id}`);

		c.addEventListener("open", e => {
			attempts = 0;
			console.log("WebSocket Connected", e);
			resolve_ready();
		});

		// 1000 = server closed it on purpose (job finished). Anything else
		// is a drop: reconnect — the server keys progress on `id`.
		c.addEventListener("close", e => {
			console.log(`WebSocket Disconnected`, e);

			if (e.code === 1000 || ++attempts > 20) return;

			setTimeout(connect, 3000);
		});

		c.addEventListener("message", e => typeof fn === 'function' ? fn(e.data) : null);
	};

	connect();

	return ready;
};
