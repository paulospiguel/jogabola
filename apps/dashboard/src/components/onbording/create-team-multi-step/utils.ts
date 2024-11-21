import { checkTeamByName } from "@/actions";

export const onCheckTeamName = async (teamName: string) => {
  const response = await checkTeamByName({ teamName });
  const { validationErrors, serverError, bindArgsValidationErrors } =
    response ?? {};

  const errors = new Set<string>();

  if (validationErrors?.teamName?._errors) {
    validationErrors.teamName._errors.forEach((error) => errors.add(error));
  }

  if (serverError?.length) {
    errors.add(serverError);
  }

  if (bindArgsValidationErrors?.length) {
    bindArgsValidationErrors.forEach((error) => errors.add(error));
  }

  if (errors.size) {
    return {
      hasError: true,
      errors,
    };
  } else {
    return {
      hasError: false,
    };
  }
};
