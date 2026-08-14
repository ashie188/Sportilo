const writeTokenCache = new Map();
const writeRequestCache = new Map();

const readTokenCache = new Map();
const readRequestCache = new Map();

const TOKEN_REFRESH_BUFFER = 60 * 1000;
const READ_TOKEN_REFRESH_BUFFER = 60 * 1000;

const getCacheKey = (matchType, matchId) => {
  return `${matchType}:${Number(matchId)}`;
};

const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    throw new Error("VITE_API_URL is not configured");
  }

  return apiUrl.replace(/\/+$/, "");
};

const validateMatch = (matchType, matchId) => {
  if (matchType !== "offline" && matchType !== "gaming") {
    throw new Error("Invalid chat match type");
  }

  const numericMatchId = Number(matchId);

  if (!Number.isInteger(numericMatchId) || numericMatchId <= 0) {
    throw new Error("Invalid chat match ID");
  }

  return numericMatchId;
};

const getSportiloToken = () => {
  try {
    const token = localStorage.getItem("token");

    return typeof token === "string" && token.trim() ? token : null;
  } catch {
    return null;
  }
};

const clearToken = (cache, cacheKey) => {
  cache.delete(cacheKey);
};

const hasValidToken = (cache, cacheKey, refreshBuffer) => {
  const cached = cache.get(cacheKey);

  if (
    !cached ||
    typeof cached.token !== "string" ||
    !cached.token ||
    !Number.isFinite(cached.expiresAt)
  ) {
    return false;
  }

  return Date.now() < cached.expiresAt - refreshBuffer;
};

const parseResponseBody = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const createHttpError = (message, status, body) => {
  const error = new Error(message);

  error.status = status;
  error.body = body;

  return error;
};

const requestChatToken = async ({
  endpoint,
  cache,
  requestCache,
  cacheKey,
  refreshBuffer,
  errorMessage,
  headers,
  forceRefresh = false,
}) => {
  if (!forceRefresh && hasValidToken(cache, cacheKey, refreshBuffer)) {
    return cache.get(cacheKey).token;
  }

  if (!forceRefresh && requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }

  const request = (async () => {
    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers,
      });

      const data = await parseResponseBody(response);

      if (!response.ok) {
        clearToken(cache, cacheKey);

        throw createHttpError(
          data?.message || errorMessage,
          response.status,
          data,
        );
      }

      if (typeof data?.token !== "string" || data.token.trim() === "") {
        clearToken(cache, cacheKey);

        throw new Error(errorMessage);
      }

      const expiresIn = Number(data.expiresIn);

      if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
        clearToken(cache, cacheKey);

        throw new Error("Invalid Chat JWT expiration");
      }

      cache.set(cacheKey, {
        token: data.token,
        expiresAt: Date.now() + expiresIn * 1000,
      });

      return data.token;
    } finally {
      requestCache.delete(cacheKey);
    }
  })();

  requestCache.set(cacheKey, request);

  return request;
};

/*
 * Read access
 *
 * Read tokens are not tied to a Sportilo user.
 * They are tied only to the match being viewed.
 */
export const getChatReadAccessToken = async (
  matchType,
  matchId,
  forceRefresh = false,
) => {
  const numericMatchId = validateMatch(matchType, matchId);

  const cacheKey = getCacheKey(matchType, numericMatchId);

  if (forceRefresh) {
    clearToken(readTokenCache, cacheKey);
  }

  return requestChatToken({
    endpoint: `${getApiBaseUrl()}/chat/view/${matchType}/${numericMatchId}`,
    cache: readTokenCache,
    requestCache: readRequestCache,
    cacheKey,
    refreshBuffer: READ_TOKEN_REFRESH_BUFFER,
    errorMessage: "Unable to load chat",
    forceRefresh,
  });
};

/*
 * Write access
 *
 * The write JWT belongs to the currently logged-in
 * Sportilo user.
 *
 * Therefore the cache key MUST include the user's
 * Sportilo authentication token. This prevents a
 * previously authenticated user's Chat JWT from
 * being reused after logout/login in the same SPA.
 */
export const getChatAccessToken = async (
  matchType,
  matchId,
  forceRefresh = false,
) => {
  const numericMatchId = validateMatch(matchType, matchId);

  const sportiloToken = getSportiloToken();

  if (!sportiloToken) {
    throw new Error("Please login to send messages.");
  }

  const matchKey = getCacheKey(matchType, numericMatchId);

  const cacheKey = `${matchKey}:${sportiloToken}`;

  if (forceRefresh) {
    clearToken(writeTokenCache, cacheKey);
  }

  return requestChatToken({
    endpoint: `${getApiBaseUrl()}/chat/access/${matchType}/${numericMatchId}`,
    cache: writeTokenCache,
    requestCache: writeRequestCache,
    cacheKey,
    refreshBuffer: TOKEN_REFRESH_BUFFER,
    errorMessage: "Unable to authorize chat",
    headers: {
      Authorization: `Bearer ${sportiloToken}`,
    },
    forceRefresh,
  });
};

export const clearChatAccessToken = (matchType, matchId) => {
  const numericMatchId = validateMatch(matchType, matchId);

  const matchKey = getCacheKey(matchType, numericMatchId);

  clearToken(readTokenCache, matchKey);
  readRequestCache.delete(matchKey);

  /*
   * Write cache entries contain the match key followed
   * by the Sportilo token, so remove all entries for
   * this match.
   */
  const writePrefix = `${matchKey}:`;

  for (const key of writeTokenCache.keys()) {
    if (key.startsWith(writePrefix)) {
      writeTokenCache.delete(key);
    }
  }

  for (const key of writeRequestCache.keys()) {
    if (key.startsWith(writePrefix)) {
      writeRequestCache.delete(key);
    }
  }
};
