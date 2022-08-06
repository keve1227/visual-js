<script context="module" lang="ts">
    import { writable, type Writable } from "svelte/store";
    import contextMenuItems, {
        type ContextMenuItemDescription,
        type ContextMenuItemType,
    } from "@/components/context-menu-items";

    type ContextMenuDescription = {
        items: ContextMenuItemDescription<ContextMenuItemType>[];
        x: number;
        y: number;
    };

    export const main: Writable<ContextMenuDescription | null> = writable(null);

    export function open(options: ContextMenuDescription) {
        main.set(options);
    }

    export function close() {
        main.set(null);
    }
</script>

<script lang="ts">
    export let contextMenu: ContextMenuDescription | null;
    $: contextMenu && cancelClose();

    const self = arguments[0];
    let closing: number | null = null;

    export function close() {
        contextMenu = null;
    }

    function scheduleClose(ms?: number) {
        if (!self) return;

        if (!closing) {
            closing = setTimeout(close as TimerHandler, ms);
        }
    }

    function cancelClose() {
        if (!self) return;

        if (closing) {
            clearTimeout(closing);
            closing = null;
        }
    }
</script>

<svelte:window on:pointermove={() => scheduleClose(200)} on:pointerdown={close} />

{#if contextMenu}
    <div
        class="context-menu"
        on:pointermove|stopPropagation={cancelClose}
        on:pointerdown|stopPropagation
        on:contextmenu|preventDefault
        style:left="{contextMenu.x - 10}px"
        style:top="{contextMenu.y - 10}px"
    >
        <ol>
            {#each contextMenu.items as { type, ...item }}
                <li>
                    <svelte:component this={contextMenuItems[type]} {...item} parent={self} />
                </li>
            {/each}
        </ol>
    </div>
{/if}

<style lang="scss">
    .context-menu {
        position: absolute;
        user-select: none;
        z-index: 1;

        > ol {
            display: flex;
            flex-direction: column;
            justify-content: start;
            align-items: stretch;

            list-style: none;

            min-width: 5em;
            margin: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;

            background-color: #fff;
            box-shadow: 0px 2.5px 10px 0px rgba(0, 0, 0, 0.25);

            > li {
                border-bottom: 1px solid #ccc;

                &:last-child {
                    border-bottom: none;
                }

                > :global(*) {
                    padding: 0.4em 0.6em;
                }
            }
        }
    }
</style>
