import { importJWK, SignJWT } from "jose";

const ALLOWED_ENVIRONMENTS = new Set(["local", "production"]);

const WRITE_TOKEN_LIFETIME_SECONDS = 60 * 60;

const CHAT_JWT_ALGORITHM = "ES256";
const CHAT_JWT_ROLE = "authenticated";
const CHAT_JWT_AUDIENCE = "authenticated";

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
 * Load and import the private key once.
 *
 * The imported CryptoKey is cached so we don't repeatedly
 * parse and import the JWK for every chat message.
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

const validateUserId = (userId) => {
  const numericUserId = Number(userId);

  if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
    throw new Error("Invalid user ID");
  }

  return numericUserId;
};

const generateChatToken = async (userId) => {
  const numericUserId = validateUserId(userId);

  const privateKey = await getPrivateKey();

  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    /*
     * IMPORTANT:
     *
     * These claims are required by the chat_messages
     * INSERT RLS policy.
     */
    sportilo_user_id: String(numericUserId),
    environment: CHAT_ENVIRONMENT,
    role: CHAT_JWT_ROLE,
  })
    .setProtectedHeader({
      alg: CHAT_JWT_ALGORITHM,
      kid: CHAT_JWT_KID,
      typ: "JWT",
    })
    .setIssuedAt(now)
    .setIssuer(CHAT_JWT_ISSUER)
    .setAudience(CHAT_JWT_AUDIENCE)
    .setSubject(String(numericUserId))
    .setExpirationTime(now + WRITE_TOKEN_LIFETIME_SECONDS)
    .sign(privateKey);
};

export default generateChatToken;
