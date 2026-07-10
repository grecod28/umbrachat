import { render, screen } from "@testing-library/react";
import NotFound from "@/app/[locale]/(main)/[...not-found]/page";

it("Renders 404 page with heading and CTA", async () => {
  render(await NotFound());

  expect(screen.getByText("title")).toBeInTheDocument();
  expect(screen.getByText("heading")).toBeInTheDocument();
  expect(screen.getByText("description")).toBeInTheDocument();
  expect(screen.getByText("cta")).toBeInTheDocument();
});
