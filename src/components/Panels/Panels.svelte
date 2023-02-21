<script lang="ts">
	import SimulatorPanel from "./SimulatorPanel.svelte";
</script>

<div>
	<SimulatorPanel />
</div>

<style>
	:global(.light-mode) {
		--panels-bg-color: #158;
	}
	:global(.dark-mode) {
		--panels-bg-color: var(--darkmode-gray-1);
	}
	div {
		height: 100%;
		background-color: var(--panels-bg-color);
	}
</style>
