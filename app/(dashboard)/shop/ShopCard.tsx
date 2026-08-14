import type { ShopItem } from "@/lib/shop";
import FeatureStarButton from "./FeatureStarButton";
import CurrencyIcon from "@/components/CurrencyIcon";

export default function ShopCard({
    item,
    isFeatured,
    canFeatureMore,
}: {
    item: ShopItem;
    isFeatured: boolean;
    canFeatureMore: boolean;
})
{
    return (
        <div className="shop-card">
            <div className="shop-card-header">
                <h2 className="shop-card-name">{item.name}</h2>
                <span className="shop-card-price">
                    {item.price} <CurrencyIcon />
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

            <div className="shop-card-actions">
                <a href={`/shop/${item.id}`} className="btn-secondary">
                    Buy for {item.price} {item.price === 1 ? "bark" : "barks"}
                </a>
                <FeatureStarButton
                    itemId={item.id}
                    isFeatured={isFeatured}
                    canFeatureMore={canFeatureMore}
                />
            </div>
        </div>
    );
}
