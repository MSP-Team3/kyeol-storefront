import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/checkout/hooks/useUser";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { extractCheckoutIdFromUrl } from "@/checkout/lib/utils/url";

interface AttachCustomerResponse {
	success: boolean;
	reason?: string;
	error?: string;
}

/**
 * Checkout Customer Attach Hook
 *
 * 로그인된 사용자가 Checkout 페이지에 접근할 때
 * checkout.user가 null이면 자동으로 customer를 attach합니다.
 *
 * Route Handler(/api/checkout/attach-customer)를 통해 서버에서 안정적으로 처리합니다.
 */
export const useCustomerAttach = () => {
	const { checkout, fetching: fetchingCheckout, refetch } = useCheckout();
	const { authenticated } = useUser();
	const [attachAttempted, setAttachAttempted] = useState(false);

	const attachCustomer = useCallback(async () => {
		// 이미 시도했거나 조건이 맞지 않으면 skip
		if (attachAttempted || !authenticated || fetchingCheckout || checkout?.user?.id) {
			return;
		}

		const checkoutId = extractCheckoutIdFromUrl();
		if (!checkoutId) {
			return;
		}

		try {
			setAttachAttempted(true);

			const response = await fetch("/api/checkout/attach-customer", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ checkoutId }),
			});

			const result = (await response.json()) as AttachCustomerResponse;

			if (result.success) {
				// attach 성공 시 checkout 데이터 재조회
				console.log("[useCustomerAttach] Customer attached successfully:", result.reason || "attached");
				await refetch();
			} else {
				// 실패 시 silent fail (UX 방해 없음)
				console.log("[useCustomerAttach] Attach failed or not needed:", result.reason || result.error);
			}
		} catch (error) {
			// 네트워크 에러 등도 silent fail
			console.error("[useCustomerAttach] Unexpected error:", error);
		}
	}, [attachAttempted, authenticated, checkout?.user?.id, fetchingCheckout, refetch]);

	useEffect(() => {
		void attachCustomer();
	}, [attachCustomer]);
};
