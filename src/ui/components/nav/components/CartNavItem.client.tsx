"use client";

import { ShoppingBagIcon } from "lucide-react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { LinkWithChannel } from "@/ui/atoms/LinkWithChannel";

type Props = { channel: string };

// ✅ 운영 안정 우선: 초기에는 badge 0
// ✅ 이후 원하면 /api/cart-count 같은 route handler 붙여서 실제 숫자 연결 가능
export function CartNavItemClient({ channel }: Props) {
    const [lineCount, setLineCount] = useState<number>(0);

    useEffect(() => {
        let ignore = false;

        async function load() {
            try {
                // TODO(권장): route handler 만들어서 count 가져오기
                // 예: const res = await fetch(`/api/cart/count?channel=${encodeURIComponent(channel)}`, { cache: "no-store" });
                // const data = await res.json();
                // if (!ignore) setLineCount(data.count ?? 0);

                // 현재는 안정화 목적: 아무 것도 안 함
                if (!ignore) setLineCount(0);
            } catch (e) {
                // 실패해도 UI 깨지지 않게
                console.error("Cart count fetch failed:", e);
                if (!ignore) setLineCount(0);
            }
        }

        load();
        return () => {
            ignore = true;
        };
    }, [channel]);

    return (
        <LinkWithChannel href="/cart" className="relative flex items-center" data-testid="CartNavItem">
            <ShoppingBagIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
            {lineCount > 0 ? (
                <div
                    className={clsx(
                        "absolute bottom-0 right-0 -mb-2 -mr-2 flex h-4 flex-col items-center justify-center rounded bg-neutral-900 text-xs font-medium text-white",
                        lineCount > 9 ? "w-[3ch]" : "w-[2ch]",
                    )}
                >
                    {lineCount} <span className="sr-only">item{lineCount > 1 ? "s" : ""} in cart, view bag</span>
                </div>
            ) : (
                <span className="sr-only">0 items in cart</span>
            )}
        </LinkWithChannel>
    );
}
