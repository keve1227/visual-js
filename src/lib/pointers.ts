import { writable, type Writable } from "svelte/store";

type Pointer = PointerEvent;

const pointers = new Map<number | undefined, Pointer>();
const pointerStores = new Map<number | undefined, Writable<Pointer>>();

function set(pointer: Pointer) {
    pointers.set(pointer.pointerId, pointer);

    if (pointerStores.has(pointer.pointerId)) {
        pointerStores.get(pointer.pointerId)!.set(pointer);
    } else {
        pointerStores.set(pointer.pointerId, writable(pointer));
    }
}

function unset(pointer: Pointer) {
    pointerStores.delete(pointer.pointerId);
    pointers.delete(pointer.pointerId);
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
    get(id: number): Promise<Writable<Pointer> | undefined> {
        return new Promise((resolve) => requestAnimationFrame(() => resolve(pointerStores.get(id))));
    },
};

document.addEventListener("pointerdown", (e) => set(e), { capture: true });
document.addEventListener("pointermove", (e) => set(e));
document.addEventListener("pointerup", (e) => unset(e));
