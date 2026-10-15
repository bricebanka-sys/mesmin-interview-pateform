"use client";

import { useEffect } from "react";
import LoaderUI from "@/components/LoaderUI";
import { useUserRole } from "@/hooks/useUserRole";
import { useRouter } from "next/navigation";
import InterviewScheduleUI from "./InterviewScheduleUI";

function SchedulePage() {
  const router = useRouter();
  const { isInterviewer, isLoading } = useUserRole();

  // Si l'utilisateur n'est pas un interviewer (ou est déconnecté), on le redirige vers l'accueil
  useEffect(() => {
    if (!isLoading && !isInterviewer) {
      router.replace("/");
    }
  }, [isLoading, isInterviewer, router]);

  if (isLoading || !isInterviewer) {
    return <LoaderUI />;
  }

  return <InterviewScheduleUI />;
}

export default SchedulePage;