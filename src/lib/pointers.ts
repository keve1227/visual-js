import { writable, type Writable } from "svelte/store";

const pointers = new Map<number | undefined, PointerEvent>();
const pointerStores = new Map<number | undefined, Writable<PointerEvent>>();

function set(event: PointerEvent) {
    pointers.set(event.pointerId, event);

    if (pointerStores.has(event.pointerId)) {
        pointerStores.get(event.pointerId)!.set(event);
    } else {
        pointerStores.set(event.pointerId, writable(event));
    }
}

function unset(event: PointerEvent) {
    pointerStores.delete(event.pointerId);
    pointers.delete(event.pointerId);
}

export default {
    get count() {
        return pointers.size;
    },
    get center() {
        let x = 0;
        let y = 0;

        for (const pointer of pointers.values()) {
            const { clientX, clientY } = pointer;
            x += clientX;
            y += clientY;
        }

        return {
            centerX: x / pointers.size,
            centerY: y / pointers.size,
        };
    },
    get(id: number): Promise<Writable<PointerEvent> | undefined> {
        return new Promise((resolve) => requestAnimationFrame(() => resolve(pointerStores.get(id))));
    },
};

document.addEventListener("pointerdown", (event) => set(event), { capture: true });
document.addEventListener("pointermove", (event) => set(event));
document.addEventListener("pointerup", (event) => unset(event));
