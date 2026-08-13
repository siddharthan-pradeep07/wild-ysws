"use client";

import { useState } from "react";
import type { ShopItem } from "@/lib/shop";
import { deleteShopItemAction, updateShopItemAction } from "./actions";

type ShopItemRowProps =
{
    item: ShopItem;
    isDragging?: boolean;
    onDragStart?: () => void;
    onDragOver?: (event: React.DragEvent) => void;
    onDrop?: (event: React.DragEvent) => void;
    onDragEnd?: () => void;
};

export default function ShopItemRow({
    item,
    isDragging = false,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
}: ShopItemRowProps)
{
    const [isEditing, setIsEditing] = useState(false);

    // This wraps the server action so the row can drop back into display
    // mode once the save round trips, instead of leaving the edit form
    // open indefinitely.
    async function handleUpdate(formData: FormData)
    {
        await updateShopItemAction(formData);
        setIsEditing(false);
    }

    if (isEditing)
    {
        return (
            <form action={handleUpdate} className="shop-item-edit-form">
                <input type="hidden" name="id" value={item.id} />
                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        name="name"
                        defaultValue={item.name}
                        placeholder="Name"
                        required
                        className="input-email"
                    />
                    <input
                        name="price"
                        type="number"
                        min="0"
                        step="1"
                        defaultValue={item.price}
                        placeholder="Price (barks)"
                        required
                        className="input-email"
                    />
                </div>
                <input
                    name="imageUrl"
                    defaultValue={item.imageUrl}
                    placeholder="Image URL"
                    className="input-email"
                />
                <textarea
                    name="description"
                    defaultValue={item.description}
                    placeholder="Description"
                    rows={2}
                    className="input-email"
                />
                <input
                    name="fulfillment"
                    defaultValue={item.fulfillment}
                    placeholder="Fulfillment (e.g. Ships in 2 weeks, Instant digital code)"
                    className="input-email"
                />
                <label className="admin-checkbox-label">
                    <input
                        type="checkbox"
                        name="disabled"
                        defaultChecked={item.disabled}
                        className="admin-checkbox"
                    />
                    Disable this item (hidden from the shop until unchecked)
                </label>
                <div className="shop-item-actions">
                    <button type="submit" className="btn-primary">
                        Save
                    </button>
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={() => setIsEditing(false)}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div
            className={`shop-item-card ${isDragging ? "shop-item-card-dragging" : ""} ${item.disabled ? "shop-item-card-disabled" : ""}`}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <span
                className="shop-item-drag-handle"
                draggable
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                role="button"
                tabIndex={-1}
                aria-label={`Drag to reorder ${item.name}`}
                title="Drag to reorder"
            >
                ⠿
            </span>
            {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.name} className="shop-item-thumb" />
            ) : (
                <div className="shop-item-thumb shop-item-thumb-empty" aria-hidden="true" />
            )}
            <span className="shop-item-name">
                {item.name}
                {item.disabled && <span className="shop-item-disabled-badge">disabled</span>}
            </span>
            <div className="shop-item-actions">
                <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setIsEditing(true)}
                >
                    Edit
                </button>
                <form action={deleteShopItemAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className="btn-primary">
                        Delete
                    </button>
                </form>
            </div>
        </div>
    );
}
