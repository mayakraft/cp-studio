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
				id="text-input-damping-ratio"
				bind:value={$dampingRatio}>
				<label for="text-input-damping-ratio">damping ratio</label>
		</div>

		<div>
			<input
				type="text"
				id="text-input-axial-stiffness"
				bind:value={$axialStiffness}>
				<label for="text-input-axial-stiffness">axial stiffness</label>
		</div>

		<div>
			<input
				type="text"
				id="text-input-face-stiffness"
				bind:value={$faceStiffness}>
				<label for="text-input-face-stiffness">face stiffness</label>
		</div>

		<div>
			<input
				type="text"
				id="text-input-crease-stiffness"
				bind:value={$creaseStiffness}>
				<label for="text-input-crease-stiffness">crease stiffness</label>
		</div>

		<div>
			<input
				type="text"
				id="text-input-join-stiffness"
				bind:value={$joinStiffness}>
				<label for="text-input-join-stiffness">join stiffness</label>
		</div>

		<div>
			<input
				type="text"
				id="simulator-error-text"
				bind:value={$error}>
				<label for="simulator-error-text">error</label>
		</div>

		<div>
			<button on:click={$reset}>reset</button>
		</div>

	</div>
</Panel>
