"use client";

import { ReactNode, useEffect, useState } from "react";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";
import LoaderUI from "../LoaderUI";
import { streamTokenProvider } from "@/actions/stream.actions";



const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
export default function StreamClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [streamVideoClient, setStreamVideoClient] = useState<StreamVideoClient | null>(null);
  const { user, isLoaded } = useUser();

   // Valeurs simples : l'effet ne se relance que si l'utilisateur change réellement
  const userId = user?.id;
  const userName =
    user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.id;
  const userImage = user?.imageUrl;

  useEffect(() => {
    if (!isLoaded || !userId) return;

    if (!apiKey) {
      console.error("NEXT_PUBLIC_STREAM_API_KEY est manquant");
      return;
    }

    // Création du client vidéo Stream pour l'utilisateur courant
    const client = new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      user: {
        id: userId,
        name: userName,
        image: userImage || undefined,
      },
      tokenProvider: streamTokenProvider,
    });

    setStreamVideoClient(client);

    // Nettoyage : s'exécute à la déconnexion (user devient null) et au démontage
    return () => {
      client.disconnectUser();
      setStreamVideoClient(null);
    };
  }, [userId, isLoaded, userName, userImage]);


  // 1. Clerk est encore en cours de chargement
  if (!isLoaded) return <LoaderUI />;

  // 2. Déconnecté : aucun client Stream n'existera, on n'attend donc pas
  if (!user) return <>{children}</>;

  // Affichage du loader tant que le client vidéo n'est pas initialisé
  if (!streamVideoClient) {
    return <LoaderUI />;
  }

  return <StreamVideo client={streamVideoClient}>{children}</StreamVideo>;
}