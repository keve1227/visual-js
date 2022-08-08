<script lang="ts">
    import { icon as _icon, type IconName, type IconLookup } from "@fortawesome/fontawesome-svg-core";
    import { faCircleNodes, faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";

    import pointers from "@/lib/pointers";
    import { assertViewportPointerEvent } from "./Editor.svelte";

    export let icon: IconName | IconLookup = faCircleNodes;
    export let title = "Untitled";
    export let color = "#46e9a6";
    export let open = true;

    export let x = 0;
    export let y = 0;
    export let z = 0;

    function toggle() {
        open = !open;
    }

    function node_pointerdown(e: PointerEvent) {
        if (e.pointerType === "touch") {
            e.stopPropagation();
        }
    }

    function title_pointerdown(e1: PointerEvent) {
        if (e1.pointerType === "mouse" && e1.buttons !== 1) return;
        assertViewportPointerEvent(e1);

        const startX = x;
        const startY = y;

        pointers.subscribe(e1.pointerId, (e2) => {
            assertViewportPointerEvent(e2);
            e2.isLocal = true;

            const deltaX = e2.viewportX - e1.viewportX;
            const deltaY = e2.viewportY - e1.viewportY;

            const movedX = startX + deltaX;
            const movedY = startY + deltaY;

            if (e2.ctrlKey) {
                // Grid snapping
                x = Math.round(movedX / e2.gridScale) * e2.gridScale;
                y = Math.round(movedY / e2.gridScale) * e2.gridScale;
            } else {
                x = movedX;
                y = movedY;
            }
        });
    }
</script>

<div
    class="node"
    style:transform="translate({x}px, {y}px)"
    style:background-color={color}
    style:z-index={z}
    on:pointerdown={node_pointerdown}
    on:contextmenu
    on:pointerdown
>
    <div class="title" on:pointerdown={title_pointerdown}>
        <span>{@html _icon(icon).html} {title}</span>

        <div class="toggle-btn" on:click|stopPropagation={toggle} on:pointerdown|stopPropagation={() => {}}>
            {@html _icon(open ? faAngleDown : faAngleUp).html}
        </div>
    </div>

    {#if open}
        <div>Contents</div>
    {/if}
</div>

<style lang="scss">
    .node {
        display: flex;
        flex-direction: column;

        border: 2px solid transparent;
        border-radius: 2.5px;

        box-shadow: 0px 2.5px 10px 0px rgba(0, 0, 0, 0.25);

        .title {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: start;
            gap: 1em;

            min-height: 1.5em;
            padding: 0.1em;
            padding-left: 0.3em;

            color: black;
            flex-wrap: nowrap;

            cursor: grab;

            &:active {
                cursor: grabbing;
            }

            span {
                flex: 1;
                white-space: nowrap;
            }

            .toggle-btn {
                padding: 0 0.3em;
                cursor: auto;

                &:not(:hover) {
                    opacity: 0.5;
                }
            }
        }

        > :last-child {
            border-radius: 1px;
            background-color: #07353b;
            color: white;
        }
    }
</style>
