export const useTypingSound = () => ({
  withSound: (fn: (...args: unknown[]) => unknown) => fn,
  playKeySound: jest.fn(),
});
