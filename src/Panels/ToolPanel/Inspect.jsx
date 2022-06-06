import ear from "rabbit-ear";
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

// const VEF = (props) => (<>
// 	<Show when={props.pointer && props.pointer.nearest}>
// 		{console.log(props.cpParams())}
// 		<hr />
// 		<Show when={props.pointer.nearest.edge_assignment}>
// 			<p><b>{assignmentNames[props.pointer.nearest.edge_assignment]}</b> {creaseOrEdge(props.pointer.nearest.edge_assignment)} (<b>{props.pointer.nearest.edge}</b>/{ear.graph.count.edges(props.cp())})</p>
// 		</Show>
// 		<Show when={props.pointer.nearest.face_coords && props.pointer.nearest.face_coords.length}>
// 			<p><b>{polygonNames[props.pointer.nearest.face_coords.length]}</b> face (<b>{props.pointer.nearest.face}</b>/{ear.graph.count.faces(props.cp())})</p>
// 		</Show>
// 		<Show when={props.pointer.nearest.vertex_coords}>
// 			<p>vertex (<b>{props.pointer.nearest.vertex}</b>/{ear.graph.count.vertices(props.cp())})</p>
// 			<ul>
// 				<li>x: <b>{props.pointer.nearest.vertex_coords[0]}</b></li>
// 				<li>y: <b>{props.pointer.nearest.vertex_coords[1]}</b></li>
// 			</ul>
// 			{/*<p><b>({stringifyPoint(props.pointer.nearest.vertex_coords, 4, ", ")})</b></p>*/}
// 		</Show>
// 	</Show>
// </>);

const VEF = (props) => (<>
	<Show when={props.params && props.params[0]}>
		<hr />
		<Show when={props.params[0].edge_assignment}>
			<p><b>{assignmentNames[props.params[0].edge_assignment]}</b> {creaseOrEdge(props.params[0].edge_assignment)} (<b>{props.params[0].edge}</b>/{ear.graph.count.edges(props.cp())})</p>
		</Show>
		<Show when={props.params[0].face_coords && props.params[0].face_coords.length}>
			<p><b>{polygonNames[props.params[0].face_coords.length]}</b> face (<b>{props.params[0].face}</b>/{ear.graph.count.faces(props.cp())})</p>
		</Show>
		<Show when={props.params[0].vertex_coords}>
			<p>vertex (<b>{props.params[0].vertex}</b>/{ear.graph.count.vertices(props.cp())})</p>
			<div class="flex-row">
				<p>x:&nbsp;</p><input type="text" placeholder="x" value={props.params[0].vertex_coords[0]} />
			</div>
			<div class="flex-row">
				<p>y:&nbsp;</p><input type="text" placeholder="y" value={props.params[0].vertex_coords[1]} />
			</div>
			{/*<ul>
				<li>x: <b>{props.params[0].vertex_coords[0]}</b></li>
				<li>y: <b>{props.params[0].vertex_coords[1]}</b></li>
			</ul>*/}
			{/*<p><b>({stringifyPoint(props.pointer.nearest.vertex_coords, 4, ", ")})</b></p>*/}
		</Show>
	</Show>
</>);

// edge, edge_coords, edge_assignment, face, face_coords, vertex, vertex_coords
const Inspect = (props) => {
	return (<>
		<HoverPointer
			pointer={mostRecentTouch([props.cpPointer(), props.diagramPointer()])}
		/>
		<VEF
			cp={props.cp}
			params={[props.cpParams(), props.diagramParams()].filter(el => el && el.length).shift()}
		/>
	</>);
};

export default Inspect;
