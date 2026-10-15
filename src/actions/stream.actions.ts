"use server";

import { currentUser } from "@clerk/nextjs/server";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export const streamTokenProvider = async () => {
  const user = await currentUser();

  if (!user) {
    throw new Error("user not authenticated");
  }

  if (!apiKey || !apiSecret) {
    throw new Error("Missing Stream API keys in the environment variables");
  }

  // Initialisation du client Stream Node.js avec la clé API et le secret
  const streamClient = new StreamClient(apiKey, apiSecret);

  // Génération du jeton utilisateur (remplace l'ancienne méthode createToken)
  const token = streamClient.generateUserToken({
    user_id: user.id,
  });

  return token;
}