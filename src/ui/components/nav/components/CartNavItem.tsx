import { CartNavItemClient } from "./CartNavItem.client";

export const CartNavItem = ({ channel }: { channel: string }) => {
	// ✅ 서버 컴포넌트에서 cookies()/GraphQL 호출 제거
	// ✅ 헤더 렌더링이 더 이상 쿠키에 의해 강제 dynamic 되지 않음
	return <CartNavItemClient channel={channel} />;
};
