/** @type {import('next').NextConfig} */
const config = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "kyeol.click",
			},
			{
				protocol: "https",
				hostname: "www.kyeol.click",
			},
			{
				protocol: "https",
				hostname: "dev.kyeol.click",
			},
			{
				protocol: "https",
				hostname: "stage.kyeol.click",
			},
			{
				protocol: "https",
				hostname: "*.kyeol.click",
			},
		],
	},
	experimental: {
		serverActions: true,
	},
	swcMinify: false,
	trailingSlash: false,
	output:
		process.env.NEXT_OUTPUT === "standalone"
			? "standalone"
			: process.env.NEXT_OUTPUT === "export"
				? "export"
				: undefined,
};

export default config;
