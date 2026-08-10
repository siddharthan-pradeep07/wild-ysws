"use client";

import { useTransition } from "react";
import { toggleFeaturedItemAction } from "./actions";

function StarOutlineIcon()
{
    return (
        <svg viewBox="0 0 32 32" width="22" height="22" fill="currentColor" aria-hidden="true">
            <path d="M16 8.51912L14.6158 11.3239C14.1059 12.3569 13.1205 13.0729 11.9805 13.2385L8.88523 13.6883L11.125 15.8715C11.9499 16.6756 12.3263 17.8341 12.1316 18.9695L11.6028 22.0522L14.3713 20.5967C15.3909 20.0607 16.609 20.0607 17.6287 20.5967L20.3971 22.0522L19.8684 18.9695C19.6737 17.8341 20.0501 16.6756 20.875 15.8715L23.1147 13.6883L20.0195 13.2385C18.8795 13.0729 17.894 12.3569 17.3842 11.3239L16 8.51912ZM17.3451 6.72549C16.7949 5.61063 15.2051 5.61063 14.6549 6.7255L12.8223 10.4387C12.6038 10.8815 12.1814 11.1883 11.6929 11.2593L7.59505 11.8548C6.36472 12.0335 5.87346 13.5455 6.76373 14.4133L9.72894 17.3037C10.0825 17.6483 10.2438 18.1448 10.1603 18.6314L9.46035 22.7126C9.25018 23.938 10.5363 24.8724 11.6368 24.2939L15.302 22.367C15.739 22.1372 16.261 22.1372 16.698 22.367L20.3632 24.2939C21.4636 24.8724 22.7498 23.938 22.5396 22.7126L21.8396 18.6314C21.7562 18.1448 21.9175 17.6483 22.271 17.3037L25.2362 14.4133C26.1265 13.5455 25.6352 12.0335 24.4049 11.8548L20.3071 11.2593C19.8185 11.1883 19.3962 10.8815 19.1777 10.4387L17.3451 6.72549Z" />
        </svg>
    );
}

function StarFillIcon()
{
    return (
        <svg viewBox="0 0 32 32" width="22" height="22" fill="currentColor" aria-hidden="true">
            <path d="M14.6549 6.72548C15.2051 5.61061 16.7949 5.61061 17.3451 6.72548L19.1777 10.4387C19.3962 10.8814 19.8185 11.1883 20.3071 11.2593L24.4049 11.8547C25.6353 12.0335 26.1265 13.5455 25.2363 14.4133L22.271 17.3037C21.9175 17.6483 21.7562 18.1448 21.8396 18.6313L22.5396 22.7126C22.7498 23.938 21.4637 24.8724 20.3632 24.2939L16.698 22.367C16.261 22.1372 15.739 22.1372 15.302 22.367L11.6368 24.2939C10.5363 24.8724 9.2502 23.938 9.46036 22.7126L10.1604 18.6314C10.2438 18.1448 10.0825 17.6483 9.72896 17.3037L6.76375 14.4133C5.87347 13.5455 6.36474 12.0335 7.59507 11.8547L11.6929 11.2593C12.1815 11.1883 12.6038 10.8814 12.8223 10.4387L14.6549 6.72548Z" />
        </svg>
    );
}

export default function FeatureStarButton({
    itemId,
    isFeatured,
    canFeatureMore,
}: {
    itemId: string;
    isFeatured: boolean;
    canFeatureMore: boolean;
})
{
    const [isPending, startTransition] = useTransition();

    function handleClick()
    {
        const formData = new FormData();
        formData.set("itemId", itemId);

        startTransition(() =>
        {
            toggleFeaturedItemAction(formData);
        });
    }

    return (
        <button
            type="button"
            className={`shop-card-star ${isFeatured ? "shop-card-star-active" : ""}`}
            onClick={handleClick}
            disabled={isPending || (!isFeatured && !canFeatureMore)}
            aria-pressed={isFeatured}
            aria-label={isFeatured ? "Remove from featured" : "Feature this item"}
            title={
                isFeatured
                    ? "Remove from featured"
                    : canFeatureMore
                        ? "Feature this item (up to 3)"
                        : "You can only feature up to 3 items"
            }
        >
            {isFeatured ? <StarFillIcon /> : <StarOutlineIcon />}
        </button>
    );
}
