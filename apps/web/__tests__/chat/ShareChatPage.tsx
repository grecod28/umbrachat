import { render, screen, act } from "@testing-library/react";
import { Suspense } from "react";
import ShareChatPage from "@/app/[locale]/chat/[id]/share/page";

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ isPrivate: false }),
  });
});

it("Renders share page with title and copy button", async () => {
  await act(async () => {
    render(
      <Suspense>
        <ShareChatPage params={Promise.resolve({ id: "uuid-1" })} />
      </Suspense>,
    );
  });

  expect(screen.getByText("title")).toBeInTheDocument();
  expect(screen.getByText("description")).toBeInTheDocument();
  expect(screen.getByText("copy")).toBeInTheDocument();
  expect(screen.getByText("share")).toBeInTheDocument();
  expect(screen.getByText("backToChat")).toBeInTheDocument();
});
