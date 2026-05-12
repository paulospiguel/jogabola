import { notFound } from "next/navigation";
import { PaymentResultClient } from "./_components/payment-result-client";

interface Props {
  params: Promise<{ id: string; paymentId: string }>;
}

export default async function PaymentResultPage({ params }: Props) {
  const { id, paymentId } = await params;
  const eventId = parseInt(id, 10);
  const paymentIdNum = parseInt(paymentId, 10);

  if (Number.isNaN(eventId) || Number.isNaN(paymentIdNum)) {
    notFound();
  }

  return <PaymentResultClient paymentId={paymentIdNum} eventId={eventId} />;
}
