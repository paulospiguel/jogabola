import EmailVerificationForm from "@/components/auth/email-verification-form";
import { Suspense } from "react";

const VerifyEmail = () => {
  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center">
      <Suspense>
        <EmailVerificationForm />
      </Suspense>
    </div>
  );
};

export default VerifyEmail;
