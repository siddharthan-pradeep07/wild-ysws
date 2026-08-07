import {
    AirtableRecord,
    createRecord,
    deleteRecord,
    listRecords,
    updateRecord,
} from "@/lib/airtable";

export type ShopItem =
{
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    fulfillment: string;
    createdAt: string;
};

// Field names must match the columns in the Airtable "Shop Items" table
// (table name configurable via AIRTABLE_TABLE_NAME).
type ShopItemFields =
{
    Name: string;
    Description?: string;
    Price?: number;
    "Image URL"?: string;
    fulfill?: string;
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
    const records = await listRecords<ShopItemFields>();

    return records
        .map(recordToItem)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createShopItem(data: ShopItemInput): Promise<ShopItem>
{
    const record = await createRecord<ShopItemFields>(inputToFields(data));
    return recordToItem(record);
}

export async function updateShopItem(
    id: string,
    data: ShopItemInput
): Promise<ShopItem>
{
    const record = await updateRecord<ShopItemFields>(id, inputToFields(data));
    return recordToItem(record);
}

export async function deleteShopItem(id: string): Promise<void>
{
    await deleteRecord(id);
}
