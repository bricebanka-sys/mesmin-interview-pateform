import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export const useUserRole = () => {
  const { user, isLoaded } = useUser();

  // Récupération de l'utilisateur en base de données Convex via son Clerk ID
  const userData = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // "skip" fait renvoyer undefined à useQuery : on ne considère donc "undefined"
  // comme un chargement que si une requête est réellement en cours (utilisateur connecté).
  // Déconnecté : isLoaded = true, aucun user -> plus de chargement.
  const isLoading = !isLoaded || (!!user?.id && userData === undefined);
  const isInterviewer = userData?.role === "interviewer";
  const isCandidate = userData?.role === "candidate";

  return {
    isLoading,
    isInterviewer,
    isCandidate,
    dbUser: userData,
  };
};