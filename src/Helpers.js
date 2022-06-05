import ear from "rabbit-ear";

const stringifyArrayPoint = (point, decimals = 4, joiner = " ") => point && point.length
	? point.map(n => cleanNumber(n, decimals)).join(joiner)
	: undefined;

const stringifyObjectPoint = (point, decimals = 4, joiner = " ") => point && point.x !== undefined
	? [point.x, point.y, point.z]
		.filter(a => a !== undefined)
		.map(n => cleanNumber(n, decimals))
		.join(joiner)
	: undefined;

export const stringifyPoint = (point, decimals = 4, joiner=" ") => stringifyObjectPoint(point, decimals, joiner)
	|| stringifyArrayPoint(point, decimals, joiner)
	|| "";

const countPlaces = function (num) {
	const m = (`${num}`).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
	if (!m) { return 0; }
	return Math.max(0, (m[1] ? m[1].length : 0) - (m[2] ? +m[2] : 0));
};

export const cleanNumber = function (num, decimals = 4) {
	if (typeof num !== "number") { return num; }
	const crop = parseFloat(num.toFixed(decimals));
	return countPlaces(num) < countPlaces(crop) ? num : crop;
	// if (countPlaces(crop) === Math.min(decimals, countPlaces(num))) {
	// 	return num;
	// }
	return crop;
};

export const mostRecentTouch = touchEvents => touchEvents
	.filter(a => a && a.timeStamp !== undefined)
	.sort((a, b) => b.timeStamp - a.timeStamp)
	.shift();

// both of these return a copy of the object. intended so that a signal will update.
export const addKeySetTrue = (object, key) => {
	object.event = { type: "down", key };
	object[key] = true;
	return {...object};
};
export const removeKey = (object, key) => {
	object.event = { type: "up", key };
	delete object[key];
	return {...object};
};

const getBoundingBox = (graph) => {
	if (!graph.vertices_coords) { return { mins: [0, 0], maxs: [1, 1]}; }
	const mins = Array.from(Array(graph.vertices_coords[0].length)).map(() => Infinity);
	const maxs = Array.from(Array(graph.vertices_coords[0].length)).map(() => -Infinity);
	graph.vertices_coords.forEach(pt => {
		mins.forEach((min, i) => { if (pt[i] < min) { mins[i] = pt[i]; }});
		maxs.forEach((max, i) => { if (pt[i] > max) { maxs[i] = pt[i]; }});
	});
	return { mins, maxs };
};

// calculate the size of the crease pattern
export const getVmin = (graph) => {
	const { mins, maxs } = getBoundingBox(graph);
	return maxs
		.map((_, i) => maxs[i] - mins[i])
		.sort((a, b) => a - b)
		.shift();
};

export const getVMax = (graph) => {
	const { mins, maxs } = getBoundingBox(graph);
	return maxs
		.map((_, i) => maxs[i] - mins[i])
		.sort((a, b) => b - a)
		.shift();
};

/**
 * @description given a mouse event and a FOLD object, create and append
 * (to the event) a "nearest" object that contains the nearest VEF from the graph.
 * @param {object} object with .x and .y
 * @param {origami} a FOLD object
 */
export const appendNearest = (event, origami) => {
	const arrayForm = event && event.x != null ? [event.x, event.y] : [0,0];
	const vertex = ear.graph.nearest_vertex(origami, arrayForm);
	const edge = ear.graph.nearest_edge(origami, arrayForm);
	const face = ear.graph.nearest_face(origami, arrayForm);
	event.nearest = {
		vertex,
		edge,
		face,
		vertex_coords: vertex != null
			? origami.vertices_coords[vertex]
			: undefined,
		edge_coords: edge != null
			? origami.edges_vertices[edge].map(v => origami.vertices_coords[v])
			: undefined,
		face_coords: face != null
			? origami.faces_vertices[face].map(v => origami.vertices_coords[v])
			: undefined,
		edge_assignment: edge != null
			? origami.edges_assignment[edge]
			: undefined,
	};
	return event;
};
