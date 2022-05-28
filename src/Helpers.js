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
	.filter(a => a && a.date !== undefined)
	.sort((a, b) => b.date - a.date)
	.shift();

// both of these return a copy of the object. intended so that a signal will update.
export const addKeySetTrue = (object, key) => {
	object[key] = true;
	return {...object};
};
export const removeKey = (object, key) => {
	delete object[key];
	return {...object};
};