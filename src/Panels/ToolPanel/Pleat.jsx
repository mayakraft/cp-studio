const pleatDirections = [
	"mountain-valley",
	"valley-mountain",
	"flat"
];

const Pleat = (props) => (<>
	<hr />
	<p><b>pleat count</b>: <input
		type="text"
		value={props.pleatCount()}
		oninput={(e) => props.setPleatCount(parseInt(e.target.value))}
	/></p>
	{/*<For each={pleatDirections}>{str =>
		<div>
			<input
				type="checkbox"
				class="radio"
				id={`checkbox-label-${str}`}
				checked={props.pleatToolDirection() === str}
				onchange={() => props.setPleatToolDirection(str)}
			/><label for={`checkbox-label-${str}`}>{str}</label>
		</div>
	}</For>*/}
</>);

export default Pleat;
