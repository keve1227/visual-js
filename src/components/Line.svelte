<script lang="ts">
    export let x1: number, y1: number;
    export let x2: number, y2: number;

    export let color = "black";
    export let thickness = 1;

    $: left = Math.min(x1, x2);
    $: right = Math.max(x1, x2);
    $: top = Math.min(y1, y2);
    $: bottom = Math.max(y1, y2);

    $: width = right - left;
    $: height = bottom - top;
</script>

<svg {width} {height} viewBox="{left} {top} {width} {height}" style:left="{x1}px" style:top="{y1}px">
    <line {x1} {y1} {x2} {y2} stroke={color} stroke-width={thickness} />
</svg>

<style>
    svg {
        position: absolute;
        overflow: visible;
        pointer-events: none;
    }
</style>
