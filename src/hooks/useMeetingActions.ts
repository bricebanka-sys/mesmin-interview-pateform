import { useRouter } from "next/navigation";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import toast from "react-hot-toast";

export const useMeetingActions = () => {
  const router = useRouter();
  const client = useStreamVideoClient();

  // Création d'une réunion instantanée
  const createInstantMeeting = async () => {
    if (!client) return;

    try {
      const id = crypto.randomUUID();
      const call = client.call("default", id);

      await call.getOrCreate({
        data: {
          starts_at: new Date().toISOString(),
          custom: {
            description: "Instant Meeting",
          },
        },
      });

      toast.success("Meeting successfully created !");
      router.push(`/meeting/${call.id}`);
    } catch (error) {
      console.error("Error when creating the meeting:", error);
      toast.error("Failed to create the meeting. Please try again.");
    }
  };

  // Rejoindre une réunion existante à partir d'un identifiant ou d'une URL
  const joinMeeting = (callId: string) => {
    if (!client) {
      return toast.error("Failed to join meeting. Please try again.");
    }
    router.push(`/meeting/${callId}`);

    try {
      // Extraction de l'ID de la réunion si l'utilisateur a collé une URL complète
      const meetingId = callId.includes("/meeting/")
        ? callId.split("/meeting/").pop()
        : callId;

      if (!meetingId) {
        toast.error("Invalid meeting ID.");
        return;
      }

      router.push(`/meeting/${meetingId}`);
    } catch (error) {
      console.error("Error whilst joining the meeting:", error);
      toast.error("Failed to connect to the meeting.");
    }
  };

  return { createInstantMeeting, joinMeeting };
};