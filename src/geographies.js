import modal from '../lib/modal.js';

import {
	email_user,
	external_link_base,
} from './extras.js';

import {
	and,
	ce,
	human_time,
	maybe,
	or,
	qs,
	remote_tmpl,
	until,
} from '../lib/helpers.js';

import * as paver from './paver.js';

import * as datasets_module from './datasets.js';

import deployment_options from './deployment-options.js';

let ADM = 0;

const FLASH = dt.FLASH;

const API = dt.API;

export const base = 'geographies';

export const header = "Geographies";

window.email_user = email_user;
window.human_time = human_time;

export async function init() {
	const d = 'body main header .actions-drawer';
	const t = await remote_tmpl("geographies/offroad-form.html");

	// Follow a build through the departer's /status/<id> endpoint and surface
	// the result in the modal: progress while running, a download link when
	// done, an error otherwise. The endpoint is the same one the build POST
	// went to, so this works for production and per-ticket departers alike.
	async function poll_build(c, id) {
		const endpoint = dt.config.departer_endpoint;
		const token = localStorage.getItem('token');

		const progress = qs('#offroad-progress', c);
		const download = qs('#offroad-download', c);
		const error = qs('#offroad-error', c);
		const link = qs('#download', c);

		// A newer Submit on the same modal supersedes this poll.
		c.dataset.poll = (parseInt(c.dataset.poll || "0", 10) + 1).toString();
		const mine = c.dataset.poll;

		progress.textContent = "Build starting…";
		progress.style.display = "";
		download.style.display = "none";
		error.style.display = "none";

		const started = Date.now();
		const timeout = 15 * 60 * 1000;

		while (true) {
			if (c.dataset.poll !== mine || !c.isConnected) return;

			let state = "running", zip = null, detail = "";

			try {
				const r = await fetch(`${endpoint}/status/${id}`, {
					"headers": { "Authorization": `Bearer ${token}` },
				});

				if (r.status === 404) {
					state = "error";
					detail = "the build was not found";
				} else {
					const j = await r.json();
					state = j.state;
					zip = j.zip;
					detail = j.detail || "";
				}
			} catch (e) {
				detail = "waiting for the build to start…";
			}

			if (state === "done" && zip) {
				link.href = zip_href(endpoint, zip);
				progress.style.display = "none";
				download.style.display = "";
				return;
			}

			if (state === "error") {
				progress.style.display = "none";
				error.textContent = detail ?
					`The build failed: ${detail}. See the log for details.` :
					"The build failed. See the log for details.";
				error.style.display = "";
				return;
			}

			// Running: elapsed time plus the log's last line as progress.
			const elapsed = Math.round((Date.now() - started) / 1000);
			let line = detail;

			if (!line) {
				try {
					const lr = await fetch(`${endpoint}/builds/${id}.log`, {
						"headers": { "Range": "bytes=-256" },
					});
					if (lr.ok) line = (await lr.text()).trim().split("\n").pop() || "";
				} catch (e) {
					// Log tail not reachable yet; keep the previous progress line.
				}
			}

			progress.textContent = `Building… (${elapsed}s) ${line}`;

			if (Date.now() - started > timeout) {
				progress.textContent = "The build is taking a long time — follow it in the log.";
				return;
			}

			await new Promise(res => setTimeout(res, 4000));
		}
	}

	// The zip comes back from /status as a full URL (build script with a
	// public base), an absolute path (without one), or a relative path.
	function zip_href(endpoint, zip) {
		return zip.startsWith("http") ? zip :
			zip.startsWith("/") ? new URL(endpoint).origin + zip :
				`${endpoint}/${zip}`;
	}

	// Recent builds, remembered per-browser so a closed tab doesn't lose the
	// artifact: the id alone is enough to re-ask the departer for status and
	// the download link (it answers from the log even after restarts).
	const RECENTS_KEY = 'offroad-builds';
	const RECENTS_MAX = 10;

	function offroad_recents() {
		try { return JSON.parse(localStorage.getItem(RECENTS_KEY)) || []; }
		catch (e) { return []; }
	}

	function remember_build(id, label) {
		const r = offroad_recents().filter(b => b.id !== id);
		r.unshift({ "id": id, "ts": Date.now(), "label": label });
		localStorage.setItem(RECENTS_KEY, JSON.stringify(r.slice(0, RECENTS_MAX)));
	}

	function render_recents(c) {
		const recents = offroad_recents();
		if (!recents.length) return;

		const endpoint = dt.config.departer_endpoint;
		const token = localStorage.getItem('token');
		const list = qs('#offroad-recents-list', c);

		for (const b of recents) {
			const status = ce('span', 'checking…');
			const dl = ce('a', 'download', { "href": '#', "download": true, "style": 'display: none; margin-left: 0.4em;' });
			const log = ce('a', 'log', { "href": `${endpoint}/builds/${b.id}.log`, "target": '_blank' });

			const row = ce('div', null, { "style": 'margin-bottom: 0.35em;' });
			row.append(
				ce('span', `${human_time(b.ts)} — ${b.label} — `),
				status, ce('span', ' ('), log, ce('span', ')'),
				dl,
			);
			list.append(row);

			poll_recent(row, status, dl, b, endpoint, token);
		}

		qs('#offroad-recents', c).style.display = '';
	}

	async function poll_recent(row, status, dl, b, endpoint, token) {
		while (row.isConnected) {
			let state = null, zip = null;

			try {
				const r = await fetch(`${endpoint}/status/${b.id}`, {
					"headers": { "Authorization": `Bearer ${token}` },
				});

				if (r.status === 404) state = "gone";
				else ({ state, zip } = await r.json());
			} catch (e) {
				await new Promise(res => setTimeout(res, 4000));
				continue;
			}

			if (state === "done" && zip) {
				dl.href = zip_href(endpoint, zip);
				dl.style.display = "";
				status.textContent = "done";
				return;
			}

			if (state === "error") {
				status.textContent = "failed";
				return;
			}

			if (state === "gone") {
				status.textContent = "no longer available";
				localStorage.setItem(RECENTS_KEY, JSON.stringify(offroad_recents().filter(x => x.id !== b.id)));
				return;
			}

			status.textContent = "running…";
			await new Promise(res => setTimeout(res, 4000));
		}
	}

	function offroad() {
		const content = t.cloneNode(true);

		const arr = dt.collections.geographies.objects.slice(0)
			.sort((a,b) => a.data.name > b.data.name ? 1 : -1)
			.map(g => ce('option', g.data.name, { "value": g.data.id }));

		qs('select[name="ids"]', content).append(...arr);
		const form = qs('form', content);

		const depth = qs('[name="depth"]', form);
		depth.value = ADM;
		depth.setAttribute('min', ADM);

		const m = new modal({
			"header": ce('h3', "Offroad build"),
			content,
		});

		render_recents(content);

		form.onsubmit = function(e) {
			e.preventDefault();

			fetch(`${dt.config.departer_endpoint}/build`, {
				"method":  'POST',
				"headers": {
					"Authorization": `Bearer ${localStorage.getItem('token')}`,
				},
				"body": JSON.stringify({
					"os":    qs('[name="os"]', form).value,
					"ids":   arr.filter(o => o.selected).map(o => o.value),
					"depth": +depth.value,
				}),
			})
				.then(r => r.json())
				.then(r => {
					const c = m.content;

					qs('#offroad-info', c).style.display = "";
					qs('#log', c).href = `${dt.config.departer_endpoint}/builds/${r.id}.log`;

					const label = arr.filter(o => o.selected).map(o => o.textContent.trim()).join(', ')
						+ ` (${qs('[name="os"]', form).value}, adm ${depth.value})`;
					remember_build(r.id, label);

					poll_build(c, r.id);
				});
		};

		m.show();
	};

	until(_ => typeof (ADM = maybe(dt.collections, 'geographies', 'objects', 0, 'data', 'adm')) === 'number')
		.then(function() {
			const a = ce('button', ce('i', null, { "class": 'bi-signpost-split-fill', "title": 'Offroad Build' }));

			a.onclick = offroad;

			qs(d).append(a);
		});

	return true;
};

function configuration_validate(newdata, data) {
	return and(
		configuration_sort_datasets_validate(newdata, data),
	);
};

async function configuration_sort_datasets_validate(newdata, data) {
	const datasets = await dt.API.get('datasets', {
		"geography_id": `eq.${data.id}`,
		"select":       ["name", "category_name"],
	});

	const arr = maybe(newdata, 'configuration', 'sort_datasets');

	if (!maybe(arr, 'length')) return true;

	if (!arr.every(t => datasets.find(d => or(d.name === t, d.category_name === t)))) {
		FLASH.clear();

		const e = arr.find(t => !datasets.find(d => or(d.name === t, d.category_name === t)));
		FLASH.push({
			"type":    'error',
			"title":   "Configuration -> sort_datasets",
			"message": `'${e}' not found`,
		});

		return false;
	}

	return true;
};

function envelope_validate(newdata) {
	if (!maybe(newdata, 'envelope', 'length')) return true;

	const e = newdata['envelope'];

	return and(e[0] >= -180,
	           e[2] <=  180,
	           e[0] <  e[2],
	           e[1] >=  -90,
	           e[3] <=   90,
	           e[1] <  e[3]);
};

function subgeography_divisions(data) {
	return (maybe(data, 'configuration', 'divisions') || [])
		.map((d, level) => ({ ...d, level }))
		.filter(d => d.level > 0 && d.dataset_id);
};

async function generate_subgeographies() {
	const divisions = subgeography_divisions(this);
	if (!divisions.length)
		throw new Error("buah!");

	paver.subgeographies(this, { divisions });
};

function inherit_datasets() {
	API.get('datasets', {
		"select":        "*,category_name",
		"geography_id":  'eq.' + this.data.parent_id,
		"category_name": 'not.in.(indicator,timeline-indicator,boundaries,admin-tiers,outline)',
		"type":          'not.in.(raster-mutant)',
	}).then(async datasets => {
		const content = await remote_tmpl("geographies/paver-inherit-datasets.html");

		const m = new modal({
			content,
		});

		m.show();

		const errors = [];

		for (const d of datasets) {
			const infopre = content.querySelector('pre') || document.querySelector('pre');
			infopre.innerText = "";

			const o = new dt.object({
				"module": datasets_module,
				"data":   d,
			});

			const n = await o.clone({
				"deployment":      ['protected'],
				"processed_files": [],
				"geography_id":    this.data.id,
				"source_files":    d.source_files,
				"name":            d.name,
			});

			await n.fetch();

			const t = await paver.routine(n, { "pre": infopre });

			if (typeof t !== 'function') {
				errors.push(Object.assign(t,n));
				continue;
			}

			const x = await t();
			if (x.error) errors.push(Object.assign(x,n));
		}

		for (const e of errors)
			dt.FLASH.push({
				"type":    "error",
				"title":   maybe(e, 'data', 'category_name'),
				"message": "Routine: " + maybe(e, 'routine') + " - " + maybe(e, 'error'),
			});

		dt.FLASH.push({
			"type":    "error",
			"title":   "Inheritance errors",
			"message": "The following datasets were created and flagged.",
		});

		console.error(errors);
	});
};

function external_link(object, form) {
	dt.external_link(object, form, m => `${external_link_base(m)}/a/?id=${m.id}&inputs=boundaries`);
};

function subgeographies_button(object, _, edit_modal) {
	if (!and(!object.data.has_subgeographies, subgeography_divisions(object.data).length)) return;

	const p = ce('button', ce('i', null, { "class": 'bi-filter', "title": 'Subgeographies' }));
	p.onclick = _ => generate_subgeographies.call(object.data);

	qs('.actions-drawer', edit_modal.dialog).append(p);
};

function inherit_button(object, _, edit_modal) {
	if (!object.data.parent_id) return;

	const p = ce('button', ce('i', null, { "class": 'bi-box-arrow-in-up-right', "title": 'Inherit' }));
	p.onclick = _ => inherit_datasets.call(object);

	qs('.actions-drawer', edit_modal.dialog).append(p);
};

export const model = {
	"main": "name",

	"schema": {
		"name": {
			"type":     "string",
			"required": true,
			"label":    "Geography Name",
			"hint":     "The short name of the geography.",
		},

		"parent_id": {
			"type":       "uuid",
			"fkey":       "geographies",
			"label":      "Parent Geography",
			"constraint": "subgeographies:geographies!parent_id",
			"required":   false,
			"editable":   false,
			"columns":    ['id', 'name'],
			"hint":       "The name of the parent geography. This applies to adm. 1, 2, 3 divisions. For instance, for a adm.1 geography, the parent geography is the name of the country.",
		},

		"adm": {
			"type":     "number",
			"required": true,
			"editable": false,
			"label":    "Adm. Level",
			"hint":     "Indicates the level of an administrative boundary",
		},

		"deployment": {
			"type":     "array",
			"hint":     "Select the environments where the geography will be deployed",
			"required": true,
			"nullable": false,
			"schema":   {
				"type":     "select",
				"options":  deployment_options,
				"required": true,
			},
		},

		"envelope": {
			"type":     "array",
			"validate": envelope_validate,
			"hint":     "Geography extent coordinates (4 coordinates values)",
			"schema":   {
				"type":     "number",
				"step":     "any",
				"editable": false,
				"required": true,
			},
		},

		"area": {
			"type":     "number",
			"nullable": true,
			"hint":     "Area of the geography in km<sup>2</sup>",
		},

		"resolution": {
			"type":     "number",
			"required": true,
			"editable": false,
			"hint":     "Raster resolution in meters",
		},

		"flagged": {
			"type": "boolean",
			"hint": "Flagging a geography will automatically remove it from the public environment for revision. Flagged geographies can be reviewed in the protected environment. Unflagging does not add the geography back into the public environment",
		},

		"circles": {
			"type":      "array",
			"nullable":  false,
			"collapsed":  false,
			"schema":    {
				"type":     "string",
				"pattern":  "^[a-z][a-z0-9\\-]+[^\\-]$",
				"required": true,
			},
		},

		"configuration": {
			"type":      "object",
			"label":     "Configuration",
			"collapsed": false,
			"nullable":  true,
			"validate":  configuration_validate,
			"schema":    {
				"timeline": {
					"type":    "boolean",
					"default": false,
				},

				"exclude_sector_presets": {
					"type":    "boolean",
					"default": false,
				},

				"filtered_geographies": {
					"type":    "boolean",
					"default": true,
					"hint":    "Whether to enable the filtered tab on the tool for this geography",
				},

				"introduction": {
					"type":    "text",
					"default": null,
				},

				"divisions": {
					"type":      "array",
					"nullable":  false,
					"sortable":  true,
					"collapsed": false,
					"hint":      "The national/subnational administrative level that corresponds with the geography boundaries.",
					"schema":    {
						"type":   "object",
						"schema": {
							"name": {
								"type":     "string",
								"required": true,
								"hint":     "Provinces/Territories/States? County/Municipality?",
							},
							"dataset_id": {
								"type":     "uuid",
								"nullable": true,
								"fkey":     "datasets",
								"hint":     "Outline or Admin boundaries dataset id",
							},
						},
					},
				},

				"timeline_dates": {
					"type":     "array",
					"nullable": true,
					"enabled":  m => maybe(m.configuration, 'timeline'),
					"hint":     "Configuration of dates for historical timeline component (optional)",
					"schema":   {
						"type":     "date",
						"required": true,
					},
				},

				"flag": {
					"type":     "object",
					"nullable": true,
					"enabled":  m => m.adm === 0,
					"schema":   {
						"x": {
							"type": "number",
						},
						"y": {
							"type": "number",
						},
						"width": {
							"type": "number",
						},
						"height": {
							"type": "number",
						},
						"aspect-ratio": {
							"type":    "string",
							"default": "none",
							"options": ["none", "xMaxYMax", "xMaxYMid", "xMaxYMin", "xMidYMax", "xMidYMid", "xMidYMin", "xMinYMax", "xMinYMid", "xMinYMin" ],
						},
					},
				},

				"sort_branches": {
					"type":     "array",
					"nullable": true,
					"sortable":  true,
					"hint":     "Configuration of dataset branches within the geography",
					"schema":   {
						"type":     "string",
						"required": true,
					},
				},

				"sort_subbranches": {
					"type":     "array",
					"nullable": true,
					"sortable":  true,
					"hint":     "Configuration of dataset sub-branches within the geography",
					"schema":   {
						"type":     "string",
						"required": true,
					},
				},

				"sort_datasets": {
					"type":     "array",
					"nullable": true,
					"sortable":  true,
					"hint":     "Configuration of dataset order within the geography",
					"schema":   {
						"type":     "string",
						"required": true,
					},
				},
			},
		},

		"updated": {
			"type":     "string",
			"label":    "Last update",
			"editable": false,
		},

		"updated_by": {
			"type":     "string",
			"label":    "Last update by",
			"editable": false,
		},

		"created": {
			"type":     "string",
			"label":    "Created",
			"editable": false,
		},

		"created_by": {
			"type":     "string",
			"label":    "Created by",
			"editable": false,
		},
	},

	"edit_modal_jobs": [
		external_link,
		subgeographies_button,
		inherit_button,
	],

	"after_patch": function(m, changes) {
		if (!changes['deployment']) return;

		const [before, after] = changes['deployment'];

		const c = `DEPLOYMENTS CHANGED

Select 'OK' if ALL of ${m.data.name}'s the __datasets__ deployments be updated to match.

Select 'Cancel' if you are unsure or if someone has already customised some datasets to appear in certain deployments but not others.`;

		if (after && (before.length !== after.length) && confirm(c))
			dt.API.patch('datasets', { "geography_id": `eq.${m.data.id}` }, { "payload": { "deployment": after } });

		console.warn(m, changes);
	},

	"parse": function(m) {
		m.inpublic = m.deployment.indexOf("public") > -1;
		m.inprotected = m.deployment.indexOf("protected") > -1;
		m.intest = m.deployment.indexOf("test") > -1;
		m.intraining = m.deployment.indexOf("training") > -1;

		m.deployments = m.deployment.join(',');

		m.ok = !m.flagged;

		return m;
	},
};

export const collection = {
	"filters": ['name'],

	"switches": {
		"deployment": deployment_options,
	},

	"endpoint": function() {
		const select = [
			'id',
			'name',
			'adm',
			'deployment',
			'flagged',
			'configuration',
			'has_subgeographies',
			'created',
			'created_by',
			'updated',
			'updated_by',
		];

		const params = { select };
		const url = new URL(location);
		const geography_id = url.searchParams.get('id');
		const adm = url.searchParams.get('adm');
		const parent_id = url.searchParams.get('parent_id');

		if (geography_id)
			params['id'] = `eq.${geography_id}`;
		else if (parent_id)
			params['parent_id'] = `eq.${parent_id}`;
		else
			params['adm'] = `eq.${adm ?? 0}`;

		if (parent_id)
			model['schema']['parent_id']['required'] = true;

		if (['admin', 'leader', 'manager'].includes(SELF.role))
			params['with_access'] = 'is.true';

		return params;
	},

	"rowevents": {
		"td[bind=name]": ["dblclick", flag],
	},

	"parse": model.parse,
};

async function flag(obj) {
	await obj.fetch();

	const data = Object.assign({}, obj.data);
	data.flagged = !data.flagged;

	obj.patch(data);
};
