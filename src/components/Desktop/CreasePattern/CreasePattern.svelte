<script lang="ts">
	import { onMount } from "svelte";
	import ear from "rabbit-ear";

	export let creasePattern = {};
	let parentRef;

	onMount(() => {
		if (parentRef) {
			while(parentRef.children.length) {
				parentRef.children[0].remove();
			}
			const group = ear.svg.origami(creasePattern, { vertices: false });
			parentRef.appendChild(group);
		}
	});
</script>

<div>
	<svg
		class="creasePattern"
		bind:this={parentRef}
		viewBox="-0.02 -0.02 1.04 1.04"
	></svg>
</div>

<style>
	:global(.light-mode) {
		--cp-view-bg-color: #eee;
	}
	:global(.dark-mode) {
		--cp-view-bg-color: var(--darkmode-black);
	}
	div {
		height: 100%;
		background-color: var(--cp-view-bg-color);
	}
	svg {
		width: 100%;
		height: 100%;
		stroke-width: 0.005;
	}
</style>