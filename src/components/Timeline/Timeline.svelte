<div>
</div>

<style>
	:global(.light-mode) {
		--timeline-bg-color: white;
		--timeline-border-color: #fb4;
	}
	:global(.dark-mode) {
		--timeline-bg-color: var(--darkmode-gray-2);
		--timeline-border-color: var(--darkmode-blue-dark);
	}
	div {
		width: 100%;
		height: 100%;
		background-color: var(--timeline-bg-color);
		border-top: var(--menubar-border-width) solid var(--timeline-border-color);
	}
</style>
