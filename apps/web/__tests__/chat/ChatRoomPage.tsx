import { render, screen } from "@testing-library/react";
import ChatPage from "@/app/[locale]/chat/[id]/page";

jest.mock("@/app/[locale]/chat/[id]/_views/chat", () => ({
  __esModule: true,
  default: ({ roomId }: { roomId: string }) => <div data-testid="chat">Chat {roomId}</div>,
}));

jest.mock("@/app/[locale]/chat/[id]/_views/access-room", () => ({
  __esModule: true,
  default: ({ roomId }: { roomId: string }) => <div data-testid="access">Access {roomId}</div>,
}));

beforeEach(() => {
  global.fetch = jest.fn();
});

it("Renders public room with chat", async () => {
  (global.fetch as jest.Mock)
    .mockResolvedValueOnce({
      json: async () => ({ id: "uuid-1", name: "Public Room", isPrivate: false }),
    })
    .mockResolvedValueOnce({
      json: async () => [],
    });

  render(await ChatPage({ params: Promise.resolve({ id: "uuid-1" }) }));

  expect(screen.getByText("Public Room")).toBeInTheDocument();
  expect(screen.getByText("share")).toBeInTheDocument();
});

it("Renders access room for private room", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    json: async () => ({ id: "uuid-1", name: "Private Room", isPrivate: true }),
  });

  render(await ChatPage({ params: Promise.resolve({ id: "uuid-1" }) }));

  expect(screen.getByTestId("access")).toBeInTheDocument();
});
