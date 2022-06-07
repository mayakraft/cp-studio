import ear from "rabbit-ear";
/**
 * @description Given a point has known distances to three triangle points,
 * and given the location of that triangle's points in space, find the
 * real location of the point in space.
 * https://stackoverflow.com/questions/9747227/2d-trilateration
 * @param {number[][]} three 2D triangle points
 * @param {number[]} three distances to each of the triangle points
 * @returns {number[]} the 2D location of the point inside the triangle.
 */
const trilateration = (pts, radii) => {
	if (pts.length !== 3 || (pts[0] === undefined || pts[1] === undefined || pts[2] === undefined)) {
		return;
	}
	const ex = ear.math.scale2(
		ear.math.subtract2(pts[1], pts[0]),
		1 / ear.math.distance2(pts[1], pts[0]));
	const i = ear.math.dot2(ex, ear.math.subtract2(pts[2], pts[0]));
	const exi = ear.math.scale2(ex, i);
	const p2p0exi = ear.math.subtract2(ear.math.subtract2(pts[2], pts[0]), exi);
	const ey = ear.math.scale2(p2p0exi, (1 / ear.math.magnitude2(p2p0exi)));
	const d = ear.math.distance2(pts[1], pts[0]);
	const j = ear.math.dot2(ey, ear.math.subtract2(pts[2], pts[0]));
	const x = ((radii[0] ** 2) - (radii[1] ** 2) + (d ** 2)) / (2 * d);
	const y = ((radii[0] ** 2) - (radii[2] ** 2) + (i ** 2) + (j ** 2)) / (2 * j) - ((i * x) / j);
	return ear.math.add2(ear.math.add2(pts[0], ear.math.scale2(ex,x)), ear.math.scale2(ey,y));
};

export default trilateration;
