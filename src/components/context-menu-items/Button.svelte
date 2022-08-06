<script lang="ts">
    import type ContextMenu from "@/components/ContextMenu.svelte";

    export let label: string;
    export let action: () => void = () => {};
    export let parent: ContextMenu;

    function click(e: MouseEvent) {
        if (e.button === 0) {
            parent.close();
            action();
        }
    }
</script>

<div class="button" on:click={click}>
    {label}
</div>

<style lang="scss">
    .button:hover {
        background-color: #f0f0f0;
    }
</style>
