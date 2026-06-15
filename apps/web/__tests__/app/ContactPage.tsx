import { render, screen } from "@testing-library/react";
import ContactPage from "@/app/[locale]/(main)/contact/page";

it("Renders contact page with social links", async () => {
  render(await ContactPage());

  expect(screen.getByText("title")).toBeInTheDocument();
  expect(screen.getByText("description")).toBeInTheDocument();
  expect(screen.getByText("Instagram")).toBeInTheDocument();
  expect(screen.getByText("TikTok")).toBeInTheDocument();
  expect(screen.getByText("Gmail")).toBeInTheDocument();
  expect(screen.getAllByText("@umbrachat")).toHaveLength(3);
});
