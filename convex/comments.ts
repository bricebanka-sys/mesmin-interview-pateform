import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


// Ajouter un commentaire et une note (1 à 5) sur un entretien
export const addComment = mutation({
  args: {
    interviewId: v.id("interviews"),
    content: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Non autorisé : authentification requise");
    }

    return await ctx.db.insert("comments", {
      interviewId: args.interviewId,
      content: args.content,
      rating: args.rating,
      interviewerId: identity.subject,
    });
  },
});

// Récupérer tous les commentaires pour un entretien spécifique

export const getComments = query({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_interview_id", (q) => q.eq("interviewId", args.interviewId))
      .collect();
  },
});