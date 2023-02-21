<script>
	import Panel from "./Panel.svelte";
	import {
		active,
		foldAmount,
		strain,
		showTouches,
		showShadows,
		tool,
		integration,
		axialStiffness,
		faceStiffness,
		joinStiffness,
		creaseStiffness,
		dampingRatio,
		error,
		reset,
	} from "../../stores/Simulator.js";

	let isCollapsed = false;

</script>

<Panel
	title="simulator"
	bind:isCollapsed={isCollapsed}>
	<div class="PanelSimulator">
		<div class="flex-row">
			<input
				type="checkbox"
				class="high-energy"
				id="checkbox-simulator-on"
				bind:checked={$active}
			/><label for="checkbox-simulator-on">on</label>
			<input
				type="range"
				min="0.0"
				max="1.0"
				bind:value={$foldAmount}
				step="0.001"
				disabled={!$active}
			/>
		</div>

		<div>
			<input
				type="checkbox"
				id="checkbox-simulator-strain"
				bind:checked={$strain}
			/><label for="checkbox-simulator-strain">strain</label>
		</div>

		<div>
			<input
				type="checkbox"
				id="checkbox-simulator-highlight"
				bind:checked={$showTouches}
			/><label for="checkbox-simulator-highlight">show touches</label>
		</div>

		<div>
			<input
				type="checkbox"
				id="checkbox-simulator-shadows"
				bind:checked={$showShadows}
			/><label for="checkbox-simulator-shadows">shadows</label>
		</div>

		<div>
			<input
				type="text"
				bind:value={$dampingRatio}>
				<label>damping ratio</label>
		</div>

		<div>
			<input
				type="text"
				bind:value={$axialStiffness}>
				<label>axial stiffness</label>
		</div>

		<div>
			<input
				type="text"
				bind:value={$faceStiffness}>
				<label>face stiffness</label>
		</div>

		<div>
			<input
				type="text"
				bind:value={$creaseStiffness}>
				<label>crease stiffness</label>
		</div>

		<div>
			<input
				type="text"
				bind:value={$joinStiffness}>
				<label>join stiffness</label>
		</div>

		<div>
			<input
				type="text"
				bind:value={$error}>
				<label>error</label>
		</div>

		<div>
			<button on:click={$reset}>reset</button>
		</div>

	</div>
</Panel>
