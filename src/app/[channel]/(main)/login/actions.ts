"use server";

import { getServerAuthClient } from "@/app/config";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData): Promise<{ ok: boolean; message?: string }> {
    try {
        const email = formData.get("email")?.toString();
        const password = formData.get("password")?.toString();

        if (!email || !password) {
            console.error("Login input missing: email/password");
            return { ok: false, message: "email/password missing" };
        }

        const authClient = await getServerAuthClient();
        const { data } = await authClient.signIn({ email, password }, { cache: "no-store" });

        const errors = data?.tokenCreate?.errors ?? [];
        if (errors.length > 0) {
            console.error("Login failed:", errors);
            return { ok: false, message: errors.map(e => e.message).join(", ") };
        }
        // 성공 시 이동 (채널 홈으로)
        redirect("/default-channel");
    } catch (error) {
        console.error("Login action error:", error);
        // throw 하지 않음 (Next Action 500 폭탄 방지)
        return { ok: false, message: "server error" };
    }
}
