import crypto from "node:crypto";
import { importJWK, SignJWT } from "jose";

const ALLOWED_MATCH_TYPES = new Set(["offline", "gaming"]);
const ALLOWED_ENVIRONMENTS = new Set(["local", "production"]);

const READ_TOKEN_LIFETIME_SECONDS = 10 * 60;

const CHAT_JWT_ALGORITHM = "ES256";
const CHAT_JWT_ROLE = "anon";
const CHAT_JWT_AUDIENCE = "anon";

const CHAT_SUPABASE_URL = process.env.CHAT_SUPABASE_URL;
const CHAT_JWT_KID = process.env.CHAT_JWT_KID;
const CHAT_ENVIRONMENT = process.env.CHAT_ENVIRONMENT;
const CHAT_JWT_PRIVATE_KEY = process.env.CHAT_JWT_PRIVATE_KEY;

if (!CHAT_SUPABASE_URL) {
  throw new Error("CHAT_SUPABASE_URL is not configured");
}

if (!CHAT_JWT_KID) {
  throw new Error("CHAT_JWT_KID is not configured");
}

if (!CHAT_JWT_PRIVATE_KEY) {
  throw new Error("CHAT_JWT_PRIVATE_KEY is not configured");
}

if (!ALLOWED_ENVIRONMENTS.has(CHAT_ENVIRONMENT)) {
  throw new Error("CHAT_ENVIRONMENT must be local or production");
}

const CHAT_JWT_ISSUER = `${CHAT_SUPABASE_URL}/auth/v1`;

let privateKeyPromise;

/*
 * Import the private key once and reuse the resulting
 * CryptoKey for subsequent token generation.
 *
 * The private JWK itself is never exposed outside this
 * module.
 */
const getPrivateKey = async () => {
  if (!privateKeyPromise) {
    privateKeyPromise = importJWK(
      JSON.parse(CHAT_JWT_PRIVATE_KEY),
      CHAT_JWT_ALGORITHM,
    ).catch((error) => {
      privateKeyPromise = undefined;

      throw new Error(`Unable to load Chat JWT private key: ${error.message}`);
    });
  }

  return privateKeyPromise;
};

const validateMatch = (matchType, matchId) => {
  if (!ALLOWED_MATCH_TYPES.has(matchType)) {
    throw new Error("Invalid chat match type");
  }

  const numericMatchId = Number(matchId);

  if (!Number.isInteger(numericMatchId) || numericMatchId <= 0) {
    throw new Error("Invalid chat match ID");
  }

  return numericMatchId;
};

const generateChatReadToken = async (matchType, matchId) => {
  const numericMatchId = validateMatch(matchType, matchId);

  const privateKey = await getPrivateKey();

  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    role: CHAT_JWT_ROLE,
    environment: CHAT_ENVIRONMENT,

    /*
     * These claims are consumed by the chat_messages
     * SELECT RLS policy.
     */
    chat_access: "read",
    chat_type: matchType,
    chat_id: String(numericMatchId),
  })
    .setProtectedHeader({
      alg: CHAT_JWT_ALGORITHM,
      kid: CHAT_JWT_KID,
      typ: "JWT",
    })
    .setIssuedAt(now)
    .setIssuer(CHAT_JWT_ISSUER)
    .setAudience(CHAT_JWT_AUDIENCE)
    .setSubject(crypto.randomUUID())
    .setExpirationTime(now + READ_TOKEN_LIFETIME_SECONDS)
    .sign(privateKey);
};

export default generateChatReadToken;
