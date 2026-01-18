"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AddButtonProps = {
	disabled?: boolean;
	channel: string;
	variantId: string;
};

export function AddButton({ disabled, channel, variantId }: AddButtonProps) {
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const isButtonDisabled = disabled || pending;

	useEffect(() => {
		if (!pending) return;
		const t = setTimeout(() => setPending(false), 4000);
		return () => clearTimeout(t);
	}, [pending]);

	const handleAddToCart = async () => {
		if (isButtonDisabled) return;

		setPending(true);
		setError(null);

		try {
			const response = await fetch("/api/cart/add", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					channel,
					variantId,
				}),
			});

			if (!response.ok) {
				const data = (await response.json()) as { error?: string };
				throw new Error(data.error || "Failed to add to cart");
			}

			router.refresh();
		} catch (err) {
			console.error("Add to cart failed:", err);
			setError(err instanceof Error ? err.message : "Failed to add to cart");
		} finally {
			setPending(false);
		}
	};

	return (
		<div>
			<button
				type="button"
				aria-disabled={isButtonDisabled}
				aria-busy={pending}
				onClick={handleAddToCart}
				className="h-12 items-center rounded-md bg-neutral-900 px-6 py-3 text-base font-medium leading-6 text-white shadow hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70 hover:disabled:bg-neutral-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-70 hover:aria-disabled:bg-neutral-700"
			>
				{pending ? (
					<div className="inline-flex items-center">
						<svg
							className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						<span>Processing...</span>
					</div>
				) : (
					<span>Add to cart</span>
				)}
			</button>
			{error && <p className="mt-2 text-sm text-red-600">{error}</p>}
		</div>
	);
}
