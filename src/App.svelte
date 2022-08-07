<script lang="ts">
    import ContextMenu, { main } from "@/components/ContextMenu.svelte";
    import Editor from "@/components/Editor.svelte";
    import Node from "@/components/Node.svelte";

    let frame = 0;
    setInterval(() => {
        frame++;
    }, 16);

    const nodes: { title: string; color: string; x: number; y: number }[] = [];

    for (let i = 0; i < 100; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() ** 0.5 * 1000;
        const x = r * Math.cos(a);
        const y = r * Math.sin(a);

        const color = `hsl(${Math.random() * 360}, 40%, 60%)`;

        nodes.push({ title: `Node #${i}`, x, y, color });
    }
</script>

<div class="app">
    <Editor>
        {#each nodes as node}
            <Node {...node} />
        {/each}
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
