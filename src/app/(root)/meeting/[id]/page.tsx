"use client";

import LoaderUI from "@/components/LoaderUI";
import MeetingRoom from "@/components/MeetingRoom";
import MeetingSetup from "@/components/MeetingSetup";
import { useGetCallById } from "@/hooks/useGetCallById";
import { useUser } from "@clerk/nextjs";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ThemeProvider } from "@/context/ThemeContext"; // Ajustez le chemin d'importation si nécessaire

function MeetingPage() {
  const { id } = useParams();
  const { isLoaded } = useUser();
  const { call, isCallLoading } = useGetCallById(id);

  // État pour basculer entre l'écran de configuration et la salle de réunion
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  if (!isLoaded || isCallLoading) {
    return <LoaderUI />;
  }

  if (!call) {
    return (
      <div className="h-[calc(100vh-65px)] flex items-center justify-center">
        <p className="text-xl font-semibold text-muted-foreground">
          Meeting not found
        </p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup onSetupComplete={() => setIsSetupComplete(true)} />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </ThemeProvider>
  );
}

export default MeetingPage;