import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // 1. Vérification du secret
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET manquant dans les variables d'environnement");
      return new Response("Configuration serveur invalide", { status: 500 });
    }

    // 2. Vérification des headers Svix
    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("Headers Svix manquants");
      return new Response("Headers Svix manquants", { status: 400 });
    }

    // 3. Récupération et vérification du payload
    const payload = await request.text();
    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
      evt = JSON.parse(payload) as WebhookEvent;
    } catch (err) {
      console.error("Erreur de vérification du webhook:", err);
      return new Response("Signature invalide", { status: 400 });
    }


    const eventType = evt.type;
    console.log(`Webhook Clerk reçu: ${eventType}`);

    // ============================================
    // GESTION DE LA CRÉATION D'UTILISATEUR
    // ============================================
    if (eventType === "user.created") {
      const {
        id,
        email_addresses,
        primary_email_address_id,
        first_name,
        last_name,
        image_url,
      } = evt.data;

      // Extraction FIABLE de l'email principal
      const primaryEmail = email_addresses.find(
        (email) => email.id === primary_email_address_id
      );

      // Fallback de sécurité si l'email principal n'est pas trouvé
      const email =
        primaryEmail?.email_address ?? email_addresses[0]?.email_address;

      if (!email) {
        console.error(`Aucun email trouvé pour l'utilisateur Clerk: ${id}`);
        return new Response("Email manquant dans le payload Clerk", {
          status: 400,
        });
      }

      // Gestion sécurisée du nom (first_name et last_name peuvent être null)
      const name =
        `${first_name || ""} ${last_name || ""}`.trim() || "Utilisateur";

      console.log(`👤 Création utilisateur: ${id} - ${email} - ${name}`);

      try {
        await ctx.runMutation(api.users.syncUser, {
          clerkId: id,
          email,
          name,
          image: image_url,
        });
        console.log(`Utilisateur ${id} synchronisé avec succès`);
      } catch (error) {
        console.error(
          `Erreur lors de la synchronisation de l'utilisateur ${id}:`,
          error
        );
        return new Response("Erreur serveur interne", { status: 500 });
      }
    }

    return new Response("Webhook processed successfully", { status: 200 });
  }),
});

export default http;