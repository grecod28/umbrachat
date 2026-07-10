import React from "react";

export const Link = ({
  children,
  href,
  ...props
}: {
  children: React.ReactNode;
  href: string;
  [key: string]: unknown;
}) => (
  <a href={href} {...props}>
    {children}
  </a>
);

export const useRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
});

export const usePathname = () => "/";

export const redirect = jest.fn();
