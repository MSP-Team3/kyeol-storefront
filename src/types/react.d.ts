// React 18.2.0 + Next.js 13 Server Components 타입 호환성 해결
// async 컴포넌트(Server Components)가 Promise<Element>를 반환할 수 있도록 타입 확장

import type { ReactElement, ReactNode } from "react";

// Server Component 반환 타입
type ServerComponentReturnType = ReactElement<any, any> | ReactNode | null;
type AsyncServerComponentReturnType = Promise<ServerComponentReturnType>;

declare global {
	namespace JSX {
		// async 함수 컴포넌트를 JSX element type으로 허용
		type ElementType =
			| string
			| React.JSXElementConstructor<any>
			| ((props: any) => ServerComponentReturnType | AsyncServerComponentReturnType);
	}
}

declare module "react" {
	// Server Components를 위한 async 함수 컴포넌트 타입 지원
	interface FunctionComponent<P = {}> {
		(props: P, context?: any): ServerComponentReturnType | AsyncServerComponentReturnType;
	}

	// FC 별칭도 동일하게 적용
	type FC<P = {}> = FunctionComponent<P>;
}

export {};
