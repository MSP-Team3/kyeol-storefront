import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { executeGraphQL } from "@/lib/graphql";
import { CurrentUserDocument } from "@/gql/graphql";
import { CheckoutDocument, CheckoutCustomerAttachDocument } from "@/checkout/graphql";

/**
 * Route Handler: Checkout에 Customer Attach
 *
 * 로그인된 사용자가 Checkout 페이지에 접근할 때
 * checkout.user가 null이면 자동으로 customer를 attach합니다.
 *
 * Method: POST
 * Input: { checkoutId?: string } (또는 cookie에서 읽기)
 * Output: { success: boolean, reason?: string, error?: string }
 */
export async function POST(request: NextRequest) {
	try {
		// 1. Route Handler 최상단에서 cookies 읽기
		const cookieStore = cookies();

		// 2. checkoutId 확인 (body 우선, 없으면 cookie)
		let checkoutId: string | undefined;
		try {
			const body = (await request.json()) as { checkoutId?: string; channel?: string };
			checkoutId = body.checkoutId;
		} catch {
			// body가 없거나 JSON 파싱 실패 시 무시
		}

		// body에 checkoutId가 없으면 cookie에서 읽기
		if (!checkoutId) {
			const defaultChannel = process.env.NEXT_PUBLIC_DEFAULT_CHANNEL ?? "default-channel";
			const cookieName = `checkoutId-${defaultChannel}`;
			checkoutId = cookieStore.get(cookieName)?.value;
		}

		if (!checkoutId) {
			return NextResponse.json({ success: false, reason: "no_checkout_id" }, { status: 200 });
		}

		// 3. 로그인 사용자 확인
		const { me: user } = await executeGraphQL(CurrentUserDocument, {
			withAuth: true,
			cache: "no-cache",
		});

		if (!user) {
			return NextResponse.json({ success: false, reason: "not_authenticated" }, { status: 200 });
		}

		// 4. Checkout 조회
		const checkoutResult: any = await executeGraphQL(CheckoutDocument as any, {
			variables: { id: checkoutId, languageCode: "EN_US" },
			cache: "no-cache",
		});

		if (!checkoutResult?.checkout) {
			return NextResponse.json({ success: false, reason: "checkout_not_found" }, { status: 200 });
		}

		// 5. 이미 attach된 경우
		if (checkoutResult.checkout.user?.id) {
			return NextResponse.json({ success: true, reason: "already_attached" }, { status: 200 });
		}

		// 6. Customer Attach 실행
		const attachResult: any = await executeGraphQL(CheckoutCustomerAttachDocument as any, {
			variables: { checkoutId, languageCode: "EN_US" },
			withAuth: true,
			cache: "no-cache",
		});

		if (attachResult?.checkoutCustomerAttach?.errors?.length) {
			const errorMessages = attachResult.checkoutCustomerAttach.errors
				.map((err: any) => err.message)
				.join(", ");

			// 이미 attach된 경우의 에러는 성공으로 처리
			if (errorMessages.includes("already attached")) {
				return NextResponse.json({ success: true, reason: "already_attached" }, { status: 200 });
			}

			console.error("[attach-customer] GraphQL errors:", errorMessages);
			return NextResponse.json({ success: false, error: errorMessages }, { status: 200 });
		}

		// 7. 성공
		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error) {
		console.error("[attach-customer] Unexpected error:", error);
		// UX 방해 없이 에러를 반환 (throw 금지)
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : String(error),
			},
			{ status: 200 },
		);
	}
}
