"use server";

import { getServerAuthClient } from "@/app/config";

export async function loginAction(formData: FormData): Promise<void> {
    try {
        const email = formData.get("email")?.toString();
        const password = formData.get("password")?.toString();

        if (!email || !password) {
            console.error("Login input missing: email/password");
            return;
        }

        const authClient = await getServerAuthClient();
        const { data } = await authClient.signIn({ email, password }, { cache: "no-store" });

        const errors = data?.tokenCreate?.errors ?? [];
        if (errors.length > 0) {
            console.error("Login failed:", errors);
            return;
        }

        // ✅ 성공 시에도 별도 redirect/cookie 설정이 필요할 수 있음
        // (현재는 authClient 내부에서 토큰/쿠키 처리하는 구조로 보임)
    } catch (error) {
        console.error("Login action error:", error);
        // throw 하지 않음 (Next Action 500 폭탄 방지)
        return;
    }
}
