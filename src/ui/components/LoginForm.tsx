"use client";

import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";

/**
 * LoginForm - API Route Handler 기반 인증
 *
 * Server Actions의 런타임 크래시를 회피하기 위해
 * /api/auth/login Route Handler를 사용합니다.
 *
 * 왜 이 방식이 안전한가:
 * 1. Server Action에서 redirect() 호출 시 발생하는 "s is not a function" 에러 회피
 * 2. 클라이언트에서 명시적 상태 관리 및 에러 처리
 * 3. cookies() 접근이 Route Handler 컨텍스트에서만 발생
 */
export function LoginForm() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		try {
			const formData = new FormData(e.currentTarget);

			const response = await fetch("/api/auth/login", {
				method: "POST",
				body: formData,
			});

			const result = (await response.json()) as
				| { success: true; redirectUrl: string }
				| { success: false; error: string };

			if (result.success) {
				// 성공 시 리다이렉트
				router.push(result.redirectUrl || "/default-channel");
				router.refresh(); // 서버 컴포넌트 리프레시
			} else {
				setError(result.error || "Login failed");
				setIsLoading(false);
			}
		} catch (err) {
			console.error("Login error:", err);
			setError("Network error. Please try again.");
			setIsLoading(false);
		}
	};

	return (
		<div className="mx-auto mt-16 w-full max-w-lg">
			<form ref={formRef} className="rounded border p-8 shadow-md" onSubmit={handleSubmit}>
				<div className="mb-2">
					<label className="sr-only" htmlFor="email">
						Email
					</label>
					<input
						required
						type="email"
						name="email"
						id="email"
						placeholder="Email"
						className="w-full rounded border bg-neutral-50 px-4 py-2"
						disabled={isLoading}
					/>
				</div>

				<div className="mb-4">
					<label className="sr-only" htmlFor="password">
						Password
					</label>
					<input
						required
						type="password"
						name="password"
						id="password"
						placeholder="Password"
						autoCapitalize="off"
						autoComplete="current-password"
						className="w-full rounded border bg-neutral-50 px-4 py-2"
						disabled={isLoading}
					/>
				</div>

				<button
					className="rounded bg-neutral-800 px-4 py-2 text-neutral-200 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-400"
					type="submit"
					disabled={isLoading}
				>
					{isLoading ? "Logging in..." : "Log In"}
				</button>
			</form>

			{error ? (
				<p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
			) : null}
		</div>
	);
}
