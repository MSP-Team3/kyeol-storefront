import edjsHTML from "editorjs-html";
import { notFound } from "next/navigation";
import { type ResolvingMetadata, type Metadata } from "next";
import xss from "xss";
import { type WithContext, type Product } from "schema-dts";
import { AddButton } from "./AddButton";
import { VariantSelector } from "@/ui/components/VariantSelector";
import { ProductImageWrapper } from "@/ui/atoms/ProductImageWrapper";
import { executeGraphQL } from "@/lib/graphql";
import { formatMoney, formatMoneyRange } from "@/lib/utils";
import { addToCartAction } from "./actions";
import { ProductDetailsDocument } from "@/gql/graphql";
import { AvailabilityMessage } from "@/ui/components/AvailabilityMessage";

export const dynamic = "force-dynamic";

// ✅ 공통 안전 헬퍼: 장애 시 500 대신 null 반환
async function safeGetProduct(params: { slug: string; channel: string }) {
	try {
		const { product } = await executeGraphQL(ProductDetailsDocument, {
			variables: {
				slug: decodeURIComponent(params.slug),
				channel: params.channel,
			},
			revalidate: 0, // 장애 구간 캐시 혼선 제거
			withAuth: false,
		});

		return product ?? null;
	} catch (e) {
		console.error("ProductDetails fetch failed:", e);
		return null;
	}
}

export async function generateMetadata(
	props: {
		params: Promise<{ slug: string; channel: string }>;
		searchParams: Promise<{ variant?: string }>;
	},
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const [searchParams, params] = await Promise.all([props.searchParams, props.params]);

	const product = await safeGetProduct(params);
	if (!product) notFound();

	const productName = product.seoTitle || product.name;
	const variantName = product.variants?.find(({ id }) => id === searchParams.variant)?.name;
	const productNameAndVariant = variantName ? `${productName} - ${variantName}` : productName;

	return {
		title: `${product.name} | ${product.seoTitle || (await parent).title?.absolute}`,
		description: product.seoDescription || productNameAndVariant,
		alternates: {
			canonical: process.env.NEXT_PUBLIC_STOREFRONT_URL
				? process.env.NEXT_PUBLIC_STOREFRONT_URL + `/products/${encodeURIComponent(params.slug)}`
				: undefined,
		},
		openGraph: product.thumbnail
			? {
				images: [
					{
						url: product.thumbnail.url,
						alt: product.name,
					},
				],
			}
			: null,
	};
}

// Disable static generation during build to avoid API timeouts
export const dynamicParams = true;

export async function generateStaticParams(_params: { params: { channel: string } }) {
	return [];
}

const parser = edjsHTML();

export default async function Page(props: {
	params: Promise<{ slug: string; channel: string }>;
	searchParams: Promise<{ variant?: string }>;
}) {
	const [searchParams, params] = await Promise.all([props.searchParams, props.params]);

	const product = await safeGetProduct(params);
	if (!product) notFound();

	const firstImage = product.thumbnail;

	// ✅ description 파싱 안전화 (덤프 데이터 섞이면 여기서 랜덤 500 나기 쉬움)
	let description: string[] | null = null;
	try {
		if (product?.description) {
			description = parser.parse(JSON.parse(product.description));
		}
	} catch (e) {
		console.error("Invalid product.description JSON:", e);
		description = null;
	}

	const variants = product.variants;
	const selectedVariantID = searchParams.variant;
	const selectedVariant = variants?.find(({ id }) => id === selectedVariantID);

	const isAvailable = variants?.some((variant) => variant.quantityAvailable) ?? false;

	const price = selectedVariant?.pricing?.price?.gross
		? formatMoney(selectedVariant.pricing.price.gross.amount, selectedVariant.pricing.price.gross.currency)
		: isAvailable
			? formatMoneyRange({
				start: product?.pricing?.priceRange?.start?.gross,
				stop: product?.pricing?.priceRange?.stop?.gross,
			})
			: "";

	const productJsonLd: WithContext<Product> = {
		"@context": "https://schema.org",
		"@type": "Product",
		image: product.thumbnail?.url,
		...(selectedVariant
			? {
				name: `${product.name} - ${selectedVariant.name}`,
				description: product.seoDescription || `${product.name} - ${selectedVariant.name}`,
				offers: {
					"@type": "Offer",
					availability: selectedVariant.quantityAvailable
						? "https://schema.org/InStock"
						: "https://schema.org/OutOfStock",
					priceCurrency: selectedVariant.pricing?.price?.gross.currency,
					price: selectedVariant.pricing?.price?.gross.amount,
				},
			}
			: {
				name: product.name,
				description: product.seoDescription || product.name,
				offers: {
					"@type": "AggregateOffer",
					availability: product.variants?.some((variant) => variant.quantityAvailable)
						? "https://schema.org/InStock"
						: "https://schema.org/OutOfStock",
					priceCurrency: product.pricing?.priceRange?.start?.gross.currency,
					lowPrice: product.pricing?.priceRange?.start?.gross.amount,
					highPrice: product.pricing?.priceRange?.stop?.gross.amount,
				},
			}),
	};

	return (
		<section className="mx-auto grid max-w-7xl p-8">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(productJsonLd),
				}}
			/>
			<form className="grid gap-2 sm:grid-cols-2 lg:grid-cols-8" action={addToCartAction}>
				<input type="hidden" name="channel" value={params.channel} />
				<input type="hidden" name="variantId" value={selectedVariantID || ""} />
				<div className="md:col-span-1 lg:col-span-5">
					{firstImage && (
						<ProductImageWrapper
							priority={true}
							alt={firstImage.alt ?? ""}
							width={1024}
							height={1024}
							src={firstImage.url}
						/>
					)}
				</div>
				<div className="flex flex-col pt-6 sm:col-span-1 sm:px-6 sm:pt-0 lg:col-span-3 lg:pt-16">
					<div>
						<h1 className="mb-4 flex-auto text-3xl font-medium tracking-tight text-neutral-900">{product?.name}</h1>
						<p className="mb-8 text-sm " data-testid="ProductElement_Price">
							{price}
						</p>

						{variants && (
							<VariantSelector
								selectedVariant={selectedVariant}
								variants={variants}
								product={product}
								channel={params.channel}
							/>
						)}
						<AvailabilityMessage isAvailable={isAvailable} />
						<div className="mt-8">
							<AddButton disabled={!selectedVariantID || !selectedVariant?.quantityAvailable} />
						</div>
						{description && (
							<div className="mt-8 space-y-6 text-sm text-neutral-500">
								{description.map((content) => (
									<div key={content} dangerouslySetInnerHTML={{ __html: xss(content) }} />
								))}
							</div>
						)}
					</div>
				</div>
			</form>
		</section>
	);
}
