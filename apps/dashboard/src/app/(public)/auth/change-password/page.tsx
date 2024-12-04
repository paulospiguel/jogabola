import { ChangePasswordForm } from "@/components/auth/change-password-form";
import React, { Suspense } from "react";

const ChangePassword = () => {
  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center">
      <Suspense>
        <ChangePasswordForm />
      </Suspense>
    </div>
  );
};

export default ChangePassword;
