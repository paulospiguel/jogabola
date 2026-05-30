"use client";

import { AnimatePresence, motion } from "framer-motion";
import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import RejectedAnimation from "@/assets/lottie/Rejected.json";
import SuccessAnimation from "@/assets/lottie/Success.json";
import { PAYMENT_STATUS } from "@/constants/payments";

const APPROVED_STATUSES = new Set<string>([
  PAYMENT_STATUS.PAID,
  PAYMENT_STATUS.APPROVED,
]);
const REJECTED_STATUSES = new Set<string>([
  PAYMENT_STATUS.FAILED,
  PAYMENT_STATUS.REJECTED,
]);

interface PaymentStatusChangeAnimationProps {
  paymentId: number;
  status: string;
}

/** Plays a one-shot lottie when the payment status changes vs the last value
 * the user saw (persisted in localStorage). Approved → Success, rejected →
 * Rejected. No animation on first view or unchanged status. */
export function PaymentStatusChangeAnimation({
  paymentId,
  status,
}: PaymentStatusChangeAnimationProps) {
  const [anim, setAnim] = useState<"success" | "reject" | null>(null);

  useEffect(() => {
    const key = `payment-status-seen-${paymentId}`;
    const prev = localStorage.getItem(key);

    if (prev && prev !== status) {
      if (APPROVED_STATUSES.has(status)) setAnim("success");
      else if (REJECTED_STATUSES.has(status)) setAnim("reject");
    }

    localStorage.setItem(key, status);
  }, [paymentId, status]);

  return (
    <AnimatePresence>
      {anim && (
        <motion.button
          type="button"
          aria-label="Fechar"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-arena-bg/75 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setAnim(null)}
        >
          <Lottie
            animationData={anim === "success" ? SuccessAnimation : RejectedAnimation}
            loop={false}
            onComplete={() => setTimeout(() => setAnim(null), 900)}
            style={{ width: 200, height: 200 }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
