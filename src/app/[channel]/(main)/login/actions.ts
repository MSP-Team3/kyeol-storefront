"use server";

import { getServerAuthClient } from "@/app/config";

export async function loginAction(formData: FormData): Promise<void> {
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
        return;
    }

    try {
        const authClient = await getServerAuthClient();
        const { data } = await authClient.signIn({ email, password }, { cache: "no-store" });

        if (data?.tokenCreate?.errors && data.tokenCreate.errors.length > 0) {
            console.error("Login failed:", data.tokenCreate.errors);
            return;
        }
    } catch (error) {
        console.error("Login error:", error);
    }
}
