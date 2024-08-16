import { vi } from "vitest";

vi.mock("next/navigation", () => {
	const useRouter = () => {};
	return { useRouter };
});
