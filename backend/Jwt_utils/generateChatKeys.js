import crypto from "node:crypto";
import { generateKeyPair, exportJWK } from "jose";

/*
 * ONE-TIME CHAT JWT KEY GENERATOR
 *
 * This file is NOT part of the application runtime.
 *
 * Run it manually when creating a new Chat JWT key pair.
 *
 * IMPORTANT:
 * Never regenerate these keys during normal server startup.
 * The generated private key must be stored securely as:
 *
 * CHAT_JWT_PRIVATE_KEY
 *
 * The generated KID must be stored as:
 *
 * CHAT_JWT_KID
 */

const ALGORITHM = "ES256";
const KEY_USAGE = "sig";

const generateChatJwtKeys = async () => {
  const { privateKey, publicKey } = await generateKeyPair(ALGORITHM, {
    extractable: true,
  });

  const privateJwk = await exportJWK(privateKey);
  const publicJwk = await exportJWK(publicKey);

  const kid = crypto.randomUUID();

  const privateKeyJwk = {
    ...privateJwk,
    kid,
    alg: ALGORITHM,
    use: KEY_USAGE,
  };

  const publicKeyJwk = {
    ...publicJwk,
    kid,
    alg: ALGORITHM,
    use: KEY_USAGE,
  };

  console.log("\n========================================");
  console.log("CHAT JWT KEY PAIR");
  console.log("========================================");

  console.log("\nCHAT_JWT_PRIVATE_KEY=");
  console.log(JSON.stringify(privateKeyJwk));

  console.log("\nCHAT_JWT_PUBLIC_KEY=");
  console.log(JSON.stringify(publicKeyJwk));

  console.log("\nCHAT_JWT_KID=");
  console.log(kid);

  console.log("\n========================================");
  console.log("IMPORTANT");
  console.log("========================================");
  console.log("Store the PRIVATE key securely.");
  console.log("Never expose it to the frontend.");
  console.log("Never commit it to Git.");
  console.log("========================================\n");
};

generateChatJwtKeys().catch((error) => {
  console.error("Failed to generate Chat JWT keys:", error);
  process.exitCode = 1;
});
