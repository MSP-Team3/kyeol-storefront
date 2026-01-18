"use client";

import { useTransition } from "react";
import { executeServerAction } from "@/lib/client-action-helpers";
import { deleteLineFromCheckout } from "./actions";

type Props = {
	lineId: string;
	checkoutId: string;
};

/**
 * DeleteLineButton - Server Action 타입 안전 호출
 *
 * React 18.2.0에서 startTransition은 동기 함수만 받습니다.
 * executeServerAction 래퍼를 사용하여 타입 에러를 방지합니다.
 */
export const DeleteLineButton = ({ lineId, checkoutId }: Props) => {
	const [isPending, startTransition] = useTransition();

	return (
		<button
			type="button"
			className="text-sm text-neutral-500 hover:text-neutral-900"
			onClick={() => {
				if (isPending) return;

				// ✅ 타입 안전: executeServerAction이 void를 반환
				startTransition(() => {
					executeServerAction(async () => {
						await deleteLineFromCheckout({ lineId, checkoutId });
					});
				});
			}}
			aria-disabled={isPending}
		>
			{isPending ? "Removing..." : "Remove"}
			<span className="sr-only"> line from cart</span>
		</button>
	);
};
