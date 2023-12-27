/* global mapboxgl */
/* global GeoTIFF */

import { interpolateMagma as d3interpolateMagma } from "https://cdn.jsdelivr.net/npm/d3-scale-chromatic@3/+esm";
import { scaleLinear as d3scaleLinear } from "https://cdn.jsdelivr.net/npm/d3-scale@3/+esm";
import { range as d3range } from "https://cdn.jsdelivr.net/npm/d3-array@3/+esm";

function colorscale(opts) {
	let s;

	let { stops, domain } = opts;

	s = d3scaleLinear()
		.domain(d3range(domain.min, domain.max + 0.0000001, (domain.max - domain.min) / (stops.length - 1)))
		.range(stops)
		.clamp(true);

	function rgba(str) {
		let c;

		if (!str) return [0, 0, 0, 255];

		if (str.match(/^#([A-Fa-f0-9]{3}){1,2}$/)) {
			c = str.substring(1).split('');

			if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];

			c = '0x' + c.join('');

			return [(c>>16)&255, (c>>8)&255, c&255, 255];
		}
		else if ((c = str.match(/^rgba?\(([0-9]{1,3}), ?([0-9]{1,3}), ?([0-9]{1,3}),? ?([0-9]{1,3})?\)$/))) {
			return [+c[1], +c[2], +c[3], +c[4] || 255];
		}

		else
			throw new Error(`rgba: argument ${str} doesn't match`);
	};

	return {
		"domain": domain,
		"fn":     x => rgba(s(x)),
		"stops":  stops,
	};
};

function drawcanvas({ data, nodata, width, height, colorscale }) {
	const el = document.createElement('canvas');

	const ctx = el.getContext("2d");
	const imagedata = ctx.createImageData(width, height);
	const imgd = imagedata.data;

	el.width = width;
	el.height = height;

	let i, p;
	for (i = p = 0; i < data.length; i += 1, p += 4) {
		if (data[i] === nodata) continue;

		const c = colorscale.fn(data[i]);

		if (!c) continue;

		imgd[p] = c[0];
		imgd[p+1] = c[1];
		imgd[p+2] = c[2];
		imgd[p+3] = 255;
	}

	ctx.putImageData(imagedata, 0, 0);

	return el;
};

async function raster_tiff(endpoint) {
	const r = {};

	const blob = await fetch(endpoint).then(r => r.blob());
	const tiff = await GeoTIFF.fromBlob(blob);
	const image = await tiff.getImage();
	const rasters = await image.readRasters();

	r.data = rasters[0];
	r.width = image.getWidth();
	r.height = image.getHeight();
	r.nodata = parseFloat(image.fileDirectory.GDAL_NODATA);

	let min, max; min = max = r.nodata;
	for (let v of r.data) {
		if (v === r.nodata) continue;
		if (min === r.nodata) min = v;
		if (max === r.nodata) max = v;

		if (v > max) max = v;
		if (v < min) min = v;
	}

	r.min = min;
	r.max = max;

	return r;
};

async function plot_raster(endpoint, coordinates, map) {
	const raster = await raster_tiff(endpoint);

	const STOPS = d3range(0, 1.000000001, 0.25);

	const default_colorscale = colorscale({
		"stops":  STOPS.map(x => d3interpolateMagma(x)),
		"domain": { "min": raster.min, "max": raster.max },
	});

	const canvas = drawcanvas({
		"data":       raster.data,
		"nodata":     raster.nodata,
		"width":      raster.width,
		"height":     raster.height,
		"colorscale": default_colorscale,
	});

	return function() {
		map.addSource('source0', {
			'type': 'canvas',
			canvas,
			coordinates,
		});

		map.addLayer({
			"id":     'layer0',
			'source': 'source0',
			'type':   'raster',
			'paint':  {
				'raster-fade-duration': 0,
			},
		});
	};
};

async function plot_lines(endpoint, _, map) {
	const geojson = await fetch(endpoint).then(r => r.json());

	return function() {
		map.addSource('source0', {
			'type': 'geojson',
			'data': geojson,
		});

		map.addLayer({
			"id":     'layer0',
			'source': 'source0',
			'type':   'line',
			"layout": {
				"line-cap":   'butt',
				"line-join":  'miter',
			},
			"paint": {
				"line-color":     "#fff",
				"line-width":     3,
			},
		});
	};
};

async function plot_points(endpoint, _, map) {
	const geojson = await fetch(endpoint).then(r => r.json());

	return function() {
		map.addSource('source0', {
			'type': 'geojson',
			'data': geojson,
		});

		map.addLayer({
			"id":     'layer0',
			'source': 'source0',
			'type':   'circle',
			'paint':  {
				"circle-stroke-color": "#000",
				"circle-stroke-width": 1,
				"circle-radius":       3,
				"circle-color":        "#fff",
			},
		});
	};
};

async function plot_polygons(endpoint, _, map) {
	const geojson = await fetch(endpoint).then(r => r.json());

	return function() {
		map.addSource('source0', {
			'type': 'geojson',
			'data': geojson,
		});

		map.addLayer({
			"id":     'layer0',
			'source': 'source0',
			'type':   'fill',
			'paint':  {
				"fill-color":         "white",
				"fill-outline-color": "black",
			},
		});
	};
};

export default async function() {
	const url = new URL(location);
	const endpoint = url.searchParams.get('endpoint');
	const datatype = url.searchParams.get('datatype');

	const N = +url.searchParams.get('N');
	const E = +url.searchParams.get('E');
	const W = +url.searchParams.get('W');
	const S = +url.searchParams.get('S');

	mapboxgl.accessToken = 'pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjam54YzhjemcxemNzM3Bta3FkNXk1Z2E1In0.RqblpgU2zkMIsMCP8QPdlQ';

	const map = new mapboxgl.Map({
		"container": 'map',
		"zoom":      5,
		"style":     'mapbox://styles/mapbox/dark-v11',
	});

	map.fitBounds([W, S, E, N], { "animate": false });

	const coordinates = [ [W, N], [E, N], [E, S], [W, S] ];

	const args = [endpoint, coordinates, map];

	let fn;
	if (datatype === 'raster')
		fn = await plot_raster(...args);

	if (datatype === 'polygons')
		fn = await plot_polygons(...args);

	if (datatype === 'points')
		fn = await plot_points(...args);

	if (datatype === 'lines')
		fn = await plot_lines(...args);

	if (map.loaded()) fn();
	else map.on('load', _ => fn());
};
