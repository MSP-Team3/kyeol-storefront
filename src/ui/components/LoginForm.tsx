import { loginAction } from "@/app/[channel]/(main)/login/actions";

export async function LoginForm({
	searchParams,
}: {
	searchParams?: { error?: string };
}) {
	const error = searchParams?.error;

	return (
		<div className="mx-auto mt-16 w-full max-w-lg">
			<form className="rounded border p-8 shadow-md" action={loginAction}>
				<div className="mb-2">
					<label className="sr-only" htmlFor="email">
						Email
					</label>
					<input
						required
						type="email"
						name="email"
						placeholder="Email"
						className="w-full rounded border bg-neutral-50 px-4 py-2"
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
						placeholder="Password"
						autoCapitalize="off"
						autoComplete="off"
						className="w-full rounded border bg-neutral-50 px-4 py-2"
					/>
				</div>

				<button
					className="rounded bg-neutral-800 px-4 py-2 text-neutral-200 hover:bg-neutral-700"
					type="submit"
				>
					Log In
				</button>
			</form>

			{/* 서버 리다이렉트로 error를 넘기면 여기에서 표시 */}
			{error ? (
				<p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
					{decodeURIComponent(error)}
				</p>
			) : null}
		</div>
	);
}
