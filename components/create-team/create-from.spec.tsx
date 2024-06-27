import { expect, test } from "vitest";
import { CreateTeamForm } from "./create-form";
import { render, screen } from "@testing-library/react";

test("should render the form", () => {
	render(<CreateTeamForm />);
	expect(screen.getByText("Name da equipa")).toBeDefined();
});
