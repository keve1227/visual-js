import Button from "./Button.svelte";
import type { SvelteComponent } from "svelte";

const contextMenuItems = {
    get button() {
        return Button;
    },
};

type ContextMenuItems = typeof contextMenuItems;

type Difference<A, B> = { [K in Exclude<keyof A, keyof B>]: A[K] };

export type ContextMenuItemType = keyof ContextMenuItems;

type ContextMenuItem<T extends ContextMenuItemType> = InstanceType<ContextMenuItems[T]>;

export type ContextMenuItemDescription<T extends ContextMenuItemType> = {
    type: T;
} & Omit<ContextMenuItem<T>["$$prop_def"], "parent">;

export default contextMenuItems;
