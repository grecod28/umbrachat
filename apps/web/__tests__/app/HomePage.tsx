import { render, screen } from "@testing-library/react";
import Home from "@/app/[locale]/(main)/page";

jest.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/",
  redirect: jest.fn(),
}));

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn(async () => (key: string) => key),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    priority: _priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => (
    <img {...props} />
  ),
}));

it("Renders example page", async () => {
  render(await Home());

  expect(screen.getByText("UmbraChat")).toBeInTheDocument();
});
