import { render, screen } from "@testing-library/react";
import Home from "@/app/[locale]/(main)/page";

it("Renders home page with title and CTA buttons", async () => {
  render(await Home());

  expect(screen.getByText("UmbraChat")).toBeInTheDocument();
  expect(screen.getByText("welcome")).toBeInTheDocument();
  expect(screen.getByText("description")).toBeInTheDocument();
  expect(screen.getByText("createRoom")).toBeInTheDocument();
  expect(screen.getByText("searchRoom")).toBeInTheDocument();
});
