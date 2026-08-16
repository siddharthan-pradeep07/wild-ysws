import type { ShopItem } from "@/lib/shop";
import FeatureStarButton from "./FeatureStarButton";
import CurrencyIcon from "@/components/CurrencyIcon";

export default function ShopCard({
    item,
    isFeatured,
    canFeatureMore,
    barks,
}: {
    item: ShopItem;
    isFeatured: boolean;
    canFeatureMore: boolean;
    barks: number;
})
{
    const canAfford = barks >= item.price;

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
                {canAfford ? (
                    <a href={`/shop/${item.id}`} className="btn-secondary">
                        Buy for {item.price} {item.price === 1 ? "bark" : "barks"}
                    </a>
                ) : (
                    <span
                        className="btn-secondary btn-secondary-disabled"
                        aria-disabled="true"
                        title="Not enough barks"
                    >
                        Buy for {item.price} {item.price === 1 ? "bark" : "barks"}
                    </span>
                )}
                <FeatureStarButton
                    itemId={item.id}
                    isFeatured={isFeatured}
                    canFeatureMore={canFeatureMore}
                />
            </div>
        </div>
    );
}
