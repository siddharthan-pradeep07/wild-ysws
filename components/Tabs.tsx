"use client";

import { useState, type ReactNode } from "react";

type Tab =
{
    key: string;
    label: string;
    content: ReactNode;
};

export default function Tabs({ tabs }: { tabs: Tab[] })
{
    const [activeKey, setActiveKey] = useState(tabs[0]?.key);
    const activeTab = tabs.find((tab) => tab.key === activeKey) ?? tabs[0];

    return (
        <div className="flex flex-col gap-6">
            <div className="admin-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveKey(tab.key)}
                        className={`admin-tab ${tab.key === activeTab?.key ? "admin-tab-active" : ""}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab?.content}
        </div>
    );
}
