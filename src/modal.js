export default class modal {
	constructor(o) {
		let d = document.createElement('dialog');
		d.id = o.id ?? "";
		d.className = 'modal';
		d.style = `
position: fixed;
top: 0;
left: 0;
display: none;
border: none;
margin: 0;
width: 100%;
height: 100%;
z-index: 1000;
background-color: rgba(0,0,0,0.4);
overflow-y: scroll;
`;

		this.main = document.createElement('main');
		this.main.style = `
margin: auto;
max-width: calc(100% - 2px);
width: fit-content;
width: -moz-fit-content;
`;
		d.append(this.main);

		this.dialog = d;

		this.header = document.createElement('header');
		this.content = document.createElement('content');
		this.footer = document.createElement('footer');

		this.main.prepend(this.header, this.content, this.footer);

		this.check = o.check;
		this.destroy = o.destroy || false;

		this.click_listener = e => {
			e.stopImmediatePropagation();

			if (e.target !== this.dialog) return false;

			if (this.destroy) this.remove();
			else this.hide();

			return true;
		};

		this.esc_listener = e => {
			if (e.key === "Escape") {
				const t = document.elementFromPoint(1,1);

				if (t !== this.dialog) return false;

				if (this.destroy) this.remove();
				else this.hide();

				return true;
			}
		};

		this.set(o);
		document.body.append(d);

		return this;
	}

	set(o) {
		this.set_el(this.header, o.header);
		this.set_el(this.content, o.content);
		this.set_el(this.footer, o.footer);

		return this;
	}

	set_el(el, t) {
		if (t) {
			while (el.lastChild) el.removeChild(el.lastChild);

			if (t instanceof Node) el.appendChild(t);
			else if (typeof t === 'string') el.innerHTML = t;
			else console.warn("modal.set_el", "what to do with a '%s'?", typeof t);
		}

		el.style.display = (t === null || el.innerHTML === "") ? "none" : "block";
	}

	show(callback) {
		this.dialog.style['display'] = 'block';
		document.addEventListener('keydown', this.esc_listener);

		this.dialog.addEventListener('click', this.click_listener);

		document.addEventListener('keydown', this.esc_listener);

		document.body.append(this.dialog);

		if (typeof callback === 'function') callback(this);

		return this.dialog;
	}

	hide(callback) {
		if (typeof this.check === 'function' && !this.check()) return false;

		this.dialog.style['display'] = 'none';

		document.removeEventListener('keydown', this.esc_listener);

		if (typeof callback === 'function') callback(this);
		return true;
	}

	_empty_close() {
		let d = this.dialog;

		while (d.lastChild) d.removeChild(d.lastChild);
		d.remove();
	}

	remove(callback, force = false) {
		if (force) {
			this._empty_close();
			return true;
		}

		if (!this.hide()) return false;

		this._empty_close();

		if (typeof callback === 'function') callback(this);
		return true;
	}
}