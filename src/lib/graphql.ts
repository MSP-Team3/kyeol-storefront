// src/lib/graphql.ts
import { invariant } from "ts-invariant";
import { type TypedDocumentString } from "../gql/graphql";

type GraphQLErrorResponse = {
	errors: readonly {
		message: string;
	}[];
};

type GraphQLRespone<T> = { data: T } | GraphQLErrorResponse;

export async function executeGraphQL<Result, Variables>(
	operation: TypedDocumentString<Result, Variables>,
	options: {
		headers?: HeadersInit;
		cache?: RequestCache;
		revalidate?: number;
		withAuth?: boolean;
	} & (Variables extends Record<string, never> ? { variables?: never } : { variables: Variables }),
): Promise<Result> {
	invariant(process.env.NEXT_PUBLIC_SALEOR_API_URL, "Missing NEXT_PUBLIC_SALEOR_API_URL env variable");

	const { variables, headers, cache, revalidate, withAuth = false } = options;

	const input: RequestInit & { next?: { revalidate?: number } } = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
		body: JSON.stringify({
			query: operation.toString(),
			...(variables && { variables }),
		}),
		cache,
		next: { revalidate },
	};

	let response: Response;

	if (withAuth) {
		try {
			// Dynamic import: cookies() 관련 호출이 빌드/정적 렌더에서 실행되는 것을 방지
			const { getServerAuthClient } = await import("@/app/config");
			const authClient = await getServerAuthClient();
			response = await authClient.fetchWithAuth(process.env.NEXT_PUBLIC_SALEOR_API_URL, input);
		} catch (e) {
			console.error("[executeGraphQL] withAuth path failed:", {
				error: e,
				operation: operation.toString(),
				variables,
			});
			throw e;
		}
	} else {
		response = await fetch(process.env.NEXT_PUBLIC_SALEOR_API_URL, input);
	}

	if (!response.ok) {
		const body = await (async () => {
			try {
				return await response.text();
			} catch {
				return "";
			}
		})();

		console.error("[executeGraphQL] HTTP error", {
			status: response.status,
			statusText: response.statusText,
			operation: operation.toString(),
			variables,
			bodyPreview: body?.slice?.(0, 800),
		});

		throw new HTTPError(response, body);
	}

	const body = (await response.json()) as GraphQLRespone<Result>;

	if ("errors" in body) {
		console.error("[executeGraphQL] GraphQL errors", {
			operation: operation.toString(),
			variables,
			errors: body.errors,
		});
		throw new GraphQLError(body);
	}

	return body.data;
}

class GraphQLError extends Error {
	constructor(public errorResponse: GraphQLErrorResponse) {
		const message = errorResponse.errors.map((error) => error.message).join("\n");
		super(message);
		this.name = this.constructor.name;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

class HTTPError extends Error {
	constructor(response: Response, body: string) {
		const message = `HTTP error ${response.status}: ${response.statusText}\n${body}`;
		super(message);
		this.name = this.constructor.name;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
