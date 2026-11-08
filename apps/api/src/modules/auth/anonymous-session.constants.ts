export const ANONYMOUS_SESSION_HEADER = 'x-umbra-session';
export const ANONYMOUS_SESSION_AUDIENCE = 'umbra:anonymous-session';
export const ANONYMOUS_SESSION_TYPE = 'anonymous-session';
export const ANONYMOUS_SESSION_TTL_SECONDS = 24 * 60 * 60;

export type AnonymousSession = {
  id: string;
};
