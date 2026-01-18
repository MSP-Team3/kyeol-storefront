"use server";

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
        const checkout = await Checkout.findOrCreate({
            checkoutId: await Checkout.getIdFromCookies(channel),
            channel: channel,
        });
        invariant(checkout, "Failed to create checkout");

        await Checkout.saveIdToCookie(channel, checkout.id);

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
