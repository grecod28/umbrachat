export const useSearchParams = () => new URLSearchParams();
export const useParams = () => ({});
export const useRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
});
export const usePathname = () => "/";
