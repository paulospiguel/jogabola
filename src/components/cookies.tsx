"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Cookies() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage?.getItem("cookie-consent");

    if (cookieConsent !== "accepted") {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    setShow(false);
    localStorage.setItem("cookie-consent", "accepted");
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
  };

  return (
    <div
      className={cn(
        "fixed right-0 bottom-0 left-0 z-50 px-4 py-6 sm:px-6 sm:py-8",
        "border-t border-white/8 bg-[#050312]/95 shadow-[0_-10px_40px_-15px_rgba(36,255,230,0.3)] backdrop-blur-xl transition-all duration-300 ease-in-out",
        { "invisible z-0 opacity-0": !show },
      )}
    >
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Cookie Consent</h3>
            <p className="text-muted-foreground">
              We use cookies to improve your experience on our site. By using
              our site you consent cookies. See our{" "}
              <Link href="/privacy-policy" className="text-primary">
                Privacy Policy
              </Link>{" "}
              for more information.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDecline} variant="outline">
              Decline
            </Button>
            <Button onClick={handleAccept}>Accept</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
