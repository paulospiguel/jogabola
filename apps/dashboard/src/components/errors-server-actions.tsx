import { Alert } from "@repo/ui/components/alert";
import * as React from "react";

type Props = {
  errors: {
    serverError?: string;
    fetchError?: string;
    validationErrors?: Record<string, string[] | undefined> | undefined;
  };
};

export function ErrorsServerActionResponse({ errors }: Props) {
  const { serverError, fetchError, validationErrors } = errors || {};

  const hasError = !!serverError || !!fetchError || !!validationErrors;

  if (!hasError) {
    return null;
  }

  console.log({ serverError, fetchError, validationErrors });

  return (
    <div className="py-4">
      {serverError ? (
        <div className="my-2 text-red-500">
          <Alert variant="error">An error occurred on the server</Alert>
        </div>
      ) : null}

      {fetchError ? (
        <div className="my-2 text-red-500">
          <Alert variant="error">An error occurred on the client</Alert>
        </div>
      ) : null}

      {validationErrors ? (
        <div className="my-2 text-red-500">
          <Alert variant="error">
            {Object.keys(validationErrors)?.map(key => (
              <p
                key={key}
              >{`${key}: ${!!validationErrors && validationErrors[key as keyof typeof validationErrors]}`}</p>
            ))}
          </Alert>
        </div>
      ) : null}
    </div>
  );
}
