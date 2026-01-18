"use server";

import { getServerAuthClient } from "@/app/config";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData): Promise<void> {
    try {
        const email = formData.get("email")?.toString();
        const password = formData.get("password")?.toString();

        if (!email || !password) {
            redirect("/default-channel/login?error=" + encodeURIComponent("email/password missing"));
        }

        const authClient = await getServerAuthClient();
        const { data } = await authClient.signIn({ email: email!, password: password! }, { cache: "no-store" });

        const errors = data?.tokenCreate?.errors ?? [];
        if (errors.length > 0) {
            const msg = errors.map((e) => e.message).filter(Boolean).join(", ") || "Login failed";
            redirect("/default-channel/login?error=" + encodeURIComponent(msg));
        }

        // 성공 시 이동
        redirect("/default-channel");
    } catch (e) {
        console.error("Login action error:", e);
        redirect("/default-channel/login?error=" + encodeURIComponent("Internal server error"));
    }
}
