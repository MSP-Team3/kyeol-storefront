import { NextResponse } from "next/server";
import { getServerAuthClient } from "@/app/config";

export async function POST() {
	try {
		const authClient = await getServerAuthClient();
		await authClient.signOut();

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Logout error:", error);
		return NextResponse.json(
			{ error: "Failed to logout", details: error instanceof Error ? error.message : String(error) },
			{ status: 500 },
		);
	}
}
