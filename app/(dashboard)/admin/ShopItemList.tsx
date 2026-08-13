"use client";

import { useState, useTransition } from "react";
import type { ShopItem } from "@/lib/shop";
import ShopItemRow from "./ShopItemRow";
import { reorderShopItemsAction } from "./actions";

export default function ShopItemList({ items }: { items: ShopItem[] })
{
    const [orderedItems, setOrderedItems] = useState(items);
    const [prevItems, setPrevItems] = useState(items);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [, startTransition] = useTransition();

    // This re-syncs whenever the server sends fresh data, whether that's
    // adding, editing or deleting an item, another admin reordering, or
    // our own reorder round tripping back. Without it, this component's
    // local state would keep showing stale items after those actions
    // revalidate the page. The state gets adjusted directly during
    // render, which is React's documented pattern for this, rather than
    // in an effect, which would cost an extra render pass.
    if (items !== prevItems)
    {
        setPrevItems(items);
        setOrderedItems(items);
    }

    function moveDraggedOver(overId: string)
    {
        if (!draggedId || draggedId === overId)
        {
            return;
        }

        setOrderedItems((current) =>
        {
            const from = current.findIndex((item) => item.id === draggedId);
            const to = current.findIndex((item) => item.id === overId);

            if (from === -1 || to === -1)
            {
                return current;
            }

            const next = [...current];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
        });
    }

    function handleDragEnd()
    {
        setDraggedId(null);

        const formData = new FormData();
        formData.set("ids", JSON.stringify(orderedItems.map((item) => item.id)));

        startTransition(() =>
        {
            reorderShopItemsAction(formData);
        });
    }

    return (
        <div className="flex flex-col gap-4">
            {orderedItems.map((item) => (
                <ShopItemRow
                    key={item.id}
                    item={item}
                    isDragging={draggedId === item.id}
                    onDragStart={() => setDraggedId(item.id)}
                    onDragOver={(event) =>
                    {
                        event.preventDefault();
                        moveDraggedOver(item.id);
                    }}
                    onDrop={(event) => event.preventDefault()}
                    onDragEnd={handleDragEnd}
                />
            ))}
        </div>
    );
}
