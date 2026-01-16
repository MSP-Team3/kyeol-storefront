"use client";

import { useEffect, useState } from "react";

export function AddButton({ disabled }: { disabled?: boolean }) {
	const [pending, setPending] = useState(false);
	const isButtonDisabled = disabled || pending;

	useEffect(() => {
		// pending이 true로 바뀌면 너무 오래 고정되지 않도록 안전장치(UX용)
		if (!pending) return;
		const t = setTimeout(() => setPending(false), 4000);
		return () => clearTimeout(t);
	}, [pending]);

	return (
		<button
			type="submit"
			aria-disabled={isButtonDisabled}
			aria-busy={pending}
			onClick={(e) => {
				if (isButtonDisabled) {
					e.preventDefault();
					return;
				}
				// server action 호출 직전에 로딩 표시
				setPending(true);
			}}
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
	);
}
