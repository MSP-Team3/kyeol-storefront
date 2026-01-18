import "server-only";

import { cookies } from "next/headers";
import { CheckoutCreateDocument, CheckoutFindDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export async function getIdFromCookies(channel: string) {
	try {
		const cookieName = `checkoutId-${channel}`;
		const checkoutId = cookies().get(cookieName)?.value || "";
		return checkoutId;
	} catch (e) {
		console.error("getIdFromCookies failed:", e);
		return "";
	}
}

export async function saveIdToCookie(channel: string, checkoutId: string) {
	try {
		const shouldUseHttps =
			process.env.NEXT_PUBLIC_STOREFRONT_URL?.startsWith("https") || !!process.env.NEXT_PUBLIC_VERCEL_URL;

		const cookieName = `checkoutId-${channel}`;
		cookies().set(cookieName, checkoutId, {
			sameSite: "lax",
			secure: shouldUseHttps,
			httpOnly: true,
			path: "/",
		});
	} catch (e) {
		console.error("saveIdToCookie failed:", e);
		// 쿠키 설정 실패해도 치명 장애로 올리지 않음
	}
}

export async function find(checkoutId: string) {
	try {
		const { checkout } = checkoutId
			? await executeGraphQL(CheckoutFindDocument, {
				variables: { id: checkoutId },
				cache: "no-cache",
				withAuth: false,
			})
			: { checkout: null };

		return checkout;
	} catch {
		// invalid ID or checkout not found
	}
}

export async function findOrCreate({ channel, checkoutId }: { checkoutId?: string; channel: string }) {
	if (!checkoutId) {
		return (await create({ channel })).checkoutCreate?.checkout;
	}
	const checkout = await find(checkoutId);
	return checkout || (await create({ channel })).checkoutCreate?.checkout;
}

export const create = ({ channel }: { channel: string }) =>
	executeGraphQL(CheckoutCreateDocument, { cache: "no-cache", variables: { channel }, withAuth: false });

