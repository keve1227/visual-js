<script lang="ts">
    import ContextMenu, { main } from "@/components/ContextMenu.svelte";
    import Editor from "@/components/Editor.svelte";
    import Node from "@/components/Node.svelte";
</script>

<div class="app">
    <Editor>
        <Node title="Nice Shirt" />
    </Editor>

    <ContextMenu bind:contextMenu={$main} />
</div>

<style lang="scss">
    .app {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        overflow: hidden;

        background-color: #031417;
    }
</style>
