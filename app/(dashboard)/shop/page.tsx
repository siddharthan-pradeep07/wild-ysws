import { listShopItems } from "@/lib/shop";

export default async function ShopPage()
{
    const items = await listShopItems();

    return (
        <div className="info-box text-left">
            <h1 className="text-2xl md:text-4xl font-bold mb-6 text-[#132A36]">
                Shop Page
            </h1>

            {items.length === 0 ? (
                <p className="text-lg text-[#132A36]">
                    No items in the shop yet — check back soon!
                </p>
            ) : (
                <div className="shop-grid">
                    {items.map((item) => (
                        <div key={item.id} className="shop-card">
                            {item.imageUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="shop-card-image"
                                />
                            )}
                            <h2 className="text-lg font-bold text-[#132A36]">
                                {item.name}
                            </h2>
                            {item.description && (
                                <p className="text-sm text-[#132A36]">
                                    {item.description}
                                </p>
                            )}
                            <span className="shop-card-price">
                                ${item.price.toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
