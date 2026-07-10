import { render, screen } from "@testing-library/react";
import ConfigShapePage from "@/app/[locale]/config/shape/page";

it("Renders shape config page with selectors", () => {
  render(<ConfigShapePage />);

  expect(screen.getByText("title")).toBeInTheDocument();
  expect(screen.getByText("description")).toBeInTheDocument();
  expect(screen.getByText("font")).toBeInTheDocument();
  expect(screen.getByText("size")).toBeInTheDocument();
  expect(screen.getByText("color")).toBeInTheDocument();
});
