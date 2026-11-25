import ViewOrder from "@/components/orders/ViewOrder";

export default async function OrderViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ViewOrder id={id} />;
}