import {
	ce,
	qs,
} from '../lib/helpers.js';

import 'https://cdn.jsdelivr.net/npm/chart.js';

export const base = "analytics";

export var header = "Analytics";

const colors = ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'];

Chart.defaults.color = getComputedStyle(document.body).getPropertyValue('color');
Chart.defaults.animation.duration = 0;

qs('body > main').append(ce('div', null, { "id": "canvases" }));

async function datasets_count(geo) {
	const canvases = qs('#canvases');

	const $ = {};
	for (const n of geo.snapshots)
		for (const d of n.config.datasets)
			$[d.id] = $[d.id] ? $[d.id] + 1 : 1;

	let _$ = [];
	for (const t in $) _$.push([t, $[t]]);
	_$ = _$.sort((a,b) => a[1] < b[1] ? 1 : -1).slice(0, 10);

	if (!_$.length) return;

	const canvas = ce('canvas');

	canvases.append(canvas);

	new Chart(canvas, {
		"type": "pie",
		"data": {
			"labels":   _$.map(t => t[0] + "        "),
			"datasets": [{
				"backgroundColor": colors,
				"data":            _$.map(t => t[1]),
			}],
		},
		"options": {
			"plugins": {
				"legend": {
					"display":  true,
					"align":    "start",
					"position": "bottom",
					"labels":   {
						"boxWidth":        25,
						"useBorderRadius": true,
						"borderRadius":    2,
						"borderWidth":     0,
						"textAlign":       "left",
						"font":            { "size": 14 },
					},
				},
				"title":  {
					"display": true,
					"text":    `${geo.name} (${geo.snapshots.length})`,
					"font":    { "size": 20 },
				},
			},
		},
	});
};

export async function init() {
	const geographies = await dt.API.get('geographies', {
		"adm":    "eq.0",
		"select": ["id", "name", "snapshots(*)"],
	});

	geographies.sort((x,y) => x.snapshots.length < y.snapshots.length ? 1 : -1);

	for (const g of geographies) datasets_count(g);

	const count = geographies.reduce((a,c) => a + c.snapshots.length, 0);
	header = `Analytics (${count} snapshots)`;

	return false;
};
