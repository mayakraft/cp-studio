<script>
	import stringify from "./stringify.js";
	export let data;

	const typeOfData = data ? typeof data.value : "";

	let outputObjectStringified;
	$: outputObjectStringified = data
		&& data.type === "output"
		&& typeOfData
		? stringify(data.value)
		: "";

	const formatInputValue = (value) => {
		// console.log("data type value", typeof value, value);
		switch (typeof value) {
		case "object": return stringify(value);
		// boolean, number, string, function
		default: return value;
		}
	};
</script>

<!-- whitespace is weird in this section -->
<!-- because this is embedded in a <pre> -->

{#if data && data.type === "input"}
<span class={data.type}>{formatInputValue(data.value)}</span>{/if}{#if data && data.type === "error"}
<span class={data.type}>{formatInputValue(data.value.message)}</span>{/if}{#if data && data.type === "output"}
{#if typeOfData === "boolean"}
<!-- <span class={`${data.type} ${typeOfData}`}>{data.value}</span> -->
<span class={`output boolean`}>{data.value}</span>
{:else if typeOfData === "number"}
<span class={`output number`}>{data.value}</span>
{:else if typeOfData === "string"}
<span class={`output string`}>{data.value}</span>
{:else if typeOfData === "function"}
<div class="right"><button class="function">function</button></div>
{:else if typeOfData === "object"}
{#if outputObjectStringified.length > 500}
<span class={`output object`}>{outputObjectStringified.slice(0,200)}...</span>
{:else}
<span class={`output object`}>{outputObjectStringified}</span>
{/if}
{/if}
{/if}

<style>
	span { display: inline-block; }
	span.output {
		font-weight: bold;
		color: #777;
	}
	span.error { color: #e53; }
	span.output.boolean,
	span.output.number { color: #48c; }
	button {
		margin: 0.25rem;
		padding: 0.25rem;
		background-color: #333;
		color: #999;
		border-radius: 0.25rem;
		border: 1px solid #777;
		box-shadow: 0 0 1rem 0.5rem #222;
	}
	button:hover {
		cursor: pointer;
		color: #fb4;
		border-color: #fb4;
	}
</style>
