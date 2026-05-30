export const API_URL = process.env.NEXT_PUBLIC_API_URL!;
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL!;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

if (!SOCKET_URL) {
  throw new Error("NEXT_PUBLIC_SOCKET_URL is not defined");
}
