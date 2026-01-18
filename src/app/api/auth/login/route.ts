// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerAuthClient } from "@/app/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/auth/login
 *
 * Server Action의 redirect() 런타임 크래시를 회피하기 위해
 * 인증 로직을 API Route Handler로 분리.
 *
 * Next.js 13.5.6 + Server Actions + redirect() 조합은
 * "s is not a function" 런타임 에러를 발생시킴.
 */
export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const email = formData.get("email")?.toString();
		const password = formData.get("password")?.toString();

		if (!email || !password) {
			return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
		}

		// getServerAuthClient는 내부적으로 cookies()를 호출
		// Route Handler 컨텍스트에서는 안전하게 동작
		const authClient = await getServerAuthClient();

		const { data } = await authClient.signIn({ email, password }, { cache: "no-store" });

		const errors = data?.tokenCreate?.errors ?? [];

		if (errors.length > 0) {
			const errorMessage =
				errors
					.map((e) => e.message)
					.filter(Boolean)
					.join(", ") || "Login failed";

			return NextResponse.json({ success: false, error: errorMessage }, { status: 401 });
		}

		// 성공 시
		return NextResponse.json({
			success: true,
			redirectUrl: "/default-channel",
		});
	} catch (error) {
		console.error("[POST /api/auth/login] Unexpected error:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Internal server error. Please try again.",
			},
			{ status: 500 },
		);
	}
}
