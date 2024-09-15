import { useEffect } from "react";
import {
	useForm,
	type UseFormReturn,
	type FieldValues,
	type Path,
	type Resolver,
	type DefaultValues,
} from "react-hook-form";

export type UseFormPersistReturn<T extends FieldValues> = UseFormReturn<T>;

type UseFormPersistProps<T extends FieldValues> = {
	storageKey: string;
	storageLocation?: Storage;
	includeDirtyFields?: boolean;
	resolver?: Resolver<T, unknown>;
	defaultValues?: DefaultValues<T>;
	values?: T;
	callback?: (values: T, isSubmitting: boolean, isSubmitted: boolean) => void;
};

export function useFormPersist<T extends FieldValues>({
	storageKey,
	storageLocation = localStorage,
	includeDirtyFields = false,
	resolver,
	defaultValues,
	values,
	callback,
}: UseFormPersistProps<T>): UseFormPersistReturn<T> {
	const methods = useForm<T>({
		resolver,
		defaultValues,
		values,
	});
	const { formState, setValue, watch } = methods;
	const { dirtyFields, isSubmitting, isSubmitted } = formState;
	const valuesToPersist = watch();

	if (!storageKey) {
		throw new Error("Storage Key is required");
	}

	// Retrieve values from storage on mount
	useEffect(() => {
		const storedData: string | null = storageLocation.getItem(storageKey);
		if (storedData && !isSubmitted) {
			const { values, dirtyFields: currDirtyFields } = JSON.parse(storedData);
			const keys = Object.keys(values);

			for (const key of keys) {
				setValue(key as Path<T>, values[key], {
					shouldDirty: includeDirtyFields && !!currDirtyFields[key],
				});
			}
		}

		return () => {
			storageLocation.removeItem(storageKey);
		};
	}, [storageKey, storageLocation, includeDirtyFields, setValue, isSubmitted]);

	// Persist values and dirty fields to storage
	useEffect(() => {
		const dirtyFieldsToPersist = Object.keys(dirtyFields).reduce(
			(acc, key) => {
				acc[key] = true;
				return acc;
			},
			{} as Record<string, boolean>,
		);

		if (Object.keys(dirtyFieldsToPersist).length > 0) {
			const dataToPersist = JSON.stringify({
				values: valuesToPersist,
				dirtyFields: dirtyFieldsToPersist,
			});
			storageLocation.setItem(storageKey, dataToPersist);
		}
	}, [valuesToPersist, dirtyFields, storageKey, storageLocation]);

	// Remove storage on form submission
	useEffect(() => {
		if (isSubmitting) {
			storageLocation.removeItem(storageKey);
			if (callback) {
				callback(valuesToPersist, isSubmitting, isSubmitted);
			}
		}
	}, [isSubmitting, storageKey, storageLocation, valuesToPersist, callback, isSubmitted]);

	return { ...methods };
}
