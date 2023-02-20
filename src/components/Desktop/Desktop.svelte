<script lang="ts">
	import CreasePattern from "./CreasePattern/CreasePattern.svelte";
	import FoldedForm from "./FoldedForm/FoldedForm.svelte";
	import Simulator from "./Simulator/Simulator.svelte";
	// "crease pattern", "simulator", "folded form"
	export let views = [];
</script>

<div class={`grid-${views.length}`}>
	{#if views.includes("crease pattern")}
		<CreasePattern />
	{/if}
	{#if views.includes("folded form")}
		<FoldedForm />
	{/if}
	{#if views.includes("simulator")}
		<Simulator />
	{/if}
</div>

<style>
	:global(.light-mode) {
		--desktop-bg-color: #eee;
	}
	:global(.dark-mode) {
		--desktop-bg-color: var(--darkmode-black);
	}
	div {
		display: flex;
		flex-direction: row;
		height: 100%;
		background-color: var(--desktop-bg-color);
	}
	.grid-0 > :global(*) { flex: 0 1 auto; }
	.grid-1 > :global(*) { flex: 0 1 100%; }
	.grid-2 > :global(*) { flex: 0 1 50%; }
	.grid-3 > :global(*) { flex: 0 1 33%; }
</style>
