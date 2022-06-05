import {
	stringifyPoint,
	mostRecentTouch,
} from "../../Helpers";

const polygonNames = {
	0: "no face",
	1: "point",
	2: "degenerate",
	3: "triangle",
	4: "quadrilateral",
	5: "pentagon",
	6: "hexagon",
	7: "septagon",
	8: "octagon",
	9: "nonagon",
	10: "decagon",
};

const assignmentNames = {
	M: "mountain",  m: "mountain",
	V: "valley",    v: "valley",
	F: "flat",      f: "flat",
	B: "boundary",  b: "boundary",
};

const creaseOrEdge = (assign) => assign === "B" || assign === "b"
	? "edge" : "crease";

const HoverPointer = (props) => (<>
	<Show when={props.pointer}>
		<p><b>({stringifyPoint(props.pointer, 3, ", ")})</b></p>
	</Show>
</>);

const VEF = (props) => (<>
	<Show when={props.pointer && props.pointer.nearest}>
		<hr />
		<Show when={props.pointer.nearest.vertex_coords}>
			<p><b>({stringifyPoint(props.pointer.nearest.vertex_coords, 4, ", ")})</b></p>
		</Show>
		<Show when={props.pointer.nearest.edge_assignment}>
			<p><b>{assignmentNames[props.pointer.nearest.edge_assignment]}</b> {creaseOrEdge(props.pointer.nearest.edge_assignment)}</p>
		</Show>
		<Show when={props.pointer.nearest.face_coords && props.pointer.nearest.face_coords.length}>
			<p><b>{polygonNames[props.pointer.nearest.face_coords.length]}</b> face</p>
		</Show>
		<hr />
		<p>vertex <b>{props.pointer.nearest.vertex}</b></p>
		<p>edge <b>{props.pointer.nearest.edge}</b></p>
		<p>face <b>{props.pointer.nearest.face}</b></p>
	</Show>
</>);

// edge, edge_coords, edge_assignment, face, face_coords, vertex, vertex_coords
const Inspect = (props) => {
	return (<>
		<HoverPointer pointer={mostRecentTouch([props.cpPointer(), props.diagramPointer()])} />
		<VEF pointer={mostRecentTouch([props.cpPointer(), props.diagramPointer()])} />
	</>);
};

export default Inspect;
