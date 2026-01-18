import "server-only";

import { cookies } from "next/headers";
import { CheckoutCreateDocument, CheckoutFindDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export async function getIdFromCookies(channel: string) {
	try {
		const cookieName = `checkoutId-${channel}`;
		return cookies().get(cookieName)?.value || "";
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
	}
}

export async function find(checkoutId: string) {
	try {
		if (!checkoutId) return null;

		const { checkout } = await executeGraphQL(CheckoutFindDocument, {
			variables: { id: checkoutId },
			cache: "no-cache",
			withAuth: false,
		});

		return checkout ?? null;
	} catch (e) {
		console.error("checkout.find failed:", e);
		return null;
	}
}

export async function findOrCreate({ channel, checkoutId }: { checkoutId?: string; channel: string }) {
	if (!checkoutId) {
		return (await create({ channel })).checkoutCreate?.checkout ?? null;
	}
	const checkout = await find(checkoutId);
	return checkout || (await create({ channel })).checkoutCreate?.checkout || null;
}

export const create = ({ channel }: { channel: string }) =>
	executeGraphQL(CheckoutCreateDocument, { cache: "no-cache", variables: { channel }, withAuth: false });
