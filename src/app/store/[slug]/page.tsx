import StoreClient from "./StoreClient";

export async function generateStaticParams() {
  return [
    { slug: "kofi-tech" }
  ];
}

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <StoreClient slug={slug} />;
}
