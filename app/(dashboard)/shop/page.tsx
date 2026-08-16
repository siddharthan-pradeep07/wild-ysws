import { listShopItems, type ShopItem } from "@/lib/shop";
import { getSessionUser } from "@/lib/session";
import { getBarks, getFeaturedItemIds } from "@/lib/users";
import ShopCard from "./ShopCard";
import CurrencyIcon from "@/components/CurrencyIcon";

export default async function ShopPage()
{
    const user = await getSessionUser();

    const [items, featuredItemIds, barks] = await Promise.all([
        listShopItems(),
        getFeaturedItemIds(user?.email),
        getBarks(user?.email),
    ]);

    const visibleItems = items.filter((item) => !item.disabled);

    const featuredItems = featuredItemIds
        .map((id) => visibleItems.find((item) => item.id === id))
        .filter((item): item is ShopItem => Boolean(item));

    const unfeaturedItems = visibleItems.filter((item) => !featuredItemIds.includes(item.id));

    const canFeatureMore = featuredItemIds.length < 3;

    return (
        <div className="text-left">
            {/* <div className="info-box"> */}
                <h1 className="text-2xl md:text-4xl font-bold mb-6 text-strong padding-bottom-0.5">
                    Shop
                </h1>

                {user?.email && (
                    <div className="barks-balance mb-4">
                        You have {barks} <CurrencyIcon />
                    </div>
                )}

                <p className="featured-box-hint">
                    The list of the items or prices may change.
                </p>
                <p className="featured-box-hint mb-6">
                    1 approved hour = 1 bark
                </p>
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
                                barks={barks}
                            />
                        ))}
                    </div>
                </div>
            )}

            {visibleItems.length === 0 ? (
                <p className="text-lg text-strong">
                    Try reloading... (ctrl + shift + r)
                </p>
            ) : unfeaturedItems.length > 0 ? (
                <div className="shop-grid">
                    {unfeaturedItems.map((item) => (
                        <ShopCard
                            key={item.id}
                            item={item}
                            isFeatured={false}
                            canFeatureMore={canFeatureMore}
                            barks={barks}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    )
}
