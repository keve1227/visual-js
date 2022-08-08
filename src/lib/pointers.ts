import { writable, type Writable } from "svelte/store";

type Subscriber<T> = (value: T) => void;
type Invalidator<T> = (value?: T) => void;

export interface TruePointerEvent extends PointerEvent {
    readonly trueMovementX: number;
    readonly trueMovementY: number;
    isLocal: boolean;
}

export function truePointerEventPolyfill(event: PointerEvent): asserts event is TruePointerEvent {
    const lastEvent = pointers.get(event.pointerId);

    let trueMovementX = 0;
    let trueMovementY = 0;

    if (lastEvent) {
        trueMovementX = event.screenX - lastEvent.screenX;
        trueMovementY = event.screenY - lastEvent.screenY;
    }

    Object.defineProperties(event, {
        trueMovementX: { value: trueMovementX, writable: false },
        trueMovementY: { value: trueMovementY, writable: false },
        isLocal: { value: false, writable: true },
    });
}

const values = new Map<number, TruePointerEvent>();
const stores = new Map<number, Writable<TruePointerEvent>>();

function add(event: PointerEvent) {
    truePointerEventPolyfill(event);

    values.set(event.pointerId, event);
    stores.set(event.pointerId, writable(event));
}

function set(event: PointerEvent) {
    truePointerEventPolyfill(event);

    if (stores.has(event.pointerId)) {
        const lastEvent = values.get(event.pointerId)!;
        event.isLocal = lastEvent.isLocal;

        values.set(event.pointerId, event);
        stores.get(event.pointerId)!.set(event);
    } else {
        add(event);
    }
}

function remove(event: PointerEvent) {
    set(event);

    requestAnimationFrame(() => {
        values.delete(event.pointerId);
        stores.delete(event.pointerId);
    });
}

const pointers = {
    get values() {
        return [...values.values()].filter((e) => !e.isLocal);
    },
    get count() {
        return pointers.values.length;
    },
    get(id: number): TruePointerEvent | undefined {
        return values.get(id);
    },
    subscribe(id: number, run: Subscriber<TruePointerEvent>, invalidate?: Invalidator<TruePointerEvent>) {
        return stores.get(id)?.subscribe(run, invalidate) ?? (() => {});
    },
    getCenter() {
        let x = 0;
        let y = 0;

        for (const event of pointers.values) {
            x += event.clientX;
            y += event.clientY;
        }

        return {
            x: x / values.size,
            y: y / values.size,
        };
    },
};

export default pointers;

// PointerEvent handlers
document.addEventListener("pointerdown", (event) => set(event), { capture: true });
document.addEventListener("pointermove", (event) => set(event), { capture: true });
document.addEventListener("pointerup", (event) => remove(event), { capture: true });
document.addEventListener("pointercancel", (event) => remove(event), { capture: true });
