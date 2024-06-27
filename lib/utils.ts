import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function generateOTP(numberOfDigits: number) {
	const digits = "0123456789";
	let OTP = "";
	const len = digits.length;
	for (let i = 0; i < numberOfDigits; i++) {
		OTP += digits[Math.floor(Math.random() * len)];
	}

	return OTP;
}

export const getSearchParams = <T = unknown>(search: string) => {
	const searchParams = new URLSearchParams(search);
	return {
		get: (key: string) => searchParams.get(key) as T,
	};
};
