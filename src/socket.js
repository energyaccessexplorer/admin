export function listen(id, fn) {
	const u = dt.config.paver_endpoint.replace(/^http/, 'ws');

	const c = new WebSocket(`${u}/socket?id=${id}`);

	c.addEventListener("open", e => console.log("WebSocket Connected", e));

	c.addEventListener("close", e => console.log(`WebSocket Disconnected`, e));

	c.addEventListener("message", e => typeof fn === 'function' ? fn(e.data) : null);

	// Reject (not just resolve-on-open) so a failed handshake surfaces as an
	// error instead of leaving callers awaiting this forever — see submit()
	// in paver.js, which awaits this before doing any real work.
	return new Promise((resolve, reject) => {
		c.addEventListener("open", () => resolve());
		c.addEventListener("error", e => reject(new Error("Paver socket connection failed")));
		c.addEventListener("close", e => reject(new Error(`Paver socket closed before opening (code ${e.code})`)));
	});
};
