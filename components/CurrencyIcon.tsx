import Image from "next/image";

export default function CurrencyIcon({ className }: { className?: string })
{
    return (
        <Image
            src="/other-images/bark-wbg.png"
            alt="barks"
            width={35}
            height={35}
            className={className ? `currency-icon ${className}` : "currency-icon"}
        />
    );
}
