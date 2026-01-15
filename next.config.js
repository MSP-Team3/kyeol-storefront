/** @type {import('next').NextConfig} */
const config = {
	images: {
		remotePatterns: [
			{
				hostname: "*",
			},
		],
	},
},
	experimental: {
		serverActions: true,
		typedRoutes: true,
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
