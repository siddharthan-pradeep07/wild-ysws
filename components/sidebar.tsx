"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems =
[
    {label: "House", href: "/home"},
    {label: "projects", href: "/projects"},
    {label: "shop", href: "/shop"},
    {label: "profile", href: "/profile"},
];

export default  function Sidebar({
    isAdmin = false,
    children,
}: {
    isAdmin?: boolean;
    children?: React.ReactNode;
})
{
    const pathname = usePathname();
    const items = isAdmin
        ? [...navItems, {label: "admin", href: "/admin"}]
        : navItems;

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`sidebar-link ${pathname === item.href ? "sidebar-link-active" : ""}`}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
            {children}
        </aside>
    );
}