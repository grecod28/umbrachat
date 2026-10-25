import { render, screen } from "@testing-library/react";
import ContactPage from "@/app/[locale]/(main)/contact/page";

it("Renders contact page with social links", async () => {
  render(await ContactPage());

  expect(screen.getByText("title")).toBeInTheDocument();
  expect(screen.getByText("description")).toBeInTheDocument();
  expect(screen.getByText("instagramLabel")).toBeInTheDocument();
  expect(screen.getByText("tiktokLabel")).toBeInTheDocument();
  expect(screen.getByText("emailLabel")).toBeInTheDocument();
  expect(screen.getAllByText("@umbrachat")).toHaveLength(2);
});
