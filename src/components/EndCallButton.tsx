"use client";

import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import { PhoneOffIcon } from "lucide-react";
import { Button } from "./ui/button";
import toast from "react-hot-toast";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

function EndCallButton() {
  const call = useCall();
  const router = useRouter();

  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  // Récupération de l'entretien associé à l'ID d'appel Stream courant
  const interview = useQuery(
    api.interviews.getInterviewByStreamCallId,
    call?.id ? { streamCallId: call.id } : "skip"
  );

  // Mutation Convex pour mettre à jour le statut de l'entretien (ex: "completed")
  const updateInterviewStatus = useMutation(api.interviews.updateInterviewStatus);

  // Only the meeting creator can end the call for everyone && // Vérifier si l'utilisateur connecté est le créateur de l'appel ou un interviewer
  const isMeetingOwner =
    localParticipant &&
    call?.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

    // Si l'utilisateur n'est ni le propriétaire ni un interviewer, on n'affiche pas le bouton
  if (!call || !isMeetingOwner) return null;

  const endCall = async () => {

    try {
      if (!call) return;
      // Mettre à jour le statut de l'entretien dans Convex (passe à "completed" et enregistre l'heure de fin)
      // Mettre à jour le statut de l'entretien dans Convex uniquement s'il existe en base de données
      if (interview && interview._id) {
        await updateInterviewStatus({
          id: interview._id,
          status: "completed",
        });
      }

      // Mettre fin à l'appel pour tous les participants via le SDK Stream
      await call.endCall();

      toast.success("The interview ended for everyone.");
      router.push("/");
    } catch (error) {
      console.error("Erreur lors de la clôture de l'appel :", error);
      toast.error("Failure to close the maintenance task.");
    }
  };

  return (
    <Button
      onClick={endCall}
      title="End the interview for all participants"
      className="gap-2 bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500/40"
    >
      <PhoneOffIcon className="size-4" />
      <span className="hidden sm:inline">End interview</span>
    </Button>
  );
}

export default EndCallButton;