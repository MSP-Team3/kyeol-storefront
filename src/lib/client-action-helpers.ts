/**
 * Client-side helpers for safely calling Server Actions
 *
 * React 18.2.0 타입 시스템 문제 해결:
 * startTransition은 동기 함수만 받지만, Server Actions는 Promise를 반환합니다.
 *
 * 이 파일은 타입 안전성을 보장하면서 Server Actions를 호출하는 패턴을 제공합니다.
 */

/**
 * Server Action을 startTransition과 함께 안전하게 호출
 *
 * @example
 * ```tsx
 * const [isPending, startTransition] = useTransition();
 *
 * const handleClick = () => {
 *   startTransition(() => {
 *     executeServerAction(async () => {
 *       await myServerAction({ id: '123' });
 *     });
 *   });
 * };
 * ```
 */
export function executeServerAction(action: () => Promise<void>): void {
	// startTransition 내부에서 호출될 때:
	// 1. Promise를 void로 캐스팅하여 타입 에러 방지
	// 2. catch로 unhandled rejection 방지
	void action().catch((error) => {
		console.error("[executeServerAction] Server action failed:", error);
	});
}

/**
 * 서버 액션 호출 + 에러 핸들링을 한번에 처리
 *
 * @returns 성공 여부 (true/false)
 */
export async function safeServerAction<T extends unknown[]>(
	action: (...args: T) => Promise<void>,
	...args: T
): Promise<boolean> {
	try {
		await action(...args);
		return true;
	} catch (error) {
		console.error("[safeServerAction] Failed:", error);
		return false;
	}
}
