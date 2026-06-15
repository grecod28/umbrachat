import { render, screen } from "@testing-library/react";
import SearchPage from "@/app/[locale]/(main)/search/page";

it("Renders empty search page with prompt message", async () => {
  render(await SearchPage({ searchParams: Promise.resolve({}) }));

  expect(screen.getByText("title")).toBeInTheDocument();
  expect(screen.getByText("description")).toBeInTheDocument();
  expect(screen.getByText("need")).toBeInTheDocument();
});

it("Renders search results when name is provided", async () => {
  global.fetch = jest.fn().mockResolvedValueOnce({
    json: async () => ({
      data: [
        {
          id: "uuid-1",
          name: "Test Room",
          description: "A test room",
          createdAt: "2025-01-01T00:00:00.000Z",
          lastMessageAt: "2025-01-01T01:00:00.000Z",
        },
      ],
      meta: { total: 1, lastPage: 1 },
    }),
  });

  render(
    await SearchPage({
      searchParams: Promise.resolve({ name: "test", page: "1" }),
    }),
  );

  expect(screen.getByText("Test Room")).toBeInTheDocument();
});

it("Shows no results message when search returns empty", async () => {
  global.fetch = jest.fn().mockResolvedValueOnce({
    json: async () => ({
      data: [],
      meta: { total: 0, lastPage: 1 },
    }),
  });

  render(
    await SearchPage({
      searchParams: Promise.resolve({ name: "nonexistent", page: "1" }),
    }),
  );

  expect(screen.getByText("noResults")).toBeInTheDocument();
});
