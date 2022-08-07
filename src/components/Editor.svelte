<script context="module" lang="ts">
    export type ViewportMouseEvent =
        | { viewportEvent?: false }
        | {
              viewportEvent: true;
              editorX: number;
              editorY: number;
              viewportX: number;
              viewportY: number;
          };
</script>

<script lang="ts">
    import pointers from "@/lib/pointers";

    let element: HTMLElement;

    export let zoomSpeed = 0.0025;

    export let x = 0;
    export let y = 0;
    export let scale = 1;

    export function pan(deltaX: number, deltaY: number) {
        x += deltaX / scale;
        y += deltaY / scale;
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
            viewportX: editorX / scale + x,
            viewportY: editorY / scale + y,
        };
    }

    export function viewportToEditorCoordinates(viewportX: number, viewportY: number) {
        return {
            editorX: (viewportX - x) * scale,
            editorY: (viewportY - y) * scale,
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

    async function pointerdown(e: PointerEvent) {
        if (e.pointerType === "mouse" && e.buttons !== 4) return;

        let { clientX: _clientX, clientY: _clientY } = e;

        const pointer = await pointers.get(e.pointerId);
        pointer?.subscribe(({ clientX, clientY }) => {
            const deltaX = clientX - _clientX;
            const deltaY = clientY - _clientY;
            _clientX = clientX;
            _clientY = clientY;

            pan(deltaX / pointers.count, deltaY / pointers.count);

            if (pointers.count > 1) {
                const { centerX, centerY } = pointers.center;

                const offsetX = clientX - centerX;
                const offsetY = clientY - centerY;

                const centerDistance = Math.hypot(offsetX, offsetY);

                const normalX = offsetX / centerDistance;
                const normalY = offsetY / centerDistance;

                const delta = deltaX * normalX + deltaY * normalY;
                zoom(delta * zoomSpeed, centerX, centerY);
            }
        });
    }

    function wheel(e: WheelEvent) {
        zoom(-e.deltaY * zoomSpeed, e.clientX, e.clientY);
    }

    function pointerEvent(e: PointerEvent & ViewportMouseEvent) {
        const { editorX, editorY } = clientToEditorCoordinates(e.clientX, e.clientY);
        const { viewportX, viewportY } = editorToViewportCoordinates(editorX, editorY);

        Object.defineProperties(e, {
            viewportEvent: { value: true },
            editorX: { value: editorX },
            editorY: { value: editorY },
            viewportX: { value: viewportX },
            viewportY: { value: viewportY },
        });
    }
</script>

<div
    bind:this={element}
    class="editor"
    on:pointerdown={pointerdown}
    on:pointerdown|capture={pointerEvent}
    on:pointermove|capture={pointerEvent}
    on:pointerup|capture={pointerEvent}
    on:wheel={wheel}
>
    <div class="view" style:transform="scale({scale}) translate({x}px, {y}px)">
        <slot {scale} />
    </div>
</div>

<style lang="scss">
    .editor {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
        user-select: none;
        overflow: hidden;
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
