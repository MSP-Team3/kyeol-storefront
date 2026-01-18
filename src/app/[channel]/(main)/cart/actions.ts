"use server";

import { revalidatePath } from "next/cache";
import { executeGraphQL } from "@/lib/graphql";
import { CheckoutDeleteLinesDocument } from "@/gql/graphql";

type deleteLineFromCheckoutArgs = {
	lineId: string;
	checkoutId: string;
};

/**
 * deleteLineFromCheckout - 장바구니 라인 삭제 Server Action
 *
 * 중요: 이 함수는 절대 앱 전체를 크래시시키지 않습니다.
 * - GraphQL 실패 시: 에러를 로깅하고 throw (클라이언트가 처리)
 * - 네트워크 실패 시: 에러를 로깅하고 throw
 * - 인증 실패 시: executeGraphQL이 withAuth=false로 동작하므로 안전
 */
export const deleteLineFromCheckout = async ({
	lineId,
	checkoutId,
}: deleteLineFromCheckoutArgs): Promise<void> => {
	try {
		await executeGraphQL(CheckoutDeleteLinesDocument, {
			variables: {
				checkoutId,
				lineIds: [lineId],
			},
			cache: "no-cache",
			// withAuth를 명시하지 않으면 기본값 false
			// 즉, cookies() 호출 없이 안전하게 동작
		});

		revalidatePath("/cart");
	} catch (error) {
		console.error("[deleteLineFromCheckout] Failed to delete line:", {
			lineId,
			checkoutId,
			error,
		});

		// 에러를 다시 throw하여 클라이언트가 알 수 있게 함
		// executeServerAction이 catch하므로 앱은 크래시하지 않음
		throw error;
	}
};
