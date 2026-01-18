// src/app/config.ts
import { createSaleorAuthClient } from "@saleor/auth-sdk";
import { invariant } from "ts-invariant";

export const ProductsPerPage = 12;

const saleorApiUrl = process.env.NEXT_PUBLIC_SALEOR_API_URL;
invariant(saleorApiUrl, "Missing NEXT_PUBLIC_SALEOR_API_URL env variable");

export const DefaultChannelSlug = process.env.NEXT_PUBLIC_DEFAULT_CHANNEL ?? "default-channel";

export const getServerAuthClient = async () => {
	try {
		/**
		 * Dynamic import로 Next request context가 존재하는 서버 요청에서만 로드되게 함.
		 * (정적 생성/빌드 타임 호출 방지)
		 */
		const mod = await import("@saleor/auth-sdk/next/server");
		const getNextServerCookiesStorage = mod.getNextServerCookiesStorage;

		if (typeof getNextServerCookiesStorage !== "function") {
			throw new Error("getNextServerCookiesStorage is not a function (auth-sdk/next/server mismatch)");
		}

		const nextServerCookiesStorage = getNextServerCookiesStorage();

		return createSaleorAuthClient({
			saleorApiUrl,
			refreshTokenStorage: nextServerCookiesStorage,
			accessTokenStorage: nextServerCookiesStorage,
		});
	} catch (e) {
		console.error("[getServerAuthClient] failed:", e);
		throw e;
	}
};
