<script>
	import Simulator from "./Simulator.svelte";
	import Settings from "./Settings.svelte";

	// the origami model, in FOLD format
	let origami = JSON.parse({});
	// tool is either ["trackball", "pull"]
	let tool = "trackball";
	// turn on/off Origami Simulator's folding engine
	let active = true;
	// override the material to show the model's strain forces
	let strain = false;
	// fold the origami model, float (0.0-1.0)
	let foldAmount = 0.15;
	// highlight vertices/faces under the cursor
	let showTouches = true;
	// turn on three.js shadows
	let showShadows = false;
	// style
	let backgroundColor = "#1b1b1b";
	let frontColor = "#ec008b";
	let backColor = "white";
	let lineColor = "black";
	let lineOpacity = 0.5;
	// reset the vertices back to their starting location
	let reset = () => {};
	// settings for the simulator's solver
	let integration = "euler";
	let axialStiffness = 20;
	let faceStiffness = 0.2;
	let joinStiffness = 0.7;
	let creaseStiffness = 0.7;
	let dampingRatio = 0.45;
	// vertex displacement error relayed back from the simulator
	let error = 0;
	let exportModel;
</script>

<div class="App">
	<Settings
		bind:origami={origami}
		bind:tool={tool}
		bind:active={active}
		bind:strain={strain}
		bind:foldAmount={foldAmount}
		bind:showTouches={showTouches}
		bind:showShadows={showShadows}
		bind:backgroundColor={backgroundColor}
		bind:frontColor={frontColor}
		bind:backColor={backColor}
		bind:lineColor={lineColor}
		bind:lineOpacity={lineOpacity}
		bind:integration={integration}
		bind:axialStiffness={axialStiffness}
		bind:faceStiffness={faceStiffness}
		bind:joinStiffness={joinStiffness}
		bind:creaseStiffness={creaseStiffness}
		bind:dampingRatio={dampingRatio}
		{error}
		{reset}
		{exportModel}
	/>
	<Simulator
		{origami}
		{active}
		{foldAmount}
		{strain}
		{tool}
		{showTouches}
		{showShadows}
		{backgroundColor}
		{frontColor}
		{backColor}
		{lineColor}
		{lineOpacity}
		{integration}
		{axialStiffness}
		{faceStiffness}
		{joinStiffness}
		{creaseStiffness}
		{dampingRatio}
		bind:error={error}
		bind:reset={reset}
		bind:exportModel={exportModel}
	/>
</div>

<style>
	.App {
		height: 100%;
	}
</style>
