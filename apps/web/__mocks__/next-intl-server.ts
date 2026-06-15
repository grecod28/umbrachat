export const getTranslations = jest.fn(
  async () => (key: string) => key,
);

export const getMessages = jest.fn(async () => ({}));
