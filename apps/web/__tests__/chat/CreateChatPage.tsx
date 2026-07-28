import { render, screen } from "@testing-library/react";
import CreateChatPage from "@/app/[locale]/chat/(main)/create/page";

it("Renders create chat form with title and inputs", () => {
  render(<CreateChatPage />);

  expect(screen.getByText("title")).toBeInTheDocument();
  expect(screen.getByText("description")).toBeInTheDocument();
  expect(screen.getByText("name")).toBeInTheDocument();
  expect(screen.getByText("descriptionLabel")).toBeInTheDocument();
  expect(screen.getByText("visibility")).toBeInTheDocument();
  expect(screen.getByText("submit")).toBeInTheDocument();
});
