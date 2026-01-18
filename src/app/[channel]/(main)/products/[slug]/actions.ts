"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { invariant } from "ts-invariant";
import { executeGraphQL } from "@/lib/graphql";
import { CheckoutAddLineDocument } from "@/gql/graphql";
import * as Checkout from "@/lib/checkout";

export async function addToCartAction(formData: FormData): Promise<void> {
	const channel = formData.get("channel")?.toString();
	const variantId = formData.get("variantId")?.toString();

	if (!channel || !variantId) {
		return;
	}

	try {
		// Server Action 내에서 cookies()는 최상위 레벨에서만 호출 가능
		// 중첩 함수 호출(getIdFromCookies)을 피하고 직접 호출
		const cookieName = `checkoutId-${channel}`;
		const checkoutIdFromCookie = cookies().get(cookieName)?.value || "";

		const checkout = await Checkout.findOrCreate({
			checkoutId: checkoutIdFromCookie,
			channel: channel,
		});
		invariant(checkout, "Failed to create checkout");

		// saveIdToCookie도 cookies()를 내부에서 호출하므로 직접 처리
		const shouldUseHttps =
			process.env.NEXT_PUBLIC_STOREFRONT_URL?.startsWith("https") || !!process.env.NEXT_PUBLIC_VERCEL_URL;

		cookies().set(cookieName, checkout.id, {
			sameSite: "lax",
			secure: shouldUseHttps,
			httpOnly: true,
			path: "/",
		});

		await executeGraphQL(CheckoutAddLineDocument, {
			variables: {
				id: checkout.id,
				productVariantId: decodeURIComponent(variantId),
			},
			cache: "no-cache",
			withAuth: false,
		});

		revalidatePath("/cart");
	} catch (error) {
		console.error("Add to cart error:", error);
	}
}
