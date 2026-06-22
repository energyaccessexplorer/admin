var sortable=function(){"use strict";function d(e,t,n){if(void 0===n)return e&&e.h5s&&e.h5s.data&&e.h5s.data[t];e.h5s=e.h5s||{},e.h5s.data=e.h5s.data||{},e.h5s.data[t]=n;}function u(e,t){if(!(e instanceof NodeList||e instanceof HTMLCollection||e instanceof Array))throw new Error("You must provide a nodeList/HTMLCollection/Array of elements to be filtered.");return"string"!=typeof t?Array.from(e):Array.from(e).filter(function(e){return 1===e.nodeType&&e.matches(t);});}var p=new Map,t=function(){function e(){this._config=new Map,this._placeholder=void 0,this._data=new Map;}return Object.defineProperty(e.prototype,"config",{"get": function(){var n={};return this._config.forEach(function(e,t){n[t]=e;}),n;},"set": function(e){if("object"!=typeof e)throw new Error("You must provide a valid configuration object to the config setter.");var t=Object.assign({},e);this._config=new Map(Object.entries(t));},"enumerable": !0,"configurable": !0}),e.prototype.setConfig=function(e,t){if(!this._config.has(e))throw new Error("Trying to set invalid configuration item: "+e);this._config.set(e,t);},e.prototype.getConfig=function(e){if(!this._config.has(e))throw new Error("Invalid configuration item requested: "+e);return this._config.get(e);},Object.defineProperty(e.prototype,"placeholder",{"get": function(){return this._placeholder;},"set": function(e){if(!(e instanceof HTMLElement)&&null!==e)throw new Error("A placeholder must be an html element or null.");this._placeholder=e;},"enumerable": !0,"configurable": !0}),e.prototype.setData=function(e,t){if("string"!=typeof e)throw new Error("The key must be a string.");this._data.set(e,t);},e.prototype.getData=function(e){if("string"!=typeof e)throw new Error("The key must be a string.");return this._data.get(e);},e.prototype.deleteData=function(e){if("string"!=typeof e)throw new Error("The key must be a string.");return this._data.delete(e);},e;}();function m(e){if(!(e instanceof HTMLElement))throw new Error("Please provide a sortable to the store function.");return p.has(e)||p.set(e,new t),p.get(e);}function g(e,t,n){if(e instanceof Array)for(var r=0;r<e.length;++r)g(e[r],t,n);else e.addEventListener(t,n),m(e).setData("event"+t,n);}function l(e,t){if(e instanceof Array)for(var n=0;n<e.length;++n)l(e[n],t);else e.removeEventListener(t,m(e).getData("event"+t)),m(e).deleteData("event"+t);}function h(e,t,n){if(e instanceof Array)for(var r=0;r<e.length;++r)h(e[r],t,n);else e.setAttribute(t,n);}function s(e,t){if(e instanceof Array)for(var n=0;n<e.length;++n)s(e[n],t);else e.removeAttribute(t);}function v(e){if(!e.parentElement||0===e.getClientRects().length)throw new Error("target element must be part of the dom");var t=e.getClientRects()[0];return{"left": t.left+window.pageXOffset,"right": t.right+window.pageXOffset,"top": t.top+window.pageYOffset,"bottom": t.bottom+window.pageYOffset};}function y(e,t){if(!(e instanceof HTMLElement&&(t instanceof NodeList||t instanceof HTMLCollection||t instanceof Array)))throw new Error("You must provide an element and a list of elements.");return Array.from(t).indexOf(e);}function E(e){if(!(e instanceof HTMLElement))throw new Error("Element is not a node element.");return null!==e.parentNode;}var n=function(e,t,n){if(!(e instanceof HTMLElement&&e.parentElement instanceof HTMLElement))throw new Error("target and element must be a node");e.parentElement.insertBefore(t,"before"===n?e:e.nextElementSibling);},w=function(e,t){return n(e,t,"before");},b=function(e,t){return n(e,t,"after");};function T(e){if(!(e instanceof HTMLElement))throw new Error("You must provide a valid dom element");var n=window.getComputedStyle(e);return["height","padding-top","padding-bottom"].map(function(e){var t=parseInt(n.getPropertyValue(e),10);return isNaN(t)?0:t;}).reduce(function(e,t){return e+t;});}function f(e,t){if(!(e instanceof Array))throw new Error("You must provide a Array of HTMLElements to be filtered.");return"string"!=typeof t?e:e.filter(function(e){return e.querySelector(t)instanceof HTMLElement;}).map(function(e){return e.querySelector(t);});}var L=function(e,t,n){return{"element": e,"posX": n.pageX-t.left,"posY": n.pageY-t.top};};function C(e,t){if(!0===e.isSortable){var n=m(e).getConfig("acceptFrom");if(null!==n&&!1!==n&&"string"!=typeof n)throw new Error('HTML5Sortable: Wrong argument, "acceptFrom" must be "null", "false", or a valid selector string.');if(null!==n)return!1!==n&&0<n.split(",").filter(function(e){return 0<e.length&&t.matches(e);}).length;if(e===t)return!0;if(void 0!==m(e).getConfig("connectWith")&&null!==m(e).getConfig("connectWith"))return m(e).getConfig("connectWith")===m(t).getConfig("connectWith");}return!1;}var M,A,D,x,H,I,S,Y={"items": null,"connectWith": null,"disableIEFix": null,"acceptFrom": null,"copy": !1,"placeholder": null,"placeholderClass": "sortable-placeholder","draggingClass": "sortable-dragging","hoverClass": !1,"debounce": 0,"throttleTime": 100,"maxItems": 0,"itemSerializer": void 0,"containerSerializer": void 0,"customDragImage": null};function O(e,t){if("string"==typeof m(e).getConfig("hoverClass")){var o=m(e).getConfig("hoverClass").split(" ");!0===t?(g(e,"mousemove",function(r,o){var i=this;if(void 0===o&&(o=250),"function"!=typeof r)throw new Error("You must provide a function as the first argument for throttle.");if("number"!=typeof o)throw new Error("You must provide a number as the second argument for throttle.");var a=null;return function(){for(var e=[],t=0;t<arguments.length;t++)e[t-0]=arguments[t];var n=Date.now();(null===a||o<=n-a)&&(a=n,r.apply(i,e));};}(function(r){0===r.buttons&&u(e.children,m(e).getConfig("items")).forEach(function(e){var t,n;e!==r.target?(t=e.classList).remove.apply(t,o):(n=e.classList).add.apply(n,o);});},m(e).getConfig("throttleTime"))),g(e,"mouseleave",function(){u(e.children,m(e).getConfig("items")).forEach(function(e){var t;(t=e.classList).remove.apply(t,o);});})):(l(e,"mousemove"),l(e,"mouseleave"));}}var c=function(e){l(e,"dragstart"),l(e,"dragend"),l(e,"dragover"),l(e,"dragenter"),l(e,"drop"),l(e,"mouseenter"),l(e,"mouseleave");},_=function(e,t){var n=e;return!0===m(t).getConfig("copy")&&(h(n=e.cloneNode(!0),"aria-copied","true"),e.parentElement.appendChild(n),n.style.display="none",n.oldDisplay=e.style.display),n;};function W(e){for(;!0!==e.isSortable;)e=e.parentElement;return e;}function F(e,t){var n=d(e,"opts"),r=u(e.children,n.items).filter(function(e){return e.contains(t);});return 0<r.length?r[0]:t;}var r=function(e){var t,n,r,o=d(e,"opts")||{},i=u(e.children,o.items),a=f(i,o.handle);l(e,"dragover"),l(e,"dragenter"),l(e,"drop"),(n=t=e).h5s&&delete n.h5s.data,s(t,"aria-dropeffect"),l(a,"mousedown"),c(i),s(r=i,"aria-grabbed"),s(r,"aria-copied"),s(r,"draggable"),s(r,"role");},N=function(e){var t=d(e,"opts"),n=u(e.children,t.items),r=f(n,t.handle);(h(e,"aria-dropeffect","move"),d(e,"_disabled","false"),h(r,"draggable","true"),!1===t.disableIEFix)&&("function"==typeof(document||window.document).createElement("span").dragDrop&&g(r,"mousedown",function(){if(-1!==n.indexOf(this))this.dragDrop();else{for(var e=this.parentElement;-1===n.indexOf(e);)e=e.parentElement;e.dragDrop();}}));},P=function(e){var t=d(e,"opts"),n=u(e.children,t.items),r=f(n,t.handle);d(e,"_disabled","false"),c(n),l(r,"mousedown"),l(e,"dragover"),l(e,"dragenter"),l(e,"drop");};function j(e,c){var f=String(c);return c=c||{},"string"==typeof e&&(e=document.querySelectorAll(e)),e instanceof HTMLElement&&(e=[e]),e=Array.prototype.slice.call(e),/serialize/.test(f)?e.map(function(e){var t=d(e,"opts");return function(t,n,e){if(void 0===n&&(n=function(e,t){return e;}),void 0===e&&(e=function(e){return e;}),!(t instanceof HTMLElement)||1==!t.isSortable)throw new Error("You need to provide a sortableContainer to be serialized.");if("function"!=typeof n||"function"!=typeof e)throw new Error("You need to provide a valid serializer for items and the container.");var r=d(t,"opts").items,o=u(t.children,r),i=o.map(function(e){return{"parent": t,"node": e,"html": e.outerHTML,"index": y(e,o)};});return{"container": e({"node": t,"itemCount": i.length}),"items": i.map(function(e){return n(e,t);})};}(e,t.itemSerializer,t.containerSerializer);}):(e.forEach(function(s){if(/enable|disable|destroy/.test(f))return j[f](s);["connectWith","disableIEFix"].forEach(function(e){c.hasOwnProperty(e)&&null!==c[e]&&console.warn('HTML5Sortable: You are using the deprecated configuration "'+e+'". This will be removed in an upcoming version, make sure to migrate to the new options when updating.');}),c=Object.assign({},Y,m(s).config,c),m(s).config=c,d(s,"opts",c),s.isSortable=!0,P(s);var e,t=u(s.children,c.items);if(null!==c.placeholder&&void 0!==c.placeholder){var n=document.createElement(s.tagName);n.innerHTML=c.placeholder,e=n.children[0];}m(s).placeholder=function(e,t,n){if(void 0===n&&(n="sortable-placeholder"),!(e instanceof HTMLElement))throw new Error("You must provide a valid element as a sortable.");if(!(t instanceof HTMLElement)&&void 0!==t)throw new Error("You must provide a valid element as a placeholder or set ot to undefined.");return void 0===t&&(["UL","OL"].includes(e.tagName)?t=document.createElement("li"):["TABLE","TBODY"].includes(e.tagName)?(t=document.createElement("tr")).innerHTML='<td colspan="100"></td>':t=document.createElement("div")),"string"==typeof n&&(r=t.classList).add.apply(r,n.split(" ")),t;var r;}(s,e,c.placeholderClass),d(s,"items",c.items),c.acceptFrom?d(s,"acceptFrom",c.acceptFrom):c.connectWith&&d(s,"connectWith",c.connectWith),N(s),h(t,"role","option"),h(t,"aria-grabbed","false"),O(s,!0),g(s,"dragstart",function(e){if(!0!==e.target.isSortable&&(e.stopImmediatePropagation(),(!c.handle||e.target.matches(c.handle))&&"false"!==e.target.getAttribute("draggable"))){var t=W(e.target),n=F(t,e.target);I=u(t.children,c.items),x=I.indexOf(n),H=y(n,t.children),D=t,function(e,t,n){if(!(e instanceof Event))throw new Error("setDragImage requires a DragEvent as the first argument.");if(!(t instanceof HTMLElement))throw new Error("setDragImage requires the dragged element as the second argument.");if(n||(n=L),e.dataTransfer&&e.dataTransfer.setDragImage){var r=n(t,v(t),e);if(!(r.element instanceof HTMLElement)||"number"!=typeof r.posX||"number"!=typeof r.posY)throw new Error("The customDragImage function you provided must return and object with the properties element[string], posX[integer], posY[integer].");e.dataTransfer.effectAllowed="copyMove",e.dataTransfer.setData("text/plain",e.target.id),e.dataTransfer.setDragImage(r.element,r.posX,r.posY);}}(e,n,c.customDragImage),A=T(n),n.classList.add(c.draggingClass),h(M=_(n,t),"aria-grabbed","true"),t.dispatchEvent(new CustomEvent("sortstart",{"detail": {"origin": {"elementIndex": H,"index": x,"container": D},"item": M}}));}}),g(s,"dragenter",function(e){if(!0!==e.target.isSortable){var t=W(e.target);S=u(t.children,d(t,"items")).filter(function(e){return e!==m(s).placeholder;});}}),g(s,"dragend",function(e){if(M){M.classList.remove(c.draggingClass),h(M,"aria-grabbed","false"),"true"===M.getAttribute("aria-copied")&&"true"!==d(M,"dropped")&&M.remove(),M.style.display=M.oldDisplay,delete M.oldDisplay;var t=Array.from(p.values()).map(function(e){return e.placeholder;}).filter(function(e){return e instanceof HTMLElement;}).filter(E)[0];t&&t.remove(),s.dispatchEvent(new CustomEvent("sortstop",{"detail": {"origin": {"elementIndex": H,"index": x,"container": D},"item": M}})),A=M=null;}}),g(s,"drop",function(e){if(C(s,M.parentElement)){e.preventDefault(),e.stopPropagation(),d(M,"dropped","true");var t=Array.from(p.values()).map(function(e){return e.placeholder;}).filter(function(e){return e instanceof HTMLElement;}).filter(E)[0];b(t,M),t.remove(),s.dispatchEvent(new CustomEvent("sortstop",{"detail": {"origin": {"elementIndex": H,"index": x,"container": D},"item": M}}));var n=m(s).placeholder,r=u(D.children,c.items).filter(function(e){return e!==n;}),o=!0===this.isSortable?this:this.parentElement,i=u(o.children,d(o,"items")).filter(function(e){return e!==n;}),a=y(M,Array.from(M.parentElement.children).filter(function(e){return e!==n;})),l=y(M,i);H===a&&D===o||s.dispatchEvent(new CustomEvent("sortupdate",{"detail": {"origin": {"elementIndex": H,"index": x,"container": D,"itemsBeforeUpdate": I,"items": r},"destination": {"index": l,"elementIndex": a,"container": o,"itemsBeforeUpdate": S,"items": i},"item": M}}));}});var r,o,i,a=(r=function(t,e,n){if(M)if(c.forcePlaceholderSize&&(m(t).placeholder.style.height=A+"px"),-1<Array.from(t.children).indexOf(e)){var r=T(e),o=y(m(t).placeholder,e.parentElement.children),i=y(e,e.parentElement.children);if(A<r){var a=r-A,l=v(e).top;if(o<i&&n<l)return;if(i<o&&l+r-a<n)return;}void 0===M.oldDisplay&&(M.oldDisplay=M.style.display),"none"!==M.style.display&&(M.style.display="none");var s=!1;try{s=v(e).top+e.offsetHeight/2<=n;}catch(e){s=o<i;}s?b(e,m(t).placeholder):w(e,m(t).placeholder),Array.from(p.values()).filter(function(e){return void 0!==e.placeholder;}).forEach(function(e){e.placeholder!==m(t).placeholder&&e.placeholder.remove();});}else{var f=Array.from(p.values()).filter(function(e){return void 0!==e.placeholder;}).map(function(e){return e.placeholder;});-1!==f.indexOf(e)||t!==e||u(e.children,c.items).length||(f.forEach(function(e){return e.remove();}),e.appendChild(m(t).placeholder));}},void 0===(o=c.debounce)&&(o=0),function(){for(var e=[],t=0;t<arguments.length;t++)e[t-0]=arguments[t];clearTimeout(i),i=setTimeout(function(){r.apply(void 0,e);},o);}),l=function(e){var t=e.target,n=!0===t.isSortable?t:W(t);if(t=F(n,t),M&&C(n,M.parentElement)&&"true"!==d(n,"_disabled")){var r=d(n,"opts");parseInt(r.maxItems)&&u(n.children,d(n,"items")).length>=parseInt(r.maxItems)&&M.parentElement!==n||(e.preventDefault(),e.stopPropagation(),e.dataTransfer.dropEffect=!0===m(n).getConfig("copy")?"copy":"move",a(n,t,e.pageY));}};g(t.concat(s),"dragover",l),g(t.concat(s),"dragenter",l);}),e);}return j.destroy=function(e){r(e);},j.enable=function(e){N(e);},j.disable=function(e){var t,n,r;n=d(t=e,"opts"),r=f(u(t.children,n.items),n.handle),h(t,"aria-dropeffect","none"),d(t,"_disabled","true"),h(r,"draggable","false"),l(r,"mousedown");},j;}();
//# sourceMappingURL=html5sortable.min.js.map
(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
		factory();
}((function () { 'use strict';

	/**
     * The code was extracted from:
     * https://github.com/davidchambers/Base64.js
     */

	var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	function InvalidCharacterError(message) {
		this.message = message;
	}

	InvalidCharacterError.prototype = new Error();
	InvalidCharacterError.prototype.name = "InvalidCharacterError";

	function polyfill(input) {
		var str = String(input).replace(/=+$/, "");
		if (str.length % 4 == 1) {
			throw new InvalidCharacterError(
				"'atob' failed: The string to be decoded is not correctly encoded.",
			);
		}
		for (
		// initialize result and counters
			var bc = 0, bs, buffer, idx = 0, output = "";
		// get next character
			(buffer = str.charAt(idx++));
		// character found in table? initialize bit storage and add its ascii value;
			~buffer &&
            ((bs = bc % 4 ? bs * 64 + buffer : buffer),
            // and if not first of each 4 characters,
            // convert the first 8 bits to one ascii character
            bc++ % 4) ?
				(output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)))) :
				0
		) {
			// try to find character in table (0-63, not found => -1)
			buffer = chars.indexOf(buffer);
		}
		return output;
	}

	var atob = (typeof window !== "undefined" &&
        window.atob &&
        window.atob.bind(window)) ||
    polyfill;

	function b64DecodeUnicode(str) {
		return decodeURIComponent(
			atob(str).replace(/(.)/g, function(m, p) {
				var code = p.charCodeAt(0).toString(16).toUpperCase();
				if (code.length < 2) {
					code = "0" + code;
				}
				return "%" + code;
			}),
		);
	}

	function base64_url_decode(str) {
		var output = str.replace(/-/g, "+").replace(/_/g, "/");
		switch (output.length % 4) {
		case 0:
			break;
		case 2:
			output += "==";
			break;
		case 3:
			output += "=";
			break;
		default:
			throw "Illegal base64url string!";
		}

		try {
			return b64DecodeUnicode(output);
		} catch (err) {
			return atob(output);
		}
	}

	function InvalidTokenError(message) {
		this.message = message;
	}

	InvalidTokenError.prototype = new Error();
	InvalidTokenError.prototype.name = "InvalidTokenError";

	function jwtDecode(token, options) {
		if (typeof token !== "string") {
			throw new InvalidTokenError("Invalid token specified");
		}

		options = options || {};
		var pos = options.header === true ? 0 : 1;
		try {
			return JSON.parse(base64_url_decode(token.split(".")[pos]));
		} catch (e) {
			throw new InvalidTokenError("Invalid token specified: " + e.message);
		}
	}

	/*
     * Expose the function on the window object
     */

	//use amd or just through the window object.
	if (window) {
		if (typeof window.define == "function" && window.define.amd) {
			window.define("jwt_decode", function() {
				return jwtDecode;
			});
		} else if (window) {
			window.jwt_decode = jwtDecode;
		}
	}

})));
//# sourceMappingURL=jwt-decode.js.map
class flash {
	constructor() {
		let el = document.querySelector('aside#flash');
		if (!el) {
			el = document.createElement('aside');
			el.id = 'flash';
			el.style = `
position: fixed;
top: 7px;
left: 7px;
z-index: 9999;`;

			document.body.prepend(el);
		}

		this.el = el;
	}

	push(e) {
		const colors = this.e_colors(e.type);
		const timeout = isFinite(e.timeout) ? e.timeout : this.e_timeout(e.type);
		const item_el = this.e_element(e, colors);

		if (timeout > 0)
			setTimeout(function() { item_el.remove(); }, timeout);

		this.el.prepend(item_el);

		return this;
	}

	clear() {
		this.el.innerHTML = "";

		return this;
	}

	e_element(e, colors) {
		const d = document.createElement('div');
		d.className = "flash-item";
		let html = '';

		if (e.title)
			html += `<strong class="flash-title">${e.title}</strong>`;

		if (e.title && e.message)
			html += '<br>';

		html += `<pre class="flash-message">${e.message ?? ''}</pre>`;

		d.innerHTML = html;
		d.style = `
margin-bottom: 10px;
padding: 20px 20px 10px;
`;

		for (const c in colors)
			d.style[c] = colors[c];

		d.addEventListener('click', _ => d.remove());

		return d;
	}

	e_timeout(type) {
		let t;

		switch (type) {
		case "error":
			t = 0;
			break;

		case "warn":
		case "info":
			t = 10000;
			break;

		case "success":
			t = 1000;
			break;

		default:
			t = 5000;
			break;
		}
		return t;
	}

	e_colors(type) {
		let bc, c, b;

		switch (type) {
		case "error":
			bc = '#f8d7da';
			c = '#842029';
			b = '#f5c2c7';
			break;

		case "warn":
			bc = '#fff3cd';
			c = '#664d03';
			b = '#ffecb5';
			break;

		case "info":
			bc = '#cff4fc';
			c = '#055160';
			b = '#b6effb';
			break;

		case "success":
			bc = '#d1e7dd';
			c = '#0f5132';
			b = '#badbcc';
			break;

		default:
			bc = '#e2e3e5';
			c = '#41464b';
			b = '#d3d6d8';
		}
		return { "background-color": bc, "color": c, "border": `1px solid ${b}`, "border-radius": "2px" };
	}
}

class modal {
	constructor(o) {
		const d = document.createElement('dialog');
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
background-color: transparent;
z-index: 999;
overflow-y: scroll;
box-sizing: border-box;
`;

		this.main = document.createElement('main');
		this.main.style = `
position: relative;
margin: auto;
max-width: calc(100% - 2px);
width: fit-content;
width: -moz-fit-content;
z-index: 1001;
`;

		this.underlay = document.createElement('div');
		this.underlay.style = `
position: fixed;
top: 0;
left: 0;
margin: 0;
width: 100%;
height: 100%;
z-index: 1000;
background-color: rgba(0,0,0,0.4);
`;

		this.closebutton = document.createElement('div');
		this.closebutton.innerHTML = "&times;";
		this.closebutton.className = 'close';

		d.append(this.underlay, this.main);

		this.dialog = d;

		this.header = document.createElement('header');
		this.content = document.createElement('content');
		this.footer = document.createElement('footer');

		this.main.prepend(
			this.header,
			this.content,
			this.footer,
			(o.noclose ? "" : this.closebutton),
		);

		this.check = o.check;
		this.destroy = o.destroy || false;

		this.click_listener = e => {
			e.stopPropagation();

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
			else {console.warn("modal.set_el", "what to do with a '%s'?", typeof t);}
		}

		el.style.display = (t === null || el.innerHTML === "") ? "none" : "block";
	}

	show(callback) {
		this.dialog.style['display'] = 'block';
		document.addEventListener('keydown', this.esc_listener);

		this.underlay.addEventListener('click', this.click_listener);

		this.closebutton.addEventListener('click', this.click_listener);

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
		const d = this.dialog;

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

class pgrest {
	constructor(base, flash, login_redirect) {
		this.base = base;
		this.flash = flash || { "push": x => console.log(x), "clear": _ => null };
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
		catch (err) {
			console.error(err);
			body = { "message": `pgrst#parse: failed to parse '${options.expect}' response` };
		}

		return body;
	};

	req(method, options) {
		const {contenttype, one, expect, count, schema} = options;

		const t = localStorage.getItem('token');

		const r = {
			"method":  method,
			"headers": {
				"Authorization": t ? `Bearer ${t}` : undefined,
				"Content-Type":  (contenttype || 'application/json'),
			},
		};

		if (one) r.headers['Accept'] = "application/vnd.pgrst.object+json";

		if (expect === 'csv') r.headers['Accept'] = "text/csv";

		if (count) r.headers['Prefer'] = "count=exact";

		if (schema) {
			switch (method) {
			case "GET":
			case "HEAD": {
				r.headers['Accept-Profile'] = schema;
				break;
			}

			case "POST":
			case "PATCH":
			case "DELETE": {
				r.headers['Content-Profile'] = schema;
				break;
			}
			}
		}

		for (const k in r.headers)
			if (undefined === r.headers[k]) delete r.headers[k];

		return r;
	};

	go(request, table, params = {}, options = {}) {
		const url = new URL(this.base + "/" + table);

		for (const k in params) {
			let v = params[k];
			if (v instanceof Array) v = params[k].join(',');

			url.searchParams.set(k,v);
		}

		return fetch(url, request)
			.catch(_ => ({
				"ok":     false,
				"status": 0,
				"json":   _ => null,
			}))
			.then(async r => {
				if (request.method === "HEAD")
					return r.headers;

				if (r.ok)
					return this.parse(r, options);
				else {
					let body = {};
					let title, message;

					const redirect = typeof this.login_redirect === 'function' ?
						this.login_redirect :
						_ => null;

					if (r.status !== 0) {
						body = r.headers.get('content-type').match(/application\/json/) ?
							await r.json() :
							{ "message": await r.text() };
					}

					title = (r.statusText === "") ? `Status code: ${r.status}` : r.statusText;
					message = body.message;

					switch (r.status) {
					case 0: {
						title = "Connection error";
						message = "No response from server";
						break;
					}

					case 400: {
						title = "Bad Request";
						break;
					}

					case 401: {
						if (message === "JWT expired") {
							message = "Authentication token expired. Log in on the other tab.";

							localStorage.removeItem('token');
							redirect();
						} else if (message.match(/JWSError .*/)) {
							message = "Invalid authentication token. Log in on the other tab.";

							localStorage.removeItem('token');
							redirect();
						}

						break;
					}

					case 406: {
						if (request.headers['Accept'] !== "application/vnd.pgrst.object+json")
							break;

						if (body.details === "The result contains 0 rows") {
							title = "No result";
							message = `Not enough permissions (?)`;
						} else if (body.details.match(/The result contains [0-9]+ rows/)) {
							title = "Too many results";
							message = "This may be a bug." + "\n\n" + url;
						}

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

						break;
					}
					}

					this.flash.push({ "type": "error", title, message });

					console.error(r);

					return null;
				}
			});
	};

	get(table, _, options = {}) {
		const req = this.req('GET', options);
		return this.go.call(this, req, ...arguments);
	};

	head(table, _, options = {}) {
		const req = this.req('HEAD', options);
		return this.go.call(this, req, ...arguments);
	};

	post(table, _, options = {}) {
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

	patch(table, _, options = {}) {
		const req = this.req('PATCH', options);
		req.headers["Prefer"] = "return=representation";

		if (options.payload) {
			req.body = (req.headers['Content-Type'] === 'application/json') ?
				JSON.stringify(options.payload) :
				options.payload;
		}

		return this.go.call(this, req, ...arguments);
	};

	delete(table, _, options = {}) {
		const req = this.req('DELETE', options);
		req.headers["Prefer"] = "return=representation";

		return this.go.call(this, req, ...arguments);
	};
}

const noop = _ => null;

async function sha(str, size = 256) {
	if (![1,256,384,512].includes(size)) throw new Error(`sha: algorithm SHA-${size} not supported.`);

	const hb = await crypto.subtle.digest('SHA-'+size, new TextEncoder().encode(str));
	return Array.from(new Uint8Array(hb)).map(b => b.toString(16).padStart(2, '0')).join('');
}
async function login$1({ endpoint, email, password, world, error, success }) {
	const url = new URL(location);

	return fetch(endpoint, {
		"method": "POST",
		"body":   JSON.stringify({
			"email":    email,
			"password": await sha(password),
			"world":    world,
		}),
		"headers": {
			"content-type": 'application/json',
		},
	})
		.catch(r => {
			error({
				"type":    'error',
				"title":   "This should NOT be happening!",
				"message": r,
			});

			throw new Error(r);
		})
		.then(async r => ({
			"status":   r.status,
			"response": await r.text(),
		}))
		.then(r => {
			switch (r.status) {
			case 200: {
				let rd;
				localStorage.setItem("token", r.response);

				if (url.searchParams.get('popup') === "true")
					window.close();

				else if (rd = url.searchParams.get('auth-redirect'))
					window.location = decodeURIComponent(rd);

				else {
					success({
						"type":  'success',
						"title": "Logged in",
					});
				}

				break;
			}

			case 400: {
				error({
					"type":    'error',
					"title":   "Bad Request",
					"message": r.response,
				});

				break;
			}

			case 401: {
				error({
					"type":    'error',
					"title":   "Unauthorized",
					"message": r.response,
				});

				break;
			}

			default: {
				error({
					"type":    'error',
					"title":   "Server Error!",
					"message": r.response,
				});

				break;
			}
			}
		});
}
function form$1(args) {
	const {
		submit_text = "Log in",
	} = args;

	const f = document.createElement('form');
	f.setAttribute('autocomplete', 'off');

	const e = document.createElement('input');
	e.setAttribute('type', 'email');
	e.setAttribute('name', 'email');
	e.setAttribute('placeholder', 'email');
	e.setAttribute('autofocus', '');
	e.setAttribute('required', '');

	const p = document.createElement('input');
	p.setAttribute('type', 'password');
	p.setAttribute('name', 'pass');
	p.setAttribute('placeholder', 'password');
	p.setAttribute('required', '');

	const s = document.createElement('button');
	s.setAttribute('type', 'submit');
	s.innerText = submit_text;

	f.onsubmit = async function submit(v) {
		v.preventDefault();

		e.setAttribute('disabled', '');
		p.setAttribute('disabled', '');
		s.setAttribute('disabled', '');

		await login$1({
			...args,
			"email":    e.value,
			"password": p.value,
		});

		e.removeAttribute('disabled');
		p.removeAttribute('disabled');
		s.removeAttribute('disabled');
	};

	f.append(e,p,s);

	return f;
}
function init$2({
	endpoint,
	world,
	success = noop,
	error = m => { alert(m.message); },
}) {
	return form$1({
		endpoint,
		world,
		success,
		error,
	});
}

const UUID_REGEXP = "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$";

const Whatever = new Promise((resolve, _) => resolve());

function qs(str, el) {
	if (!el) el = document;
	else if (!(el instanceof Node))
		throw Error(`qs: Expected a Node. got ${el}.`);

	const r = el.querySelector(str);

	return (!r && el.shadowRoot) ?
		el.shadowRoot.querySelector(str) :
		r;
}
function qsa(str, el, array = false) {
	if (!el) el = document;
	else if (!(el instanceof Node))
		throw Error(`qs: Expected a Node. got ${el}.`);

	const all = el.querySelectorAll(str);

	const r = (!all.length && el.shadowRoot) ?
		el.shadowRoot.querySelectorAll(str) :
		all;

	if (array) {
		const a = [];
		for (let i = r.length; i--; a.unshift(r[i]));
		return a;
	}

	return r;
}
function ce(str, content, attrs = {}) {
	const el = document.createElement(str);
	for (const o in attrs)
		if (attrs.hasOwnProperty(o) && attrs[o] !== undefined) el.setAttribute(o, attrs[o]);

	const add = c => {
		if (c instanceof Node)
			el.append(c);
		else if (typeof c === 'object')
			el.append(JSON.stringify(c));
		else
			el.append(c);
	};

	if (Array.isArray(content))
		for (const c of content) add(c);

	else if (typeof content === 'string')
		el.innerHTML = content;

	else if (content === undefined || content === null)
		el.innerText = "";

	else
		add(content);

	return el;
}
function remote_tmpl(u) {
	const url = new URL(location);
	url.pathname += 'templates/' + u;

	return fetch(url)
		.then(r => r.ok ? r.text() : "")
		.then(r => {
			const t = document.createElement('template');
			t.innerHTML = r;

			return t.content;
		});
}
function tmpl$1(s) {
	const el = qs(s);
	if (!el) return null;

	return el.content.cloneNode(true);
}
function delay(s) {

	return new Promise(_ => setTimeout(_, s * 1000));
}
function debounce(fn, timeout = 300) {
	let t;

	return (...args) => {
		clearTimeout(t);
		t = setTimeout(_ => fn.apply(this, args), timeout);
	};
}
function maybe$1(o, ...path) {
	return (o === null || o === undefined || !path.length) ? o :
		maybe$1(o[path[0]], ...path.slice(1));
}
function coalesce() {
	if (!arguments.length) return undefined;

	const a = arguments[0];

	return (null === a || undefined === a) ?
		coalesce(...Array.prototype.slice.call(arguments, 1)) : a;
}
function and$1(head, ...tail) {
	if (!head) return false;
	if (!tail.length) return head;

	return and$1(Boolean(tail[0]), ...tail.slice(1));
}
function or$1(head, ...tail) {
	if (head) return true;
	if (!tail.length) return head;

	return or$1(Boolean(tail[0]), ...tail.slice(1));
}
function exec(fn, ...args) {
	if (typeof fn === 'function')
		return fn.apply(this, args);
}
function empty(o) {
	return (o === undefined
	        || o === null
	        || (typeof o === "string" && o.length === 0)
	        || (Array.isArray(o) && o.length === 0)
	        || (Object.keys(o).length === 0));
}
function uuid() {
	const r = c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, r);
}

function login(config) {
	const login_path = /\/\?login/;

	console.log(config);

	if (and$1(!localStorage.getItem('token'),
	        !location.href.match(login_path))) {
		window.location = config.base + '/?login';
		return true;
	}

	else if (location.href.match(login_path)) {
		document.body.replaceChildren();

		const FLASH = new flash();

		const img = ce('img', null, {
			"src":   config.logo || config.src.replace(/bundle(.min)?.js/, 'logo.svg'),
			"style": "display: block; max-width: 20em; max-height: 5em; margin: 2em auto;",
		});

		const d = ce('div', img, { "style": "margin: 5em auto;" });
		document.body.append(d);

		const lf = init$2({
			"endpoint": config.auth_server + "/login",
			"world":    config.auth_world,
			"success":  _ => window.location = config.base,
			"error":    m => {
				if (config.email_reset &&
				    m.message.match(/email/i) &&
				    m.message.match(/(not|un)/i) &&
				    m.message.match(/confirm/i)) {
					FLASH.push({
						"type":    "info",
						"timeout": 0,
						"title":   "Password confirmation",
						"message": `Your email can also be confirmed by resetting your password <u><strong><a href="${config.email_reset}">here</a><strong></u>`,
					});
				}

				FLASH.push(m);
			},
		});
		lf.id = "login";

		d.append(lf);

		return true;
	}

	return false;
}

function external_link(obj, form, link) {
	const a = ce('a', bi_icon('box-arrow-in-up-right'), { "href": link(obj.data), "target": "_blank" });
	qs(':scope > fieldset > legend', form).prepend(a);
}
function focus_copy(input) {
	const FLASH = dt.FLASH;

	input.focus();
	input.select();

	if (document.execCommand('copy'))
		FLASH.push({ "type": 'success', "message": "ID copied to clipboard" });
	else
		FLASH.push({ "message": "Unable to copy to clipboard. Do it manually" });
}
function string_fetch_handler(o, target_input, target_label, callback) {
	const API = dt.API;
	const FLASH = dt.FLASH;
	const config = dt.config;

	function do_it(r) {
		const results = qs('[bind="id-fetch-results"]');

		results.replaceChildren();

		if (!r.length) {
			FLASH.push({
				"type":    'info',
				"message": "No results. Try something else.",
			});

			return;
		}

		const ul = ce('ul', null, { "style": "list-style-type: none;" });

		function input_insert(i,d) {
			if (target_input) target_input.value = i;
			if (target_label) target_label.innerHTML = d;

			FLASH.push({ "type": 'success', "message": "ID inserted to input field" });

			exec(callback);

			target_input.dispatchEvent(new Event('change'));
		}
		for (const x of r) {
			const i = o.input(x);
			const d = o.descriptor(x);

			const icon = (target_input) ? "save" : "link";
			const label = ce('a', bi_icon(icon));

			const input = ce('input', null, {
				"id":       `input-${i}`,
				"style":    "min-width: unset; width: 1px; opacity: 0;",
				"pattern":  UUID_REGEXP,
				"value":    i,
				"readonly": "",
			});

			const target = target_input ?
				ce('span', d) :
				ce('a', d, { "href": config.base + `/?model=${o.table}&id=${i}&edit_model=${i}` });

			const li = ce('li');

			label.onclick = target_input ? _ => input_insert(i,d) : _ => focus_copy(input);

			li.appendChild(label);
			li.appendChild(input);
			li.appendChild(target);

			ul.appendChild(li);
		}
		results.appendChild(ul);
	}
	API.get(o.table, o.query).then(do_it);
}
function reverse_id_lookup() {
	const config = dt.config;
	const API = dt.API;
	const FLASH = dt.FLASH;

	const f = ce('form');
	const q = ce('input', null, {
		"name":        'query',
		"type":        'text',
		"pattern":     UUID_REGEXP,
		"placeholder": "uuid",
		"style":       "font-size: xx-large;",
	});

	f.append(q);

	const d = ce('div', `<br><div id="model-fetch-results"></div>`);
	d.prepend(f);

	new modal({
		"header":  "ID reverse lookup",
		"content": d,
		"destroy": true,
	}).show();

	q.focus();

	const h = function(tablename, value) {
		return API.get(tablename, { "select": 'id', "id": `eq.${value}` })
			.then(r => {
				if (r.length === 1) {
					const x = r[0];
					window.location = config.base + `/?model=${tablename}&id=${x.id}&edit_model=${x.id}`;
				}
			});
	};

	f.onsubmit = function(e) {
		e.preventDefault();

		if (!q.value.match(UUID_REGEXP)) return;

		const keys = Object.keys(dt.config.fetchables);
		Promise.all(keys.map(k => h(k, q.value)))
			.then(_ => FLASH.push({ "message": `Done searching in ${keys.join(', ')}...` }));
	};
}
function model_search_modal(_type, target_input, target_label) {
	const f = model_search(_type || dt.model, target_input, target_label, _ => m.remove());

	const m = new modal({
		"header":  "Search model",
		"content": f,
		"destroy": true,
	});

	m.show();

	qs('[name="query"]', f).focus();
}
function model_search(_type, target_input, target_label, callback) {
	const config = dt.config;

	const f = ce('form');
	const t = ce('select', null, { "class": 'type' });
	const q = ce('input', null, {
		"name":         'query',
		"type":         'text',
		"autofocus":    "",
		"autocomplete": 'off',
		"style":        "font-size: xx-large; box-sizing: content-box;",
	});

	f.append(t, ce('br'), ce('br'), q);

	const d = ce('div', `<br><div bind="id-fetch-results"></div>`);
	d.prepend(f);

	for (const k in config.fetchables)
		t.appendChild(ce('option', config.fetchables[k]['option'] || k, { "value": k }));

	let x = null;

	t.onchange = function() {
		const v = t.value;
		x = config.fetchables[v];

		if (x) {
			q.placeholder = x['placeholder'];
			q.disabled = false;
		}
		else q.disabled = true;

		qs('[bind="id-fetch-results"]', d).replaceChildren();
	};

	f.onsubmit = async function(e) {
		e.preventDefault();

		const o = await x['options'](q.value);
		if (q.value.length < o.threshold) return;

		string_fetch_handler(o, target_input, target_label, callback);
	};

	if (_type) t.value = _type;

	t.onchange();
	q.focus();

	return d;
}
function fkey_search(f) {
	for (const x of qsa('[bind-fkey]', f)) {
		x.onclick = function(e) {
			e.preventDefault();

			const t = e.target;
			const ig = t.closest('.input-group');

			model_search_modal(
				x.getAttribute('bind-fkey'),
				qs('input', ig),
				qs('.descriptor', ig),
			);
		};

		x.prepend(bi_icon('intersect'));
	}
}
function bi_icon(v) {
	return ce('i', null, { "class": "bi-" + v });
}
window.dt_external_link = external_link;

function upload() {
	const config = dt.config;
	const API = dt.API;
	const FLASH = dt.FLASH;

	const s3 = config.upload === "s3";
	const maas = and$1(!s3, !!config.upload);

	const storage_modal = new modal({ "id": 'storage-modal' });

	let mimetypes;

	const form = ce('form', [
		ce('input', null, { "autofocus": '', "required": '', "name": "file", "type": "file" }),
		ce('br'),
		ce('br'),
		ce('input', null, { "type": "text", "list": "mimelist", "name": "mimetype", "placeholder": "file type", "required": '' }),
		ce('br'),
		ce('br'),
		ce('button', "Upload", { "type": "submit" }),
	]);

	function setup(el) {
		for (const t of qsa('[bind="storage"]', el)) {
			const g = t.closest('.input-group');
			const l = qs('label', g);

			const u = t.value;
			if (u) {
				const ea = ce('a', bi_icon('box-arrow-in-up-right'));
				ea.href = (config.storage_prefix || "") + u;
				ea.target = "_blank";

				l.prepend(ea);
			}

			if (t.readonly || t.disabled) ;
			else {
				const a = ce('a', bi_icon('cloud-upload'), { "bind-upload": "" });
				a.onclick = _ => run(g);

				l.prepend(a);
			}
		}
	}
	function mimesetup(f) {
		const mimedatalist = ce('datalist', null, { "id": 'mimelist' });

		if (mimetypes === undefined) {
			mimetypes = {};

			fetch('./src/mime-types.tsv')
				.then(response => response.text())
				.then(text => {
					const rows = text.split('\n');

					for (const t of rows) {
						const r = t.split('\t');

						mimetypes[r[0]] = {
							'mime':        r[2],
							'description': r[1],
						};

						mimedatalist.append(ce('option', r[0], { "value": r[2] }));
					}

					document.body.append(mimedatalist);
				});
		}

		const mimeinput = qs('input[name=mimetype]', f);

		const input = qs('input[type=file]', f);
		input.addEventListener('change', function() {
			let m;
			if (m = input.files[0]['name'].match(/(.*)(\..*)/))
				mimeinput.value = mimetypes[m[2]]['mime'];
		});

		return mimeinput;
	}
	async function register(u, id) {
		if (!u) return null;

		const url = new URL(u);
		url.search = "";

		const t = 2;

		FLASH.push({
			"type":    'info',
			"message": "Verifying file upload...",
		});

		await delay(t);

		const head = await fetch(url, { "method": "HEAD" })
			.catch(_ => ({ "ok": false }));

		if (!head.ok) {
			console.warn("File was uploaded but check failed");
			return Whatever.then(_ => url);
		}

		const path     = url.pathname;
		const mimetype = head.headers.get('content-type');
		const checksum = head.headers.get('etag').replace(/"([0-9a-f]+)(-[0-9]+)?"/, '$1') || null;
		const size     = head.headers.get('content-length') || 0;

		if (config.storage_track_files) {
			FLASH.clear();
			FLASH.push({
				"type":    'info',
				"message": "Registering file...",
			});

			return API.post('files', null, {
				"payload": { id, mimetype, checksum, size },
				"one":     true,
			}).then(r => {
				const t = {
					"type":    'error',
					"message": "Failed to register file",
				};

				if (r.id) {
					t['type'] = 'success';
					t['timeout'] = 3000;
					t['message'] = "File registered";
				}

				FLASH.clear();
				FLASH.push(t);

				return path;
			});
		}

		else return Whatever.then(_ => path);
	}
	function s3signedurl(file) {
		const signer = new pgrest(config.auth_server, FLASH);

		return signer.post('s3-signed-url', null, {
			"payload": {
				"method":       "PUT",
				"world":        config.auth_world,
				"path":         file.id,
				"content-type": file.mimetype,
			},
			"expect": "text",
		});
	}
	function upload(url, file, progress = null) {
		if (!url) return Promise.reject(new Error("Missing upload URL"));

		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			function fail(msg) {
				FLASH.push({
					"type":    'error',
					"title":   "File upload failed",
					"message": msg,
				});

				return reject(new Error(msg));
			}
			reader.addEventListener('load', e => {
				const xhr = new XMLHttpRequest();

				xhr.upload.addEventListener("progress", v => {
					if (!progress) return;

					if (v.lengthComputable)
						progress.value = v.loaded / v.total;
				});

				xhr.addEventListener("error", _ => fail("Network error"));
				xhr.addEventListener("abort", _ => fail("Aborted"));
				xhr.addEventListener("loadend", _ => {
					if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status <= 202) {
						let x = url;
						if (xhr.getResponseHeader('content-type') === 'application/json')
							x = JSON.parse(xhr.response)['path'];

						resolve(x);
					}
				});

				if (s3) {
					xhr.open('PUT', url, true);
					xhr.setRequestHeader("content-type", file.mimetype);
					xhr.setRequestHeader("x-amz-acl", file.acl);
					xhr.send(e.target.result);
				}

				if (maas) {
					const fd = new FormData();
					fd.append("filename", file.id);
					fd.append("file", file.raw);

					xhr.open('POST', url, true);
					xhr.setRequestHeader("authorization", `Bearer ${localStorage.token}`);
					xhr.send(fd);
				}
			});

			reader.addEventListener('error', _ => fail("Reading file failed"));

			reader.readAsArrayBuffer(file.raw);
		});
	}
	function populate_ui(url, file, form, input_group) {
		if (!url) return null;

		let m;

		if (input_group) {
			const t = qs('input', input_group);
			t.value = (config.storage_use_prefix ? config.bucket : "") + file.id;

			t.focus();

			m = "ID inserted to input field";
		} else {
			form.append(ce('div', `
<hr>
Saved as: <br><br>
<input bind="response" type="text" pattern="${UUID_REGEXP}">`));

			const i = qs('[bind=response]', form);
			i.value = (config.storage_use_prefix ? config.bucket : "") + file.id;

			qs('[type=submit]', form).setAttribute('disabled', true);
			qs('input[type=file]', form).setAttribute('disabled', true);

			i.focus();
			focus_copy(i);

			m = "File uploaded";
		}

		FLASH.push({
			"type":    'success',
			"timeout": 2000,
			"message": m,
		});

		return url;
	}
	function run(input_group) {
		const f = form.cloneNode(true);

		const mimeinput = mimesetup(f);

		f.addEventListener('submit', function(e) {
			e.preventDefault();

			const input = qs('input[type=file]', f);

			console.info("ACL is temporarily hard-coded to 'public-read'");
			const acl = "public-read";

			const file = {
				"id":       uuid(),
				"raw":      input.files[0],
				"mimetype": mimeinput.value,
				"acl":      acl,
			};

			const p = qs('progress', f) || ce('progress');
			p.value = 0;
			f.append(p);

			let fn = Whatever;

			if (s3) {
				fn = Whatever
					.then(_ => s3signedurl(file))
					.then(u => upload(u, file, p));
			}

			if (maas) {
				fn = Whatever
					.then(_ => upload(config.upload, file, p));
			}

			fn.then(u => register(u, file.id))
				.then(u => populate_ui(u, file, f, input_group));
		});

		storage_modal.set({ "content": f, "header": 'Storage upload' }).show();
	}
	return {
		setup,
		run,
	};
}

function dummy(scm) {
	const o = {};

	for (const k in scm) {
		const v = scm[k];
		const t = v.type;

		if (t === 'object')
			o[k] = v['nullable'] ? null : dummy(v.schema);
		else if (t === 'array')
			o[k] = [];
		else if (typeof v['default'] === 'function')
			o[k] = v['default'](scm);
		else if (t === 'number')
			o[k] = maybe$1(v, 'nullable') ? null : 0;
		else
			o[k] = v['default'] || null;
	}

	return o;
}
function validate_i(scm, data, key) {
	if (or$1(typeof data === scm.type,
	       and$1(scm.type === 'array', Array.isArray(data)),
	       and$1(data === null, scm.nullable),
	       and$1(data === undefined, scm.droppable),
	       (['string', 'date', 'email', 'text', 'uuid', 'select', 'colour', 'regexp', 'hidden'].includes(scm.type)
	        && (data === null || typeof data === 'string'))))
		return true;

	console.error(`dt.schema.validate_i: attribute '${key}' (${scm.type}) failed. (data)`, data);
	return false;
}
function validate(scm, data) {
	let e = false;

	if (!scm) return true;

	if (null === data) return false;

	for (const k in scm) {
		const v = scm[k];

		if (['object', 'json', 'array'].includes(v.type)) {
			if (!v.nullable && (data[k] === null)) {
				console.warn(`${k} in is null AND NOT nullable in`, v, data);
				return false;
			}

			else if (v.nullable && (data[k] === null)) continue;
		}

		if (data[k] === undefined && !scm[k].droppable) {
			console.warn(`Data (non-droppable) does not contain '${k}'.`, "\ndata:", data, "schema:", scm);
			continue;
		}

		switch (v.type) {
		case 'object':
		case 'json': {
			e = validate(v.schema, data[k]);
			e = true;
			break;
		}

		case 'array': {
			if (v.count && (v.count !== data[k].length)) {
				console.warn(`${k} length is ${data[k].length} but schema requires ${v.count}`, v, data);
				e = false;
			} else if (Array.isArray(data[k]) && data[k].length === 0) {
				e = true;
			} else if (data[k]) {
				for (let i = 0; i < data[k].length; i++) {
					e = (v.schema.type === 'object') ?
						validate(v.schema.schema, data[k][i]) :
						validate_i(v.schema, data[k][i], k);
				}
			}

			if (scm[k].unique)
				e = [...new Set(data[k])].length === data[k].length;

			break;
		}

		default: {
			e = validate_i(v, data[k], k);
			break;
		}
		}

		if (!e) {
			console.error(`dt.schema.validate: failed on attribute '${k}'. (data, schema)`, data, scm);
			return false;
		}
	}

	return true;
}
function object_diff(scm, model, parsed) {
	let e = false;
	const diff = {};

	Object.defineProperty(diff, "__changes", {
		"enumerable": false,
		"writable":   true,
	});

	if (!scm) {
		if (JSON.stringify(model) !== JSON.stringify(parsed))
			return ["json (stringified) objects differ"];
	}

	if (empty(model) && empty(parsed)) return diff;

	if (empty(model) !== empty(parsed)) {
		if (empty(model)) diff['_'] = "new is not empty (old was)";
		else if (empty(parsed)) diff['_'] = "new is empty (old was not)";

		return diff;
	}
	for (const k in (scm || {})) {
		const v = scm[k];
		const mk = model[k];
		const pk = parsed[k];

		if (k === 'schema' || k === 'type') console.error("FOUND YOU!", k);

		if ((!mk && pk) || (mk && !pk))
			e = false;
		else {
			switch (v.type) {
			case 'object':
			case 'json': {
				e = empty(object_diff(v.schema, mk, pk));
				break;
			}

			case 'array': {
				if (empty(mk) && empty(pk)) {
					e = true;
					continue;
				}

				if (mk.length !== pk.length) e = false;
				else {
					for (let i = 0; i < mk.length; i++) {
						e = (v.schema.type === 'object') ?
							empty(object_diff(v.schema.schema, mk[i], pk[i])) :
							(mk[i] === pk[i]);

						if (!e) break;
					}
				}
				break;
			}

			default: {
				e = (mk === pk);
				break;
			}
			}
		}

		if (!e) diff[k] = [mk, pk];
	}

	diff.__changes = Object.keys(diff);

	return diff;
}

const object$1 = class object {
	constructor({ module, collection, data }) {
		this.module = module;
		this.model = module.model;
		this.schema = this.model.schema;

		this.data = data;
		this.collection = collection;
		this.associations = Object.keys(this.schema).filter(k => this.schema[k]['fkey']);
		this.row = null;
	};

	pk() {
		const t = this.model.pkey || 'id';

		if (Array.isArray(t) && t.length)
			return t.map(x => this.data[x]);

		else
			return this.data[t];
	}

	endpoint(method) {
		const params = {};

		const pk = this.model.pkey || 'id';
		const k = this.pk();

		if (Array.isArray(k) && k.length)
			k.forEach((x,i) => params[this.model.pkey[i]] = "eq." + x);
		else
			params[pk] = "eq." + k;

		const select = [];

		switch (method) {
		case 'PATCH':
		case 'GET': {
			select.push(Object.keys(this.model.schema));

			if (this.model.columns)
				for (const c of this.model.columns) select.push(c);

			for (const a of this.associations) {
				const s = this.schema[a];
				const k = s['fkey'];
				const c = s['columns'].join(',');
				const t = s['constraint'];

				if (!t) {
					console.warn(`Constraint to table '${k}' is not named. Skipping`);
					continue;
				}
				select.push(`${t}(${c})`);
			}

			params['select'] = select;
			break;
		}

		case 'POST': {
			delete params[pk];
			break;
		}

		case 'DELETE': {
			delete params['select'];
			break;
		}

		default: {
			throw new Error(`dt.object endpoint: ${method} is not a valid method`);
		}
		}

		return params;
	};

	main() {
		let r;
		const m = this.model.main;

		switch (typeof m) {
		case 'string': {
			r = this.data[m];
			break;
		}

		case 'function': {
			r = m(this.data);
			break;
		}

		default: {
			r = Array.isArray(this.model.id) ?
				this.model.id.map(x => this.data[x]).join(';') :
				this.data.id;

			break;
		}
		}

		return r;
	};

	fetch() {
		return (this.module.api ?? dt.API)
			.get(this.module.base, this.endpoint('GET'), { "one": true })
			.then(r => this.load(r));
	};

	load(data) {
		if (!data) return null;

		Object.assign(this.data, data);
		exec(this.model.parse, this.data, this.model);

		return this.data;
	};

	async create() {
		const FLASH = dt.FLASH;

		let go = true;

		if (typeof this.model.check === 'function')
			go = await this.model.check(this.data);

		if (!go) return Promise.reject(new Error('Object not created...'));

		return (this.module.api ?? dt.API)
			.post(this.module.base, this.endpoint('POST'), { "payload": this.data, "one": true })
			.then(r => {
				if (!r) return null;

				this.load(r);

				FLASH
					.clear()
					.push({
						"type":    'success',
						"title":   "Created",
						"message": this.model.main ? r[this.model.main] : null,
					});

				if (this.collection) this.collection.add(this);

				return r;
			});
	};

	async clone(props = {}) {
		const data = {};

		for (const k of this.model['clonable_attrs'])
			data[k] = this.data[k];

		for (const k in props)
			data[k] = props[k];

		const o = new object({
			"module":     this.module,
			"collection": this.collection,
			data,
		});

		await o.create();

		return o;
	};

	async patch(d) {
		const FLASH = dt.FLASH;

		if (!d)
			throw new Error("dt.object.patch: expected a serialized form");

		for (const c of Object.keys(this.model.schema)) {
			const fn = maybe$1(this.model.schema, c, 'validate');

			if (typeof fn === 'function' && !(await fn(d, this.data))) {
				FLASH.push({
					"type":  'error',
					"title": `Validation failed for ${c}`,
				});

				throw new Error(`Validation failed: '${c}'`);
			}
		}

		const diff = object_diff(this.model.schema, this.data, d);

		if (empty(diff)) return Whatever;

		const p = Object.keys(d)
			.filter(i => diff.__changes.indexOf(i) > -1)
			.reduce(function(a,c) { a[c] = d[c]; return a; }, {});

		return (this.module.api ?? dt.API)
			.patch(this.module.base, this.endpoint('PATCH'), { "payload": p, "one": true })
			.then(r => {
				if (!r) return null;

				const server_changes = [];

				for (const k in r) {
					const d = typeof this.data[k];

					switch (d) {
					case 'object': {
						if (JSON.stringify(this.data[k]) !== JSON.stringify(r[k]))
							server_changes.push(k);
						break;
					}

					default: {
						if (this.data[k] !== r[k])
							server_changes.push(k);
						break;
					}
					}
				}

				this.load(r);

				if (this.collection) this.collection.refresh();

				FLASH
					.clear()
					.push({
						"type":    'success',
						"title":   "Patched",
						"message": diff.__changes.join(", "),
					});

				return server_changes;
			})
			.then(sc => {
				if (typeof this.model.after_patch === 'function')
					this.model.after_patch(this, diff);

				return sc;
			});
	};

	destroy() {
		const FLASH = dt.FLASH;

		return (this.module.api ?? dt.API)
			.delete(this.module.base, this.endpoint('DELETE'), { "one": true })
			.then(r => {
				if (!r) return null;

				if (this.collection) this.collection.drop(this);

				FLASH
					.clear()
					.push({
						"type":    'success',
						"title":   "Deleted",
						"message": this.model.main ? r[this.model.main] : null,
					});

				return r;
			});
	};
};

class collection {
	constructor(module) {
		const c = module.collection;

		const u = c.endpoint;
		if (typeof u === 'function') this.endpoint = u();
		else if (typeof u === 'string') this.endpoint = u;
		else if (typeof u === 'object') this.endpoint = u;

		this.module = module;
		this.sort_by = c.sort_by;
		this.sort_fn = c.sort_fn;
		this.order = c.order;
		this.parse = c.parse;

		this.table = null;
		this.objects = [];
	};

	fetch() {
		if (!this.endpoint) ;

		return (this.module.api ?? dt.API)
			.get(this.module.base, this.endpoint)
			.then(j => {
				if (!j) return;

				if (!Array.isArray(j))
					throw new Error('JSON fetched but it is not an Array.');

				this.populate(j);
			});
	};

	populate(array) {
		for (let i of array) {
			i = coalesce(exec(this.parse, i), i);

			const o = new object$1({
				"module":     this.module,
				"data":       i,
				"collection": this,
			});

			this.objects.push(o);
		}

		if (this.sort_by) this.sort();
	};

	add(m) {
		this.objects.push(m);
		this.sort();

		this.refresh();
	};

	drop(m) {
		for (let i = 0; i < this.objects.length; i++)
			if (m === this.objects[i]) { this.objects.splice(i, 1); break; }

		this.refresh();
	};

	sort(c = this.sort_by, order = this.order) {
		if (undefined === order) order = 1;

		let f;
		if (typeof c === 'function')
			f = (a,b) => c(a.data, b.data);
		else if (typeof c === 'string')
			f = (a,b) => {
				if (b.data[c] === undefined)
					return -order;

				if (a.data[c] < b.data[c])
					return -order;

				if (a.data[c] > b.data[c])
					return order;

				return 0;
			};
		else if (typeof this.sort_fn === 'function')
			f = (a,b) => this.sort_fn(a.data, b.data);

		if (f) this.objects.sort(f);

		return this.objects;
	};

	refresh() {
		if (this.table) this.table.render();
	};
}

const style = `
position: absolute;
display: flex;
`;

const caretstyle = `
display: block;
position: absolute;
left: 0;
top: 0;
border-style: solid;
border-color: transparent;
border-radius: 2px;
pointer-events: none;
`;

class bubblemessage extends HTMLElement {
	constructor(opts, el = document.body) {
		if (!(el instanceof Node)) throw new DOMError("bubblemessage", `'${el}' is not an Node`);

		super();

		this.el = el;
		this.opts = opts;

		this.render();

		return this;
	}

	align() {
		const { position, align } = this.opts;
		const elbox = this.el.getBoundingClientRect();

		let x = elbox.x;
		let y = elbox.y;

		const halign = _ => {
			switch (align) {
			case "start":
				x += 0;
				break;

			case "end":
				x += elbox.width - this.clientWidth;
				break;

			case "middle":
			default:
				x += (elbox.width / 2) - (this.clientWidth / 2);
				break;
			}
		};

		const valign = _ => {
			switch (align) {
			case "start":
				y -= this.clientHeight / 2;
				break;

			case "end":
				y += elbox.height - (this.clientHeight / 2);
				break;

			case "middle":
			default:
				y = elbox.y + (elbox.height / 2) - (this.clientHeight / 2);
				break;
			}
		};

		const bc = "rgba(0,0,0,1)";
		let cs, f;

		switch (position) {
		case "N":
		case "north": {
			halign();
			cs = (this.clientWidth / 2);
			f = 1/4;

			this.caret.style['border-width'] = cs + "px";
			this.caret.style['border-top-color'] = bc;
			this.caret.style['transform'] = `scale(1, ${f})`;
			this.caret.style['top'] = this.clientHeight - ((this.clientWidth * (3/8)) + 0.5) + "px";

			y -= this.clientHeight + (cs * f);

			break;
		}

		case "E":
		case "east": {
			valign();
			cs = (this.clientHeight / 2);
			f = 1/2;

			this.caret.style['border-width'] = cs + "px";
			this.caret.style['border-right-color'] = bc;
			this.caret.style['transform'] = `scale(${f}, 1)`;
			this.caret.style['left'] = -((this.clientHeight * (3/4)) - 1.5) + "px";

			x += elbox.width + (cs * f);

			break;
		}

		case "S":
		case "south": {
			halign();
			cs = (this.clientWidth / 2);
			f = 1/4;

			this.caret.style['border-width'] = cs + "px";
			this.caret.style['border-bottom-color'] = bc;
			this.caret.style['transform'] = `scale(1, ${f})`;
			this.caret.style['top'] = (-1) * ((this.clientWidth * (5/8)) - 0.5) + "px";

			y += elbox.height + (cs * f);

			break;
		}

		case "W":
		case "west": {
			valign();
			cs = (this.clientHeight / 2);
			f = 1/2;

			this.caret.style['border-width'] = cs + "px";
			this.caret.style['border-left-color'] = bc;
			this.caret.style['transform'] = `scale(${f}, 1)`;
			this.caret.style['left'] = this.clientWidth - ((this.clientHeight * (1/4)) + 1.5) + "px";

			x -= this.clientWidth + (cs * f);

			if (this.close_button)
				this.prepend(this.close_button);

			break;
		}

		case "C":
		case "center": {
			this.caret.style['display'] = 'none';

			valign();
			halign();

			break;
		}
		}

		this.style.left = (x < 0 ? 0 : x) + window.scrollX + "px";
		this.style.top = (y < 0 ? 0 : y) + window.scrollY + "px";
	}

	render() {
		const { hidden, title, message, close, close_callback, max_width, noevents } = this.opts;

		this.style = style;

		if (typeof max_width === 'number')
			this.style['max-width'] = max_width + "px";

		if (noevents)
			this.style['pointer-events'] = "none";

		this.caret = document.createElement('span');
		this.caret.style = caretstyle;

		this.main = document.createElement('main');

		if (title) {
			const header = document.createElement('header');

			if (title instanceof Element)
				header.append(title);
			else
				header.innerHTML = title;

			this.main.append(header);
		}

		if (message) {
			const content = document.createElement('content');

			if (message instanceof Element)
				content.append(message);
			else
				content.innerHTML = message;

			this.main.append(content);
		}

		this.append(this.caret, this.main);

		if (close !== false) {
			this.close_button = document.createElement('div');
			this.close_button.className = 'bubble-message-close-button';

			this.close_button.style = `cursor: pointer;`;

			this.close_button.onclick = _ => {
				if (this) this.remove();
				if (typeof close_callback === 'function') close_callback();
			};

			this.append(this.close_button);
		}

		if (hidden) this.style['display'] = "none";

		document.body.append(this);

		this.align();
	}
}
customElements.define('bubble-message', bubblemessage);

/*
 * more utils
 */

function blank(s) {
	if (typeof s !== 'string') throw new Error(`blank: expected string, got '${s}'`);
	return (!s || s.trim() === "");
}
function to_string(t) {
	if (typeof t === 'string') return t;
	else if (t === undefined || t === null) return "";
	else return toString(t);
}
function str_or_null(s) {
	if (typeof s !== 'string') throw new Error(`str_or_null: expected string, got '${s}'`);
	return blank(s) ? null : s;
}
function hint(text, parent, add) {
	const el = ce('span', bi_icon('info-circle'), { "class": "hint", "data": text });

	let p;

	el.onmouseenter = function() {
		p = new bubblemessage({
			"message":  this.getAttribute('data'),
			"position": "E",
			"close":    false,
		}, this);
	};

	el.onmouseleave = function() {
		p.remove();
	};

	if (add === 'append')
		parent.append(el);
	else
		parent.prepend(el);
}
let __data = null;
let __schema = null;
let __modal = null;

/*
 * fieldsets
 */

function create({schema, data, main, is_new}) {
	__data = data;
	__schema = schema;

	if (is_new = (data === null)) {
		const new_schema = {};

		for (const k in schema) {
			const v = schema[k];
			if (v.required) new_schema[k] = v;
		}

		data = dummy((schema = new_schema));
	}

	if (!validate(schema, data)) {
		dt.FLASH.push({
			"type":    'error',
			"title":   "Mismatching data/schema",
			"message": "BUG. Check the logs and submit a bug report.",
		});

		throw new Error("Invalid schema! This is a bug.");
	}

	const form = ce('form');
	form.setAttribute('id', "form-" + uuid());

	form.append(object({
		"scm":         schema,
		"data":        data,
		"name":        (is_new ? null : main),
		"is_new":      is_new,
		"is_nullable": false,
		"open":        true,
		"callback":    schema.callback,
		"is_root":     true,
	}));

	return form;
}
function object({pscm, scm, name, is_new, is_nullable, appendable, open, is_root, data, callback}) {
	data = is_new ? dummy(scm) : data;

	let details, legend;

	if (is_root) {
		details = ce('fieldset', null, { "name": name, "type": "object" });
		legend = ce('legend');

		if (!is_new && data.id) {
			const a = ce('a', bi_icon('link'), { "href": "#", "bind-icon": "link" });
			const input = ce('input', null, { "value": data.id });
			input.style = `width: 1px; height: 0; padding: 0; border: 0;`;

			legend.append(a);
			legend.append(input);

			a.onclick = _ => focus_copy(input);
		}
	}
	else {
		details = ce('details', null, { "name": name, "type": "object" });
		if (open) details.setAttribute('open', "");
		legend = ce('summary');
	}

	legend.append(label(scm, name, false, (pscm && pscm.main) ? data[pscm.main] : undefined));

	if (pscm && pscm.hint) hint(pscm.hint, legend, 'append');

	if (is_nullable) details.setAttribute('nullable', '');

	const empty_btn = action_btn('empty');
	const plus_btn = action_btn('plus');
	const append_btn = action_btn('plus');

	function add_item(d,clicked) {
		details.replaceChildren(legend);

		plus_btn.style.display = 'none';
		empty_btn.style.display = '';

		for (const k in scm)
			details.append(descend$1(scm[k], d, k, is_new));

		if (clicked)
			details.setAttribute('open', "");
	}
	function remove_item() {
		details.replaceChildren(legend);

		plus_btn.style.display = '';
		empty_btn.style.display = 'none';

		details.removeAttribute('open');
	}
	function add_key(s) {
		const select = ce('select');

		select.append(ce('option', "", { "disabled": '', "selected": '' }));

		select.onchange = function() {
			const k = this.value;
			details.append(descend$1(scm[k], dummy(scm[k]), k, true));
			__modal.hide();
		};

		for (const k in s) {
			if (qs(`[name=${k}]`, details)) continue;
			select.append(ce('option', k));
		}

		__modal = new modal({
			"header":  "Select a key",
			"content": select,
			"destroy": true,
		});

		__modal.show();
	}
	if (appendable) {
		legend.append(append_btn);
		append_btn.onclick = _ => add_key(scm);
	}

	if (is_nullable) {
		legend.append(empty_btn);
		empty_btn.onclick = _ => remove_item();

		legend.append(plus_btn);
		plus_btn.onclick = _ => add_item(dummy(scm), true);
	}

	if (data)
		add_item(data);
	else
		empty_btn.style.display = 'none';

	details.append(legend);

	if (typeof callback === 'function')
		callback.call(__data, details);

	return details;
}
function array({scm, a_scm, name, is_new, open, data}) {
	data = data || [];

	const _schema = a_scm.schema;

	const l = Object.keys(data).length;
	const is_obj = (_schema.type === 'object');
	const count = _schema.count;

	if ((count && count > 0) && (l > count)) {
		dt.FLASH.push({
			"type":    'info',
			"timeout": 0,
			"title":   `Mismatching '${name}' array length`,
			"message": `
Schema says count should be ${count}, but DATA length is ${l}.

This is only FYI. Schema validation will allow this.`,
		});
	}

	const details = ce('details', null, { "name": name, "type": "array" });

	if (a_scm.sortable) details.setAttribute('sortable', "");

	if (open) details.setAttribute('open', "");

	const legend = ce('summary');
	legend.append(label(_schema, name, false));

	if (scm.hint) hint(scm.hint, legend, 'append');

	function push_item(d,i,interactive) {
		if (interactive) details.setAttribute('open', "");

		let item;
		const minus_btn = action_btn('minus');

		if (is_obj) {
			if (d === null) d = dummy(_schema.schema);

			item = object({
				"pscm":        _schema,
				"scm":         _schema.schema,
				"data":        d,
				"name":        i,
				"is_new":      false,
				"is_nullable": _schema.nullable,
				"appendable":  _schema.appendable,
				"open":        (interactive || _schema.nullable || (_schema.schema.collapse === false)),
				"callback":    _schema.callback,
				"is_root":     false,
			});

			qs('summary', item).append(minus_btn);
		}
		else {
			item = descend$1(_schema, data, i, interactive);
			item.append(minus_btn);
		}

		function pop_item() {
			if (!item) return;

			item.remove();
			minus_btn.remove();
		}
		minus_btn.onclick = _ => pop_item();

		details.append(item);

		qs('input,select', item).focus();
	}
	// TODO: get the current count of items or use 0;
	//
	const plus_btn = action_btn('plus');
	plus_btn.onclick = _ => push_item(null, null, true);
	legend.append(plus_btn);

	if (a_scm.editable === false && !is_new) {
		plus_btn.setAttribute('disabled', "");
	}

	if (a_scm.nullable) details.setAttribute('nullable', '');

	if (!empty(data)) for (let i = 0; i < data.length; i++) push_item(data[i], i, false);

	details.prepend(legend);

	if (typeof scm.callback === 'function')
		scm.callback.call(__data, details);

	return details;
}
function descend$1(scm, data, key, is_new) {
	let div;
	const st = scm.type;

	if (data === null) return;

	switch (st) {
	case 'object': {
		div = object({
			"pscm":        scm,
			"scm":         scm.schema,
			"data":        data[key],
			"name":        key,
			"is_new":      is_new,
			"is_nullable": scm.nullable,
			"appendable":  scm.appendable,
			"callback":    scm.callback,
			"open":        (scm.collapsed === false),
			"is_root":     false,
		});
		break;
	}

	case 'array': {
		div = array({
			"scm":    scm,
			"a_scm":  scm,
			"data":   data[key],
			"name":   key,
			"is_new": is_new,
			"open":   (scm.collapsed === false),
		});
		break;
	}

	case 'text':
	case 'json': {
		div = textarea(scm, {data, key, is_new, "format": st});
		break;
	}

	case 'select': {
		div = select(scm, {data, key, is_new});
		break;
	}

	default: {
		div = inputgroup(scm, data, key, is_new);
		break;
	}
	}
	return div;
}
function inputgroup(scm, data, key, is_new) {
	const value = (is_new || undefined === data[key]) ? null : data[key];

	if (scm.droppable
	    && null === value
	    && !is_new) {
		return "";
	}

	const div = ce('div', null, { "class": "input-group" });
	const l = label(scm, key, true);
	const e = input(scm, {key, value, is_new});

	let show = "";
	if (scm.show && !is_new) {
		e.setAttribute('type', 'hidden');
		const s = coalesce(exec(scm.show, data), scm.show);
		show = ce('span', s, { "class": "descriptor" });
	}

	div.append(l, e, show);

	if (scm.options) {
		const keyuuid = uuid();
		e.setAttribute('list', keyuuid);

		const datalist = ce('datalist', null, { "id": keyuuid });
		for (const o of scm.options) datalist.append(ce('option', null, { "value": o }));

		div.append(datalist);
	}

	fkey_search(div);

	field_basics.call(e, scm, data, key, is_new);

	if (scm.droppable) {
		const drop_btn = action_btn('minus');
		drop_btn.onclick = _ => div.remove();

		div.append(drop_btn);
	}

	return div;
}
/*
 * inputs
 */

function input(scm, {key, value, is_new, fn}) {
	const st = scm.type;

	let t = st;
	if (['string', 'email', 'uuid', 'regex', 'hidden'].includes(st)) t = 'text';
	else if (st === 'boolean') t = 'checkbox';
	else if (st === 'colour') t = 'color';

	const o = {
		"name":         key,
		"type":         t,
		"bind":         scm.bind,
		"pattern":      scm.pattern,
		"placeholder":  scm.placeholder,
		"required":     scm.required === true ? '' : undefined,
		"disabled":     scm.editable === false && !is_new ? '' : undefined,
		"autocomplete": scm.autocomplete === true ? "on" : "off",
	};

	const e = ce('input', null, o);

	switch (st) {
	case 'number': {
		if (scm.nullable && to_string(value)) e.value = "";
		else if (e.step == "any") parseFloat(e.value) || "0.00";  // TODO: check this
		else e.value = parseInt(e.value) || 0;

		if (typeof scm.min === 'number') e.setAttribute('min', scm.min);
		if (typeof scm.max === 'number') e.setAttribute('max', scm.max);

		if (scm.step) e.setAttribute('step', scm.step);
		e.value = value;
		break;
	}

	case 'boolean': {
		if (value) e.setAttribute('checked', '');
		break;
	}

	case 'uuid': {
		e.setAttribute('pattern', UUID_REGEXP);
		e.setAttribute('onfocus', "this.select();");
		e.value = value;
		break;
	}

	case 'email': {
		e.setAttribute('type', "email");
		e.value = value;
		break;
	}

	case 'hidden': {
		e.setAttribute('type', "hidden");
		e.value = value;
		break;
	}

	default: {
		e.value = value;
		break;
	}
	}

	e.oninput = function() {
		let p;

		switch (scm.type) {
		case 'uuid': {
			p = "UUID";
			break;
		}

		case 'regexp': {
			try {
				this.regexp = new RegExp(this.value, "i");
			} catch {
				this.reportValidity();
				this.setCustomValidity("Invalid RexExp.");
				return;
			}
			break;
		}

		default: {
			if (!this.pattern) {
				exec(fn, this);
				return;
			}

			p = this.pattern;
			break;
		}
		}

		if (this.validity.patternMismatch) {
			this.reportValidity();
			this.setCustomValidity(`The required pattern is: ${p}`);
		}

		else {
			this.setCustomValidity("");
			exec(fn, this);
		}
	};

	return e;
}
function textarea(scm, {data, key, is_new, format}) {
	const f = (format === 'json') ?
		(s => (s === null ? '' : JSON.stringify(s, null, 2))) :
		to_string;

	const value = f(data[key]);

	const div = ce('div', null, { "class": "input-group" });
	const l = label(scm, key, true);
	l.style = "display: block; margin: 1em; text-align: center;";

	const e = ce('textarea', (value || scm.default || ''), { "name": key, "type": format });

	div.append(l, e);

	field_basics.call(e, scm, data, key, is_new, 'append');

	return div;
}
function select(scm, {data, key, is_new}) {
	const div = ce('div', null, { "class": "input-group" });
	const l = label(scm, key, true);

	const e = ce('select', null, { "name": key, "type": scm.type });
	const x = ce('option', `select: ${key ?? ""}`, { "disabled": '', "value": '' });
	if (is_new) x.setAttribute('selected', '');
	e.append(x);

	for (const o of scm.options) {
		const eo = ce('option', o, { "value": o });
		if (o === to_string(data[key])) eo.setAttribute('selected', '');

		e.append(eo);
	}

	if (scm.placeholder) e.placeholder = scm.placeholder;

	if (scm.required) e.setAttribute('required', '');

	if (scm.hint) hint(scm.hint, div);

	mark_changed.call(e, data, key);

	div.append(l, e);

	return div;
}
/*
 * input utils
 */

function field_basics(scm, data, key, is_new, hint_append) {
	mark_changed.call(this, data, key);

	if (scm.hint) hint(scm.hint, this.parentNode, hint_append);

	if (typeof scm.disabled === 'function' && scm.disabled(__data))
		this.setAttribute('disabled', '');

	if (typeof scm.enabled === 'function' && !scm.enabled(__data)) {
		this.setAttribute('disabled', '');

		const bk = qs('[bind-fkey]', this.closest('.input-group'));
		if (bk) bk.remove();
	}

	if (scm.bind === 'storage')
		dt.upload.setup(this.closest('.input-group'));

	if (typeof scm.callback === 'function')
		scm.callback.call(__data, data, this);
}
function label(scm, key, links, data) {
	if (typeof scm.label === 'function') return scm.label(arguments);

	const l = ce('label');
	const s = ce('span');

	let h = key;
	if (typeof scm.label === 'string')
		h = scm.label;
	else if (blank(to_string(key)))
		h = "*";
	else if (typeof data === 'string')
		h = data;
	else if ((typeof data === 'object') && data && scm.main)
		h = data[scm.main];

	s.innerHTML = scm.type === 'hidden' ? "" : h;

	if (links) {
		if (scm.fkey) {
			const a = ce('a');
			a.setAttribute('bind-fkey', scm.fkey);

			l.append(a);

			if (data) {
				const b = ce('a');
				b.setAttribute('bind-goto', scm.fkey);
				b.href = dt.config.base + `/?model=${scm.fkey}&id=${data}&edit_model=${data}`;
				b.prepend(bi_icon('arrow-right-square'));

				l.append(b);
			}
		}
	}

	l.append(s);

	return l;
}
function action_btn(t) {
	let m,s;

	if (t === 'minus') {
		m = "Delete element";
		s = "−";
	}
	else if (t === 'empty') {
		m = "Nullify element";
		s = "∅";
	}
	else if (t === 'plus') {
		m = "Add blank/new child element";
		s = "+";
	}
	else
		throw new Error(`dt.form.action_btn: Misunderstood: ${m}'`);

	return ce('button', s, { "class": `minus-plus ${t}`, "type": "button", "title": m });
}
function mark_changed(data, key) {
	this.addEventListener('input', function() {
		if (data[key] !== this.value)
			this.classList.add('changed');
		else
			this.classList.remove('changed');
	});
}
/*
 * extraction
 */

function to_json(str, name) {
	try {
		return JSON.parse(str_or_null(str));
	} catch (e) {
		dt.FLASH.push({
			"type":    'error',
			"title":   "JSON.parse failed",
			"message": `Check and correct JSON syntax on '${name}'`,
		});

		throw e;
	}
}
function extract_value() {
	let v;
	const t = this.getAttribute('type');

	switch (t) {
	case 'number':
		v = str_or_null(this.value) ? +this.value : null;
		break;

	case 'checkbox':
		v = this.checked;
		break;

	case 'json':
		v = to_json(this.value, this.name);
		break;

	default: // text, date, color, regexp, hidden, select
		v = str_or_null(this.value);
		break;
	}

	return v;
}
function extract$1() {
	const type = this.getAttribute('type');
	const nullable = this.hasAttribute('nullable');
	const details = [...qsa(':scope > details', this)];
	const inputs = [...qsa(':scope > div.input-group > *[name]', this)];

	if ((details.length === 0) && (inputs.length === 0)) {
		if (nullable) return null;
		else if (type === 'array') return [];
		else if (type === 'object') return {};
		else return undefined;
	}

	let o;
	switch (type) {
	case 'array': {
		o = [];

		if (details.length) o = details.map(d => extract$1.call(d));
		else if (inputs.length) o = inputs.map(i => extract_value.call(i));
		break;
	}

	case 'object': {
		o = {};

		for (const d of details) o[d.getAttribute('name')] = extract$1.call(d);
		for (const i of inputs) o[i.getAttribute('name')] = extract_value.call(i);

		if (empty(o)) o = null;

		break;
	}
	}
	return o;
}
function update$1(form, data, changes) {
	for (const c of changes) {
		const f = qs(`[name="${c}"]`, form);

		if (!f) continue;

		if (f.value != data[c])
			f.dispatchEvent(new Event('input'));

		switch (f.getAttribute('type')) {
		case 'json': {
			f.value = JSON.stringify(data[c], null, 2);
			break;
		}

		case 'object': {
			f.replaceWith(object({
				"name":        c,
				"pscm":        __schema[c],
				"scm":         __schema[c].schema,
				"data":        data[c],
				"is_new":      false,
				"is_nullable": __schema[c].nullable,
				"callback":    __schema[c].callback,
				"open":        true}));
			break;
		}

		case 'array': {
			f.replaceWith(array({
				"name":   c,
				"a_scm":  __schema[c],
				"scm":    __schema[c].schema,
				"data":   data[c],
				"is_new": false,
				"open":   true,
			}));
			break;
		}

		default: {
			f.value = data[c];
			break;
		}
		}
	}
}
var form = {
	create,
	"update":    update$1,
	input,
	"extract": f => extract$1.call(qs(':scope > fieldset', f)),
};

function edit_resortable(form) {
	for (const g of qsa('details[sortable]', form)) {
		const n = g.getAttribute('name');
		sortable(qs(`[name="${n}"]`, form), { "forcePlaceholderSize": true });
	}
}
function update(form$1, changes, obj) {
	function getpath(el) {
		const path = [];

		let p = el;

		while (p.parentNode && p !== form$1) {
			path.push(p.getAttribute('name'));
			p = p.parentNode;
		}

		return path.reverse();
	}
	const opened_paths = [];

	for (const o of qsa('details[open]', form$1))
		opened_paths.push(getpath(o));

	if (maybe$1(changes, 'length')) {
		form.update(form$1, obj.data, changes);

		for (const y of changes)
			for (const x of qsa(`details[name="${y}"] input`, form$1))
				x.classList.add('changed');

		opened_paths.forEach(p => {
			const q = p.reduce((a,c) => a + ` > [name="${c}"]`, ":scope");
			const e = qs(q, form$1);

			if (e) e.setAttribute('open', '');
		});

		edit_resortable(form$1);
	}
}
function async_edit(form, go) {
	function submit() {
		form.dispatchEvent(new Event('submit'));
	}
	for (const i of Array.from(qsa('input,textarea,select', form))) {
		if (i.disabled) continue;

		i.oninput = debounce(submit, 600);
	}

	if (go) submit();
}
async function edit(obj) {
	const FLASH = dt.FLASH;

	const scm = obj.model.schema;

	function sanity_check() {
		if (!form$1.reportValidity()) {
			FLASH.push({
				"type":    'error',
				"title":   'Invalid Form',
				"message": `
There are one or more errors on the form.
Inspect the entire form for inputs marked in red (some may be collapsed).`,
			});
		}

		const diff = object_diff(scm, obj.data, form.extract(form$1));
		if (!empty(diff)) {
			FLASH.push({
				"timeout": 0,
				"type":    "info",
				"title":   "Schema changed. Save needed.",
				"message": `The data and UI need to sync. Please review (${diff.__changes.join(", ")}) and save the form.`,
			});

			return false;
		}

		return true;
	}
	await obj.fetch();

	const form$1 = form.create({
		"schema": scm,
		"data":   obj.data,
		"main":   obj.main(),
	});

	form$1.onsubmit = function(e) {
		if (e) e.preventDefault();

		const serialized = form.extract(form$1);

		if (!validate(scm, serialized)) {
			FLASH.push({
				"type":    'error',
				"title":   "Not sending to DB!",
				"message": "Did not pass the validation on this side...",
			});

			throw new Error("Invalid Schema!");
		}

		obj.patch(serialized)
			.then(changes => update(form$1, changes, obj));

		return false;
	};

	sanity_check();

	edit_resortable(form$1);

	if (obj.model.async_edit) {
		async_edit(form$1, false);

		const f = function(muts) {
			for (const m of muts)
				console.log(m.type, m);

			return debounce(_ => async_edit(form$1, true), 300);
		};

		const observer = new MutationObserver(f);

		observer.observe(form$1, { "childList": true, "subtree": true });
	}

	const submit = ce('button', "Save", { "type": 'submit' });
	submit.setAttribute('form', form$1.getAttribute('id'));

	const destroy = ce('button', "Destroy", { "bind": "destroy"});
	destroy.onclick = function() {
		if (confirm('Delete? SURE?!'))
			obj.destroy().then(_ => exec(this.callback));
	};

	return {
		"form":     form$1,
		submit,
		destroy,
		"object": obj,
		"schema": scm,
	};
}
async function edit_modal(obj) {
	const FLASH = dt.FLASH;

	const url = new URL(location);

	const edit_modal = new modal({
		"destroy": true,
	});

	const e = await edit(obj);

	function check() {
		const diff = object_diff(e.schema, e.object.data, form.extract(e.form));
		if (!empty(diff)) {
			FLASH.push({
				"title":   "Unsaved changes",
				"message": diff.__changes.join(', '),
			});

			return (!confirm("Model changed. Click 'Cancel' to discard changes."));
		} else {
			url.searchParams.delete('edit_model');
			history.replaceState(null, null, url);

			return true;
		}
	}
	edit_modal.check = check;

	const drawer = ce('div', null, { "class": 'actions-drawer' });

	const cancel = ce('button', ce('i', null, { "class": 'bi-x' }), { "bind": 'close', "title": 'Cancel' });
	cancel.onclick = function(ev) {
		ev.preventDefault();
		edit_modal.remove();
	};

	e.submit.replaceChildren(ce('i', null, { "class": 'bi-check2-circle' }));
	e.submit.setAttribute('title', "Save");

	e.destroy.replaceChildren(ce('i', null, { "class": 'bi-exclamation-diamond' }));
	e.destroy.setAttribute('title', "Delete");

	console.log(obj);

	drawer.append(
		cancel,
		obj.model.async_edit ? "" : e.submit,
		obj.model.delete_disabled ? "" : e.destroy,
	);

	edit_modal.dialog.append(drawer);

	edit_modal.set({
		"content": e.form,
	});

	const ej = maybe$1(obj, 'model', 'edit_modal_jobs');
	if (ej) Promise.all(ej.map(j => j.call(this, obj, e.form, edit_modal)));

	url.searchParams.set('edit_model', e.object.pk());
	history.replaceState(null, null, url);

	edit_modal.show();
}

function gen(module, collection) {
	const form$1 = form.create({
		"schema": module.model.schema,
		"data":   null,
	});

	const footer = ce('div');

	const cancel = ce('button', "Cancel", { "bind": 'close' });
	const submit = ce('button', "Save", { "type": 'submit' });

	submit.setAttribute('form', form$1.id);

	form$1.onsubmit = function(e) {
		e.preventDefault();

		const o = new object$1({
			module,
			collection,
			"data": form.extract(form$1),
		});

		o.create()
			.then(r => {
				if (!r) return null;

				new_modal.remove();
				edit_modal(o);
			});
	};

	cancel.onclick = function(e) {
		e.preventDefault();
		new_modal.remove();
	};

	footer.append(cancel, submit);

	function fill_location_params(form) {
		const inputs = qsa('input', form);
		const url = new URL(location);

		let p, i;
		for (i = 0; i < inputs.length; i++) {
			if (p = url.searchParams.get(inputs[i].name)) inputs[i].value = p;
		}
	}
	fill_location_params(form$1);

	const new_modal = new modal({
		"content": form$1,
		"footer":  footer,
		"destroy": true,
	});

	const nj = maybe$1(module, 'model', 'new_modal_jobs');
	if (nj) Promise.all(nj.map(j => j.call(null, module, form$1, new_modal)));

	new_modal.show();
}

function maybe(o, ...path) {
	return (o === null || o === undefined || !path.length) ? o :
		maybe(o[path[0]], ...path.slice(1));
}
function and(head, ...tail) {
	if (!head) return false;
	if (!tail.length) return head;

	return and(Boolean(tail[0]), ...tail.slice(1));
}
function or(head, ...tail) {
	if (head) return true;
	if (!tail.length) return head;

	return or(Boolean(tail[0]), ...tail.slice(1));
}
function tmpl(s) {
	const el = document.querySelector(s);
	if (el === null)
		throw new Error(`tmpl: element/node with selector '${s}' is null.`);

	return el.content.cloneNode(true);
}
function extract(data, a) {
	return /.*\..*/.test(a) ? maybe(data, ...a.split('.')) : data[a];
}
function bind(el, data, opts = { "final": true }) {
	if (el.constructor.name === 'ShadowRoot') ; else if (el.constructor.name === 'DocumentFragment') {
		for (const e of Array.from(el.children)) bind(e, data, opts);
		return el;
	}

	for (const e of el.querySelectorAll('[bind-tmpl]'))
		template(e, data, opts);

	for (const e of el.querySelectorAll(':scope > [bind-descend]'))
		descend(e, data, opts);

	const x = /^bind(-attr-)?(.*)/;

	for (const e of [el, ...el.getElementsByTagName("*")]) {
		if (!e.attributes.length) continue;

		for (const a of Array.from(e.attributes)) {
			const m = a.nodeName.match(x);
			if (!m) continue;

			switch (m[2].replace(/^-/, '')) {
			case 'each':
				each(e, data, opts);
				break;

			case 'similar':
				similar(e, data, opts);
				break;

			case 'differs':
				differs(e, data, opts);
				break;

			case 'cond':
			case 'if':
				cond(e, data);
				break;

			case 'unless':
			case 'ifnot':
				unless(e, data);
				break;

			case '':
			case 'replace':
				element(e, data, opts);
				break;

			case 'value':
				value(e, data, opts);
				break;

			case 'lambda':
				lambda(e, data, opts);
				break;

			case 'init':
				init$1(e, data, opts);
				break;

			case 'listen':
				listen(e, data, opts);
				break;

			case 'not':
			case 'arg':
			case 'func':
			case 'format':
				// used as arguments.
				break;

			case 'descend':
			case 'tmpl':
				break;

			case 'attr':
				console.warn("bind: deprecating 'bind-attr + bind-arg'. From now on, use: bind-attr-<something>='<arg>'", e);
				__attr(e, data, opts);
				break;

			default:
				if (m[1])
					attr(e, data, a.nodeName, opts);
				else
					console.warn(`bind: dont't know what to do with ${a.nodeName}:`, e, data);
			}
		}
	}

	return el;
}
function template(el, data, opts) {
	const a = el.getAttribute('bind-tmpl');

	if (a === null) return;

	el.replaceChildren(tmpl(a));

	if (opts['final']) el.removeAttribute('bind-tmpl');
}
function descend(el, data, opts) {
	const a = el.getAttribute('bind-descend');

	if (a === null) return;

	if (data === undefined) return;
	if (or(data[a] === undefined, data[a] === null)) return;

	bind(el, data[a], opts);

	if (opts['final']) el.removeAttribute('bind-descend');
}
function element(el, data, opts) {
	const a = el.getAttribute('bind');

	if (a === null) return;

	if (a === "_") {
		el.innerText = format(el, data, opts);
		if (opts['final']) el.removeAttribute('bind');
		return;
	}

	const v = extract(data, a);

	if (or(v === undefined, v === null)) return;

	if (el.hasAttribute('bind-replace')) {
		el.replaceWith(v);
		return;
	}

	if (v instanceof Node)
		el.replaceChildren(v);
	else
		el.innerHTML = format(el, v, opts);

	if (opts['final']) {
		el.removeAttribute('bind');
		el.removeAttribute('bind-replace');
	}
}
function value(el, data, opts) {
	const a = el.getAttribute('bind-value');

	if (a === null) return;

	if (a === "_") {
		el.value = format(el, data, opts);
		if (opts['final']) el.removeAttribute('bind-value');

		return;
	}

	const v = extract(data, a);

	if (or(v === undefined, v === null)) return;

	el.value = format(el, v, opts);

	if (opts['final']) el.removeAttribute('bind-value');
}
function each(el, data, opts) {
	const a = el.getAttribute('bind-each');

	if (a === null) return;

	let payload = extract(data, a);

	if (a === "_") payload = data;

	const c = el.cloneNode(true);
	c.removeAttribute('bind-each');

	if (payload) {
		if (!Array.isArray(payload)) {
			console.error(JSON.stringify(data, null, 2), payload, el);
			throw new Error(`bind-each: "${a}" is not an array`);
		}

		if (!payload.length) {
			el.remove();
			return;
		}

		for (const e of payload)
			el.parentNode.append(bind(c.cloneNode(true), e, opts));
	}

	el.remove();
}
function __attr(el, data, opts) {
	const t = el.getAttribute('bind-attr');
	const a = el.getAttribute('bind-arg');

	if (t === null) return;

	if (a === null) return;

	if (a === "_") {
		el.setAttribute(t, data);
		return;
	}

	const v = extract(data, a);

	if (or(v === undefined, v === null)) return;

	let n;
	let f = format(el, v, opts);

	if (!v && (n = el.getAttribute('bind-not')))
		f = n;

	if (t === 'value' && el.tagName === 'INPUT')
		el.value = f;
	else
		el.setAttribute(t, f);

	if (opts['final']) {
		el.removeAttribute('bind-attr');
		el.removeAttribute('bind-arg');
		el.removeAttribute('bind-not');
	}
}
function attr(el, data, attr, opts) {
	const t = el.getAttribute(attr);

	if (t === null) return;

	const v = extract(data, t);

	if (v === null) {
		el.removeAttribute(attr);
		return;
	}

	const f = format(el, v, opts);
	if (f === false)
		el.removeAttribute(attr.replace(/^bind-attr-/, ''));
	else
		el.setAttribute(attr.replace(/^bind-attr-/, ''), (f === true) ? '' : f);

	if (opts['final']) {
		el.removeAttribute(attr);
	}
}
function lambda(el, data, opts) {
	const l = el.getAttribute('bind-lambda');
	const v = el.getAttribute('bind-arg');

	if (l === null) return;

	if (and(l, v, maybe(data, v))) {
		const t = format(el, eval(`${l}(data['${v}'])`), opts); // yes, I did it!

		if (el.hasAttribute('bind-replace')) {
			el.replaceWith(t);
			return;
		}

		if (t instanceof Node)
			el.append(t);
		else
			el.innerHTML = t;
	}

	if (opts['final']) {
		el.removeAttribute('bind-lambda');
		el.removeAttribute('bind-arg');
	}
}
function init$1(el, data, opts) {
	const f = el.getAttribute('bind-init');

	if (f === null) return;

	if (typeof data[f] === 'function')
		data[f](...arguments);

	if (opts['final']) {
		el.removeAttribute('bind-init');
	}
}
function listen(el, data, opts) {
	const l = el.getAttribute('bind-listen');
	const a = el.getAttribute('bind-func');

	if (a === null) return;

	const v = extract(data, a);

	if (!and(l, v)) return;

	if (and(l, v, typeof v === 'function'))
		el.addEventListener(l, v.bind(el, data));

	if (opts['final']) {
		el.removeAttribute('bind-func');
		el.removeAttribute('bind-listen');
	}
}
function cond(el, data, _) {
	const a = el.getAttribute('bind-cond') || el.getAttribute('bind-if');

	if (a === null) return;

	const v = extract(data, a);

	if (!v) {
		el.remove();
		return;
	}

	el.removeAttribute('bind-cond');
	el.removeAttribute('bind-if');
}
function unless(el, data, _) {
	const a = el.getAttribute('bind-unless') || el.getAttribute('bind-ifnot');

	if (a === null) return;

	const v = extract(data, a);

	if (v) {
		el.remove();
		return;
	}

	el.removeAttribute('bind-unless');
	el.removeAttribute('bind-ifnot');
}
function similar(el, data, opts) {
	const a = el.getAttribute('bind-similar');
	const v = el.getAttribute('bind-arg');

	if (a === null) return;

	const t = extract(data, a);

	if (t != v) el.remove();

	if (opts['final']) {
		el.removeAttribute('bind-similar');
		el.removeAttribute('bind-arg');
	}
}
function differs(el, data, opts) {
	const a = el.getAttribute('bind-differs');
	const v = el.getAttribute('bind-arg');

	if (a === null) return;

	const t = extract(data, a);

	if (t == v) el.remove();

	if (opts['final']) {
		el.removeAttribute('bind-similar');
		el.removeAttribute('bind-arg');
	}
}
function format(el, data = null, opts) {
	let t = data;

	const f = el.getAttribute('bind-format');

	if (f === null) return t;

	if (f === 'json')
		t = JSON.stringify(data);
	else if (f === 'pretty-json')
		t = JSON.stringify(data, null, "  ");
	else
		t = f.replace('{0}', data);

	if (opts['final']) {
		el.removeAttribute('bind-format');
		el.removeAttribute('bind-attr');
		el.removeAttribute('bind-arg');
	}

	return t;
}

let row_template = undefined;

class row {
	constructor(obj, events) {
		this.object = obj;
		this.events = Object.assign({
			'[dt-edit]': ["click", edit_modal],
		}, events);

		return this;
	};

	async render() {
		const o = this.object;

		await this._template();

		this.el = row_template.cloneNode(true);
		bind(this.el, o.data);

		for (const e in this.events) {
			const t = qs(e, this.el);
			if (!t) continue;

			const ev = this.events[e];
			t.addEventListener(ev[0], _ => ev[1](o));
		}

		return this.el;
	};

	async _template() {
		if (row_template) return;

		const base = this.object.module.base;

		row_template = tmpl$1(`template[class=tablerow][module=${base}]`) ??
			await remote_tmpl(base + "/table-row.html");
	}
}

class table {
	constructor({ module, collection, rowevents, filters, switches }) {
		this.module = module;
		this.collection = collection;

		this.rowevents = rowevents;

		this.filters = coalesce(filters, []);
		this.filterinput = null;
		this.filterre = new RegExp();

		this.switches = coalesce(switches, {});
		this.switches_els = [];
		this.switches_active = {};
	};

	async render() {
		const main = qs('body > main');
		let table = qs('table', main);
		let tbody, thead;

		if (!table) {
			if (maybe$1(this.filters, 'length') && this.collection.objects.length > 2) {
				this.filterinput = form.input({
					"type":        "regexp",
					"placeholder": `filter: ${this.filters.join(', ')}`,
					"autofocus":   '',
				}, {
					"data":   null,
					"key":    "query",
					"value":  null,
					"is_new": false,
					"fn":     _ => {
						this.filterre = this.filterinput.regexp;
						this.render();

						const u = new URL(location);
						u.searchParams.set('filter', this.filterinput.value);
						history.replaceState(null, null, u);
					},
				});

				this.filterinput.onkeypress = e => {
					if (e.key !== 'Enter') return;

					const r = qs('tr', tbody);
					const t = this.collection.objects.find(o => o.row.el === r);
					if (t) edit_modal(t);
				};

				main.append(this.filterinput);
				main.append(ce('br'));
			}

			if (Object.keys(this.switches).length) {
				this.switches_els = Object.keys(this.switches).map(k => {
					const c = ce('div', null, { "switch": k });

					const ss = this.switches[k].map(e => {
						const u = uuid();
						const s = ce('span');

						const i = ce('input', null, { "id": `input-${u}`, "type": "checkbox", "value": e });
						const l = ce('label', e, { "for": `input-${u}` });

						i.oninput = _ => {
							this.switches_active[k] = Array.from(qsa(`div[switch="${k}"] input:checked`)).map(e => e.value);
							this.render();
						};

						s.append(i,l);

						return s;
					});

					c.append(...ss);

					return c;
				});

				for (const el of this.switches_els)
					main.append(el);

				main.append(ce('br'));
			}

			main.append(table = ce('table'));
			table.append(thead = ce('thead'));
			table.append(tbody = ce('tbody'));

			remote_tmpl(this.module.base + "/table-style.css")
				.then(s => {
					if (!s) return;

					const el = ce('style');
					el.textContent = s.textContent;

					document.head.append(el);
				});

			const t = `template[class=tableheader][module=${this.module.base}]`;

			if (qs(t))
				thead.append(tmpl$1(t));
			else
				thead.append(await remote_tmpl(this.module.base + "/table-header.html"));

			const sorts = qsa('[table-sort]', thead);
			let lastsort;
			let order;

			for (const h of sorts) {
				const a = h.getAttribute('table-sort');

				h.onclick = _ => {
					for (const s of sorts) s.className = '';

					if (lastsort !== a) order = 1;
					else order = (-1 * order);

					this.collection.sort(a, order);
					this.collection.refresh();

					if (order === 1) h.className = 'down';
					else if (order === -1) h.className = 'up';

					lastsort = a;
				};
			}

			if (this.filterinput) this.filterinput.focus();
		}
		else {
			tbody = qs('tbody', table);
			thead = qs('thead', table);
			tbody.replaceChildren();
		}

		async function draw(i) {
			await i.row.render();
			tbody.append(i.row.el);
		}
		for (const i of this.collection.objects) {
			if (!i.row) i.row = new row(i, this.rowevents);

			let ok = false;

			if (empty(this.switches)) ok = true;

			for (const f in this.switches) {
				const a = this.switches_active[f];

				if (!maybe$1(a, 'length')) {
					ok = true;
					break;
				}

				if (i.data[f] && i.data[f].filter(v => a && a.includes(v)).length) {
					ok = true;
					break;
				}

				ok = false;
			}

			if (!ok) continue;

			for (const f of this.filters) {
				if (!i.data[f] && String(this.filterre) === '/(?:)/i') {
					ok = true;
					break;
				}

				else if (i.data[f] && i.data[f].match(this.filterre)) {
					ok = true;
					break;
				}

				ok = false;
			}

			if (ok) await draw(i);
		}
	};
}

let shortcut_keys;

const action_drawer = ce('div', null, { "class": 'actions-drawer' });

const url$1 = new URL(location);
const id = url$1.searchParams.get('id');

async function init(module) {
	const normal = (typeof module.init === 'function') ?
		(await module.init(module)) === true :
		true;

	await remote_tmpl(module.base + "/style.css")
		.then(s => {
			if (!s) return;

			const el = ce('style');
			el.textContent = s.textContent;

			document.head.append(el);
		});

	if (!normal)
		await header(module, null);
	else if (id)
		await single(module, id);
	else
		dt.collections[module.base] = await table_view(module);

	footer();
}
async function single(module, id) {
	const obj = new object$1({ module, "data": { "id": id } });
	await obj.fetch();

	if (typeof module.single === 'function')
		module.single(module, obj);
	else
		dt.collections[module.base] = await table_view(module);
}
function shortcuts_setup(map) {
	shortcut_keys = map;

	document.addEventListener('keydown', e => {
		if (!e.ctrlKey) return;

		for (const [k,f] of map)
			if (k.includes(e.key)) f();
	});
}
function shortcuts_modal() {
	const t = ce('table');

	t.append(ce('tr', [
		ce('th', "Bound Keys"),
		ce('th', "Function"),
	]));

	for (const [keys, fn] of shortcut_keys.entries()) {
		const c = JSON.stringify(keys)
			.replace(/[\[\]]/g, '')
			.replace(',', ', ');

		t.append(ce('tr', [
			ce('td', ce('code', c)),
			ce('td', fn.name),
		]));
	}

	const m = new modal({
		"header":  "Keyboard Shortcuts",
		"content": t,
		"destroy": true,
	});

	m.show();
}
async function table_view(module) {
	const c = new collection(module);
	await c.fetch();

	header(module, c);

	c.table = new table({
		module,
		"collection": c,
		...module.collection,
	});

	await c.table.render();

	const f = url$1.searchParams.get('filter');
	const eid = url$1.searchParams.get('edit_model');

	if (f) {
		c.table.filterinput.value = f;
		c.table.filterinput.dispatchEvent(new Event('input'));
	}

	if (eid) {
		const o = c.objects.find(i => eid === (eid.match(',') ? i.pk().join(',') : i.pk()));

		if (o) edit_modal(o);
		else {
			url$1.searchParams.delete('edit_model');
			history.replaceState(null, null, url$1);
		}
	}

	return c;
}
function action(el) {
	action_drawer.append(el);
}
function nav_setup() {
	const n = ce('nav');
	n.id = 'dt-nav';

	n.append(ce('a', ce('i', null, { "class": "bi-layout-wtf" }), { "href": "/" }));

	for (const i of dt.config.navlist) {
		let a;

		if (!i[0])
			a = ce('div', null, { "class": "separator" });
		else if (i[0].match('^/') || i[0].match('^http'))
			a = ce('a', ce('span', i[1]), { "href": i[0] });
		else
			a = ce('a', ce('span', i[1]), { "href": dt.config.base + `/?model=${i[0]}` });

		if (i[2]) a.prepend(bi_icon(i[2]));

		n.append(a);
	}

	const b = ce('div', null, { "class": 'bottom' });

	const k = ce('a', [
		bi_icon('keyboard'),
		ce('span', "Keyboard"),
	], { "href": "#keyboard" });

	k.onclick = e => {
		e.preventDefault();
		shortcuts_modal();
	};

	b.append(k);
	n.append(b);

	document.body.prepend(n);

	return n;
}
async function header(module, collection) {
	const main_el = qs('body > main');
	let t;
	const h = module.header;

	const header_el = ce('header');
	header_el.append(action_drawer);

	main_el.prepend(header_el);

	if (typeof h === 'function')
		t = await h();
	else if (typeof h === 'string')
		t = h;
	else if (h instanceof HTMLElement)
		header_el.append(h);

	if (t) header_el.append(ce('h1', t));

	if (collection && module.new_disabled !== true) {
		const btn = ce('button', bi_icon('plus'));
		btn.onclick = _ => gen(module, collection);

		action(btn);
	}
}
function footer() {
	const config = dt.config;

	const f = ce('footer');
	f.append(
		ce('div', null),
		ce('div', config.project || ""),
		ce('div', `CMS powered by <a href="https://git.263.nu/f/duck-tape/">duck-tape</a>`),
	);

	qs('body > main').insertAdjacentElement('beforeend', f);
}

const config = {};
const modules = {};
const collections = {};

const url = new URL(location);

const API = new pgrest();
const FLASH = new flash();
const model = url.searchParams.get('model');

async function main(extras) {
	Object.assign(config, extras.config, {
		"navlist":    extras.navlist,
		"fetchables": extras.fetchables,
	});

	config.origin = config.src.replace(/(bundle|dt)(.min)?.js/, '');

	API.base = config.api;
	API.flash = FLASH;
	API.login_redirect = function() {
		const m = new modal({
			"id":      "login-modal",
			"content": ce('iframe', null, { "src": config.base + '/?login&popup=true' }),
		});

		let i = null;
		i = setInterval(function() {
			if (!localStorage.token) return;
			clearInterval(i);
			m.remove();
		}, 100);

		setTimeout(_ => m.show(), 1000);
	};

	if (login(config)) return;

	this.upload = upload();

	shortcuts_setup(new Map([
		[['i', 'ArrowUp'], model_search_modal],
		[['y', 'ArrowDown'], reverse_id_lookup],
		[[' ', '7'], dt.upload.run],
	]));

	document.body.append(ce('main'));

	if (model) {
		nav_setup();

		const module = await import(`${config.base}/src/${model}.js`);
		const name = module.base;

		modules[name] = module;
		collections[name] = [];

		if (typeof extras.config.pre_view === "function")
			await extras.config.pre_view();

		init(module);
	} else if (!login(config)) {
		if (config.landing)
			window.location = config.landing;
		else
			nav_setup();
	}
}

const dt$1 = {
	API,
	FLASH,
	config,
	main,
	model,
	// upload,
	"object":      object$1,
	gen,
	collection,
	external_link,
	edit,
	"edit_update": update,
	edit_modal,
	model_search,
	model_search_modal,
	modules,
	collections,
	action,
};

window.dt = dt$1;

export { dt$1 as default };
