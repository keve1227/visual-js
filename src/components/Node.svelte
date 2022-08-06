<script lang="ts">
    import { icon as _icon, type IconName, type IconLookup } from "@fortawesome/fontawesome-svg-core";
    import { faCircleNodes, faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";

    import { createEventDispatcher } from "svelte";
    import pointers from "@/lib/pointers";

    const emit = createEventDispatcher();

    export const id = Symbol();
    export let icon: IconName | IconLookup = faCircleNodes;
    export let title = "Untitled";
    export let color = "#46e9a6";
    export let open = true;

    export let x = 0;
    export let y = 0;
    export let scale = 1;

    function toggle() {
        open = !open;
    }

    function node_pointerdown(e: PointerEvent) {
        if (e.pointerType === "touch") {
            e.stopPropagation();

            setTimeout(async () => {
                const pointer = await pointers.get(e.pointerId);

                if (pointer) {
                    emit("contextMenu", e, { cancelable: true });
                }
            }, 500);
        }
    }

    function node_contextmenu(e: MouseEvent) {
        emit("contextMenu", e, { cancelable: true });
    }

    async function title_pointerdown(e: PointerEvent) {
        if (e.pointerType === "mouse" && e.buttons !== 1) return;

        let { clientX: _clientX, clientY: _clientY } = e;

        const pointer = await pointers.get(e.pointerId);
        pointer?.subscribe(({ clientX, clientY }) => {
            const deltaX = clientX - _clientX;
            const deltaY = clientY - _clientY;
            _clientX = clientX;
            _clientY = clientY;

            x += deltaX / scale;
            y += deltaY / scale;
        });
    }
</script>

<div
    class="node"
    style:transform="translate({x}px, {y}px)"
    style:background-color={color}
    on:pointerdown={node_pointerdown}
    on:contextmenu={node_contextmenu}
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

            span {
                flex: 1;
                white-space: nowrap;
            }

            .toggle-btn {
                padding: 0 0.3em;

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
