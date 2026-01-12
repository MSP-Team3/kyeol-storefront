/** @type {import('next').NextConfig} */
const config = {
	images: {
		remotePatterns: [
			{
				hostname: "*",
			},
		],
	},
	typescript: {
		// API가 준비되지 않았을 때 발생하는 타입 에러 무시
		ignoreBuildErrors: true,
	},
	eslint: {
		// 빌드 시 ESLint 체크 스킵
		ignoreDuringBuilds: true,
	},
	// used in the Dockerfile
	output:
		process.env.NEXT_OUTPUT === "standalone"
			? "standalone"
			: process.env.NEXT_OUTPUT === "export"
				? "export"
				: undefined,
};

export default config;
