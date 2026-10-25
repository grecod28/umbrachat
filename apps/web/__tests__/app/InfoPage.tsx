import { render, screen } from "@testing-library/react";
import HelpPage from "@/app/[locale]/(main)/info/page";

it("Renders info page with title and feature cards", async () => {
  render(await HelpPage());

  expect(screen.getByText("title")).toBeInTheDocument();
  expect(screen.getByText("description")).toBeInTheDocument();
  expect(screen.getAllByText("createRoom").length).toBeGreaterThan(0);
  expect(screen.getByText("createRoomDesc")).toBeInTheDocument();
  expect(screen.getByText("realTimeChat")).toBeInTheDocument();
  expect(screen.getByText("language")).toBeInTheDocument();
});
