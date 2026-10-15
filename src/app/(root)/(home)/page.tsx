"use client";

import ActionCard from "@/components/ActionCard";
import { QUICK_ACTIONS } from "@/constants";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import MeetingModal from "@/components/MeetingModal";
import LoaderUI from "@/components/LoaderUI";
import { Loader2Icon } from "lucide-react";
import MeetingCard from "@/components/MeetingCard";


export default function Home() {

  const router = useRouter();
  const {isInterviewer, isLoading} = useUserRole();

  // Récupération des entretiens de l'utilisateur via Convex
  const interviews = useQuery(api.interviews.getMyInterviews) || [];

  // États pour la modale de réunion
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"start" | "join">("start");

  const handleQuickAction = (title: string) =>{

    switch (title) {
      case "New Call":
        setModalType("start");
        setShowModal(true);
        break;
      case "Join Interview":
        setModalType("join");
        setShowModal(true);
        break;     
      default:
        router.push(`/${title.toLowerCase()}`);
        break;
    }
  };

  if (isLoading) {
    return (
      <LoaderUI />
    );
  }

  return (
  
    <div className="container max-w-7xl mx-auto p-6">
      {/* WELCOME SECTION */}
      <div className="relative overflow-hidden rounded-lg bg-card p-6 border border-blue-900/20 shadow-sm mb-10">
        {/* Accent bleu subtil en arrière-plan */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Welcome back!
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {isInterviewer
              ? "Manage your interviews and review candidates effectively"
              : "Access your upcoming interviews and preparations"}
          </p>
        </div>
      </div>

      {isInterviewer ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {QUICK_ACTIONS.map((action) => (
              <ActionCard
                key={action.title}
                action={action}
                onClick={() => handleQuickAction(action.title)}
              />
            ))}
          </div>

          {/* Modale de Réunion (Démarrer ou Rejoindre) */}
          <MeetingModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={modalType === "join" ? "Join Meeting" : "Start Meeting"}
            isJoinMeeting={modalType === "join"}
          />
        </>
      ) : (
        <>
          <div>
            <h1 className="text-3xl font-bold">Your Interviews & Results</h1>
            <p className="text-muted-foreground mt-1">View your upcoming sessions and see evaluation feedback once completed.</p>
          </div>

          <div className="mt-8">
            {interviews === undefined ? (
              <div className="flex justify-center py-12">
                <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : interviews.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {interviews.map((interview) => (
                  <MeetingCard key={interview._id} interview={interview} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                You have no scheduled interviews at the moment
              </div>
            )}
          </div>

        </>
      )}
    </div>
  );
}
