<script lang="ts">
    import ContextMenu, { main } from "@/components/ContextMenu.svelte";
    import Editor from "@/components/Editor.svelte";
    import Node from "@/components/Node.svelte";

    interface NodeDefinition {
        id: symbol;
        title: string;
        color: string;
        x: number;
        y: number;
        z: number;
    }

    const nodes: NodeDefinition[] = [];

    for (let i = 0; i < 100; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() ** 0.5 * 1000;
        const x = r * Math.cos(a);
        const y = r * Math.sin(a);

        nodes.push({
            id: Symbol(),
            title: `Node #${i}`,
            color: `hsl(${Math.random() * 360}, 40%, 60%)`,
            x: Math.round(x / 32) * 32,
            y: Math.round(y / 32) * 32,
            z: i,
        });
    }

    function front(i: number) {
        if (i >= 0 && i < nodes.length) {
            nodes[i].z = Math.max(...nodes.map((n) => n.z)) + 1;
        }
    }
</script>

<div class="app">
    <Editor>
        {#each nodes as node, i (node.id)}
            <Node
                title={node.title}
                color={node.color}
                z={node.z}
                bind:x={node.x}
                bind:y={node.y}
                on:pointerdown={() => front(i)}
            />
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
