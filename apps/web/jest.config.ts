import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(t|j)sx?$": "<rootDir>/node_modules/next/dist/build/swc/jest-transformer.js",
  },
  transformIgnorePatterns: [],
  moduleNameMapper: {
    "^@/i18n/navigation$": "<rootDir>/__mocks__/i18n-navigation.tsx",
    "^@/libs/constants/api$": "<rootDir>/__mocks__/api-constants.ts",
    "^next-intl/server$": "<rootDir>/__mocks__/next-intl-server.ts",
    "^next-intl$": "<rootDir>/__mocks__/next-intl.tsx",
    "^next/image$": "<rootDir>/__mocks__/next-image.tsx",
    "^next/link$": "<rootDir>/__mocks__/next-link.tsx",
    "^next/navigation$": "<rootDir>/__mocks__/next-navigation.ts",
    "^@/libs/hooks/use-typing-sound$": "<rootDir>/__mocks__/use-typing-sound.ts",
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$": "<rootDir>/__mocks__/fileMock.js",
  },
};

export default config;
