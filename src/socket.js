import paver from './paver.js';

export function listen(id, fn) {
	const p = location.protocol === "https:" ? "wss" : "ws";

	const c = new WebSocket(`${p}://${location.host}${paver.base}/socket?id=${id}`);

	c.addEventListener("open", e => console.log("WebSocket Connected", e));

	c.addEventListener("close", e => console.log(`WebSocket Disconnected`, e));

	c.addEventListener("message", e => {
		if (typeof fn === 'function') fn(e.data);
		console.log(e.data);
	});

	return new Promise(r => c.addEventListener("open", _ => r()));
};
