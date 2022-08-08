<script context="module" lang="ts">
    export interface ViewportPointerEvent extends PointerEvent {
        readonly viewportEvent: true;

        readonly target: HTMLElement;
        readonly ending: boolean;

        readonly gridScale: number;

        readonly editorX: number;
        readonly editorY: number;

        readonly viewportX: number;
        readonly viewportY: number;

        readonly deltaX: number;
        readonly deltaY: number;
    }

    export function assertViewportPointerEvent(event: any): asserts event is ViewportPointerEvent {
        if (event == null || typeof event !== "object" || !event.viewportEvent) {
            throw new TypeError("Expected event to be a ViewportMouseEvent");
        }
    }
</script>

<script lang="ts">
    import pointers, { truePointerEventPolyfill } from "@/lib/pointers";
    import svgGrid from "@/images/grid.svg";

    let element: HTMLElement;
    let clientWidth: number;
    let clientHeight: number;

    export let zoomSpeed = 0.0025;
    export let gridScale = 32;

    export let x = 0;
    export let y = 0;
    export let scale = 1;

    $: gridOffset = `${clientWidth / 2 + x * scale}px ${clientHeight / 2 + y * scale}px`;

    export function pan(deltaX: number, deltaY: number) {
        x += deltaX;
        y += deltaY;
    }

    export function zoom(delta: number, originX = 0, originY = 0) {
        const _scale = scale;
        scale = Math.exp(Math.log(scale) + delta);

        const { editorX, editorY } = clientToEditorCoordinates(originX, originY);
        x += editorX / scale - editorX / _scale;
        y += editorY / scale - editorY / _scale;
    }

    export function clientToEditorCoordinates(clientX: number, clientY: number) {
        const clientRect = element.getBoundingClientRect();
        const centerX = clientRect.left + clientRect.width / 2;
        const centerY = clientRect.top + clientRect.height / 2;

        return {
            editorX: clientX - centerX,
            editorY: clientY - centerY,
        };
    }

    export function editorToClientCoordinates(editorX: number, editorY: number) {
        const clientRect = element.getBoundingClientRect();
        const centerX = clientRect.left + clientRect.width / 2;
        const centerY = clientRect.top + clientRect.height / 2;

        return {
            clientX: editorX + centerX,
            clientY: editorY + centerY,
        };
    }

    export function editorToViewportCoordinates(editorX: number, editorY: number) {
        return {
            viewportX: editorX / scale - x,
            viewportY: editorY / scale - y,
        };
    }

    export function viewportToEditorCoordinates(viewportX: number, viewportY: number) {
        return {
            editorX: (viewportX + x) * scale,
            editorY: (viewportY + y) * scale,
        };
    }

    export function clientToViewportCoordinates(x: number, y: number) {
        const { editorX, editorY } = clientToEditorCoordinates(x, y);
        return editorToViewportCoordinates(editorX, editorY);
    }

    export function viewportToClientCoordinates(x: number, y: number) {
        const { editorX, editorY } = viewportToEditorCoordinates(x, y);
        return editorToClientCoordinates(editorX, editorY);
    }

    function pointerdown(e: PointerEvent) {
        if (e.pointerType === "mouse" && e.buttons !== 4) return;

        pointers.subscribe(e.pointerId, (e) => {
            assertViewportPointerEvent(e);

            pan(e.deltaX / pointers.count, e.deltaY / pointers.count);

            if (pointers.count > 1) {
                const { x: centerX, y: centerY } = pointers.getCenter();

                const offsetX = e.clientX - centerX;
                const offsetY = e.clientY - centerY;
                const centerDistance = Math.hypot(offsetX, offsetY);

                const normalX = offsetX / centerDistance;
                const normalY = offsetY / centerDistance;

                const delta = e.trueMovementX * normalX + e.trueMovementY * normalY;
                zoom(delta * zoomSpeed, centerX, centerY);
            }
        });
    }

    function wheel(e: WheelEvent) {
        zoom(-e.deltaY * zoomSpeed, e.clientX, e.clientY);
    }

    function capturePointerEvent(e: PointerEvent) {
        truePointerEventPolyfill(e);

        const { editorX, editorY } = clientToEditorCoordinates(e.clientX, e.clientY);
        const { viewportX, viewportY } = editorToViewportCoordinates(editorX, editorY);

        Object.defineProperties(e, {
            viewportEvent: { value: true, writable: false },
            ending: {
                get: () => e.type.endsWith("up") || e.type.endsWith("cancel"),
            },

            gridScale: { value: gridScale, writable: false },

            editorX: { value: editorX, writable: false },
            editorY: { value: editorY, writable: false },

            viewportX: { value: viewportX, writable: false },
            viewportY: { value: viewportY, writable: false },

            deltaX: { value: e.trueMovementX / scale, writable: false },
            deltaY: { value: e.trueMovementY / scale, writable: false },
        });
    }
</script>

<div
    class="editor"
    bind:this={element}
    bind:clientWidth
    bind:clientHeight
    on:pointerdown={pointerdown}
    on:wheel={wheel}
    style:--svg-grid="url({svgGrid})"
    style:--grid-offset={gridOffset}
    style:--grid-scale="{gridScale * scale}px"
>
    <div class="view" style:transform="scale({scale}) translate({x}px, {y}px)">
        <slot {scale} />
    </div>
</div>

<svelte:window
    on:pointerdown|capture={capturePointerEvent}
    on:pointermove|capture={capturePointerEvent}
    on:pointerup|capture={capturePointerEvent}
    on:pointercancel|capture={capturePointerEvent}
    on:pointerleave|capture={capturePointerEvent}
    on:pointerover|capture={capturePointerEvent}
    on:pointerout|capture={capturePointerEvent}
    on:pointerenter|capture={capturePointerEvent}
/>

<style lang="scss">
    .editor {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
        user-select: none;
        overflow: hidden;

        &::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;

            pointer-events: none;

            background-image: var(--svg-grid);
            background-position: var(--grid-offset);
            background-size: var(--grid-scale);
            background-repeat: repeat;
            background-attachment: local;
            mix-blend-mode: overlay;
        }
    }

    .view {
        display: block;
        position: relative;
        width: 0;
        height: 0;
        transform-origin: center;
        overflow: visible;
    }

    .view > :global(*) {
        position: absolute;
    }
</style>
