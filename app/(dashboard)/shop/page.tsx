import { listShopItems, type ShopItem } from "@/lib/shop";
import { getSessionUser } from "@/lib/session";
import { getFeaturedItemIds } from "@/lib/users";
import ShopCard from "./ShopCard";

export default async function ShopPage()
{
    const user = await getSessionUser();

    const [items, featuredItemIds] = await Promise.all([
        listShopItems(),
        getFeaturedItemIds(user?.email),
    ]);

    const featuredItems = featuredItemIds
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is ShopItem => Boolean(item));

    const unfeaturedItems = items.filter((item) => !featuredItemIds.includes(item.id));

    const canFeatureMore = featuredItemIds.length < 3;

    return (
        <div className="text-left">
            {/* <div className="info-box"> */}
                <h1 className="text-2xl md:text-4xl font-bold mb-6 text-strong padding-bottom-0.5">
                    Shop
                </h1>
            {/* </div> */}

            {featuredItems.length > 0 && (
                <div className="featured-box">
                    <div className="featured-box-header">
                        <h2 className="text-xl md:text-2xl font-bold text-strong">
                            Featured
                        </h2>
                        <p className="featured-box-hint">
                            you can feature up to 3 items
                        </p>
                    </div>
                    <div className="featured-box-row">
                        {featuredItems.map((item) => (
                            <ShopCard
                                key={item.id}
                                item={item}
                                isFeatured
                                canFeatureMore={canFeatureMore}
                            />
                        ))}
                    </div>
                </div>
            )}

            {items.length === 0 ? (
                <p className="text-lg text-strong">
                    No items in the shop yet — check back soon!
                </p>
            ) : unfeaturedItems.length > 0 ? (
                <div className="shop-grid">
                    {unfeaturedItems.map((item) => (
                        <ShopCard
                            key={item.id}
                            item={item}
                            isFeatured={false}
                            canFeatureMore={canFeatureMore}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    )
}
