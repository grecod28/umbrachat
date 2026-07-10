import { render, screen } from "@testing-library/react";
import ConfigLanguagePage from "@/app/[locale]/config/language/page";

it("Renders language config page with selector", () => {
  render(<ConfigLanguagePage />);

  expect(screen.getAllByText("title").length).toBeGreaterThanOrEqual(1);
  expect(screen.getByText("description")).toBeInTheDocument();
});
