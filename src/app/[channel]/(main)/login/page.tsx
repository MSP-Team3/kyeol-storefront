import { Suspense } from "react";
import { Loader } from "@/ui/atoms/Loader";
import { LoginForm } from "@/ui/components/LoginForm";

export const dynamic = "force-dynamic";

/**
 * Login Page
 *
 * LoginForm은 이제 클라이언트 컴포넌트로,
 * API Route Handler (/api/auth/login)를 사용합니다.
 *
 * 이렇게 하면:
 * 1. Server Action에서의 redirect() 런타임 크래시 회피
 * 2. 명시적 에러 처리 및 로딩 상태 관리
 * 3. cookies() 접근이 안전한 Route Handler 컨텍스트에서만 발생
 */
export default function LoginPage() {
	return (
		<Suspense fallback={<Loader />}>
			<section className="mx-auto max-w-7xl p-8">
				<LoginForm />
			</section>
		</Suspense>
	);
}
