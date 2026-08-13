import {
    AirtableRecord,
    createRecord,
    deleteRecord,
    listRecords,
    updateRecord,
} from "@/lib/airtable";

const TABLE = process.env.AIRTABLE_TABLE_NAME ?? "Shop Items";

export type ShopItem =
{
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    fulfillment: string;
    order: number;
    createdAt: string;
};

// Field names here must match the columns in the Airtable shop items
// table, whose name is configurable via AIRTABLE_TABLE_NAME. Order is a
// plain Number field, with lower values sorting first, and the admin drag
// handle is what rewrites it.
type ShopItemFields =
{
    Name: string;
    Description?: string;
    Price?: number;
    "Image URL"?: string;
    fulfill?: string;
    Order?: number;
};

function recordToItem(record: AirtableRecord<ShopItemFields>): ShopItem
{
    return {
        id: record.id,
        name: record.fields.Name ?? "",
        description: record.fields.Description ?? "",
        price: record.fields.Price ?? 0,
        imageUrl: record.fields["Image URL"] ?? "",
        fulfillment: record.fields.fulfill ?? "",
        order: record.fields.Order ?? 0,
        createdAt: record.createdTime,
    };
}

export type ShopItemInput =
{
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    fulfillment: string;
};

function inputToFields(data: ShopItemInput): ShopItemFields
{
    return {
        Name: data.name,
        Description: data.description,
        Price: data.price,
        "Image URL": data.imageUrl,
        fulfill: data.fulfillment,
    };
}

export async function listShopItems(): Promise<ShopItem[]>
{
    const records = await listRecords<ShopItemFields>(TABLE);

    return records
        .map(recordToItem)
        // Items that predate the Order field, or share the same value, fall
        // back to creation order instead of ending up in an arbitrary jumble.
        .sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
}

export async function createShopItem(data: ShopItemInput): Promise<ShopItem>
{
    const existing = await listShopItems();
    const nextOrder = existing.length
        ? Math.max(...existing.map((item) => item.order)) + 1
        : 0;

    const record = await createRecord<ShopItemFields>(TABLE, {
        ...inputToFields(data),
        Order: nextOrder,
    });

    return recordToItem(record);
}

export async function updateShopItem(
    id: string,
    data: ShopItemInput
): Promise<ShopItem>
{
    const record = await updateRecord<ShopItemFields>(TABLE, id, inputToFields(data));
    return recordToItem(record);
}

export async function deleteShopItem(id: string): Promise<void>
{
    await deleteRecord(TABLE, id);
}

// Persists a drag and drop reorder. Each item's new Order value is just
// its index in the given array, and this fires one PATCH per item in
// parallel, which is fine at the scale of a shop's item list.
export async function reorderShopItems(orderedIds: string[]): Promise<void>
{
    await Promise.all(
        orderedIds.map((id, index) =>
            updateRecord<ShopItemFields>(TABLE, id, { Order: index })
        )
    );
}
