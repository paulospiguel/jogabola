"use client";

import { Logo } from "@/components/logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon } 
import { useRouter, useSearchParams } from "next/navigation";

const ErrorPage = () => {
  const search = useSearchParams();
  const router = useRouter();

  const error = search.get("error");

  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center bg-primary dark:bg-primary-dark">
      <div className="mx-4 flex w-full max-w-xl flex-col items-center space-y-4">
        <Logo />
        <Alert className="flex h-[200px] flex-col items-center justify-center text-center">
          <AlertTitle className="mb-1 mt-4 flex gap-2 text-lg">
            <AlertTriangleIcon className="mr-0 size-[2rem] stroke-orange-500" />
            <span className="text-2xl">Authentication Error!</span>
          </AlertTitle>
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
        <Button
          className="w-full text-secondary"
          variant="link"
          onClick={e => {
            e.preventDefault();
            router.push("/");
          }}
        >
          Ir para a página inicial
        </Button>
      </div>
    </div>
  );
};

export default ErrorPage;
