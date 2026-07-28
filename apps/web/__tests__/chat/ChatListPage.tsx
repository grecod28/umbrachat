import { render, screen, waitFor } from "@testing-library/react";
import ChatListPage from "@/app/[locale]/chat/page";

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn();
});

it("Renders empty chat list", async () => {
  localStorage.setItem("rooms", "[]");

  render(<ChatListPage />);

  await waitFor(() => {
    expect(screen.getByText("title")).toBeInTheDocument();
    expect(screen.getByText("empty")).toBeInTheDocument();
    expect(screen.getByText("create")).toBeInTheDocument();
  });
});

it("Renders chat list with rooms", async () => {
  localStorage.setItem("rooms", JSON.stringify(["uuid-1"]));
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => [
      {
        id: "uuid-1",
        name: "My Room",
        description: "Test description",
        createdAt: "2025-01-01T00:00:00.000Z",
        isPrivate: false,
      },
    ],
  });

  render(<ChatListPage />);

  await waitFor(() => {
    expect(screen.getByText("My Room")).toBeInTheDocument();
  });
});
