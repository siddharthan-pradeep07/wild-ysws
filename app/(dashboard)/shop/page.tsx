import { listShopItems } from "@/lib/shop";

export default async function ShopPage()
{
    const items = await listShopItems();

    return (
        <div className="info-box text-left">
            <h1 className="text-2xl md:text-4xl font-bold mb-6 text-strong">
                Shop Page
            </h1>

            {items.length === 0 ? (
                <p className="text-lg text-strong">
                    No items in the shop yet — check back soon!
                </p>
            ) : (
                <div className="shop-grid">
                    {items.map((item) => (
                        <div key={item.id} className="shop-card">
                            <div className="shop-card-header">
                                <h2 className="shop-card-name">
                                    {item.name}
                                </h2>
                                <span className="shop-card-price">
                                    {item.price} barks
                                </span>
                            </div>

                            {item.imageUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="shop-card-image"
                                />
                            )}

                            {item.description && (
                                <p className="shop-card-description">
                                    {item.description}
                                </p>
                            )}
                            {item.fulfillment && (
                                <p className="shop-card-fulfillment">
                                    {item.fulfillment}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
