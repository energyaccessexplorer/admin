export function listen(id, fn) {
	const p = location.protocol === "https:" ? "wss" : "ws";

	const c = new WebSocket(`${p}://${location.host}${dt_paver.base}/socket?id=${id}`);

	c.addEventListener("open", _ => console.info("connected!"));

	c.addEventListener("close", e => console.log(`WebSocket Disconnected code: ${e.code}, reason: ${e.reason}`, e));

	c.addEventListener("message", e => {
		if (typeof fn === 'function') fn(e.data);
		console.log(e.data);
	});

	return new Promise(r => c.addEventListener("open", _ => r()));
};
