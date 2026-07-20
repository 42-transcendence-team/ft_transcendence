import type { ReactNode } from "react";

type PrivateMainContentProps = {
    children: ReactNode;
};

export function PrivateMainContent({
    children,
}: PrivateMainContentProps) {
    return (
        <main className="privateLayout__content">
            <div className="privateLayout__contentFrame">
                <div className="privateLayout__contentInner">
                    {children}
                </div>
            </div>
        </main>
    );
}