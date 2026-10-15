import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


// Récupérer la liste de tous les entretiens
export const getAllInterviews = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non autorisé");

    return await ctx.db.query("interviews").collect();
  },
});


// Récupérer les entretiens propres au candidat connecté
export const getMyInterviews = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("interviews")
      .withIndex("by_candidate_id", (q) => q.eq("candidateId", identity.subject))
      .collect();
  },
});


// Récupérer un entretien à partir de son identifiant d'appel Stream
export const getInterviewByStreamCallId = query({
  args: { streamCallId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interviews")
      .withIndex("by_stream_call_id", (q) => q.eq("streamCallId", args.streamCallId))
      .first();
  },
});


// Créer un nouvel entretien programmé
export const createInterview = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    status: v.string(),
    streamCallId: v.string(),
    candidateId: v.string(),
    interviewerIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non autorisé");

    return await ctx.db.insert("interviews", {
      title: args.title,
      description: args.description,
      startTime: args.startTime,
      status: args.status,
      streamCallId: args.streamCallId,
      candidateId: args.candidateId,
      interviewerIds: args.interviewerIds,
    });
  },
});

// Mettre à jour le statut d'un entretien et enregistrer l'heure de fin si l'entretien est complété
export const updateInterviewStatus = mutation({
  args: {
    id: v.id("interviews"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non autorisé : authentification requise");

    const updates: { status: string; endTime?: number } = {
      status: args.status,
    };

    // Si l'entretien est marqué comme terminé, on enregistre l'horodatage actuel de fin
    if (args.status === "completed") {
      updates.endTime = Date.now();
    }

    return await ctx.db.patch(args.id, updates);
  },
});




export const deleteInterview = mutation({
  args: { id: v.id("interviews") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated user");

    // Vous pouvez ajouter ici des vérifications de rôle si nécessaire,
    // par exemple vérifier si l'utilisateur est bien l'interviewer ou le candidat concerné.

    await ctx.db.delete(args.id);
  },
});

// export const getCandidateInterviews = query({
//   handler: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new Error("Non authentifié");

//     // Récupérer les entretiens où le candidateId correspond à l'utilisateur connecté
//     return await ctx.db
//       .query("interviews")
//       .withIndex("by_candidate_id", (q) => q.eq("candidateId", identity.subject))
//       .collect();
//   },
// });