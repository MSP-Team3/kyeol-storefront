import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { invariant } from "ts-invariant";
import { executeGraphQL } from "@/lib/graphql";
import { CheckoutAddLineDocument } from "@/gql/graphql";
import * as Checkout from "@/lib/checkout";

export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as { channel?: string; variantId?: string };
		const { channel, variantId } = body;

		if (!channel || !variantId) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		// Route Handler에서는 cookies()를 최상위에서 안전하게 호출 가능
		const cookieStore = cookies();
		const cookieName = `checkoutId-${channel}`;
		const checkoutIdFromCookie = cookieStore.get(cookieName)?.value || "";

		const checkout = await Checkout.findOrCreate({
			checkoutId: checkoutIdFromCookie,
			channel: channel,
		});
		invariant(checkout, "Failed to create checkout");

		// 쿠키 설정
		const shouldUseHttps =
			process.env.NEXT_PUBLIC_STOREFRONT_URL?.startsWith("https") || !!process.env.NEXT_PUBLIC_VERCEL_URL;

		cookieStore.set(cookieName, checkout.id, {
			sameSite: "lax",
			secure: shouldUseHttps,
			httpOnly: true,
			path: "/",
		});

		// GraphQL 호출
		await executeGraphQL(CheckoutAddLineDocument, {
			variables: {
				id: checkout.id,
				productVariantId: decodeURIComponent(variantId),
			},
			cache: "no-cache",
			withAuth: false,
		});

		return NextResponse.json({ success: true, checkoutId: checkout.id });
	} catch (error) {
		console.error("Add to cart error:", error);
		return NextResponse.json(
			{
				error: "Failed to add item to cart",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
