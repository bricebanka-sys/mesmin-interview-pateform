"use client";

import { CalendarIcon, CheckCircle2Icon, Trash2Icon, VideoIcon, XCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { Doc } from "../../convex/_generated/dataModel";
import { getMeetingStatus } from "@/lib/utils";
import { api } from "../../convex/_generated/api";
import { useMutation } from "convex/react";
import toast from "react-hot-toast";

interface MeetingCardProps {
  interview: Doc<"interviews">;
}

export default function MeetingCard({ interview }: MeetingCardProps) {
  const router = useRouter();

  const formattedDate = interview.startTime
    ? format(new Date(interview.startTime), "MMMM d, yyyy · h:mm", { locale: enUS })
    : "Date not specified";

  const status = getMeetingStatus(interview);
  const deleteInterviewMutation = useMutation(api.interviews.deleteInterview);

  const handleJoin = () => {
    router.push(`/meeting/${interview.streamCallId}`);
  };


  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this interview? ?")) {
      try {
        await deleteInterviewMutation({ id: interview._id });
        toast.success("Interview successfully deleted");
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        toast.error("Failure to delete interview");
      }
    }
  };

  return (
    <Card className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:border-[#2664EC]/40 hover:shadow-md dark:border-white/10 dark:bg-[#0F1629]">
      <CardHeader className="p-5 pb-3">
        {/* En-tête flex : Badge à gauche, Date/Heure et Bouton de suppression à droite */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              status === "live"
                ? "bg-red-500/10 text-red-600 border border-red-500/20 dark:text-red-400"
                : status === "upcoming"
                ? "bg-[#2664EC]/10 text-[#2664EC] border border-[#2664EC]/20 dark:text-[#8FB3FF]"
                : status === "succeeded"
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400"
                : status === "failed"
                ? "bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:text-rose-400"
                : "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10"
            }`}
          >
            {status === "succeeded" ? (
              <CheckCircle2Icon className="size-3.5" />
            ) : status === "failed" ? (
              <XCircleIcon className="size-3.5" />
            ) : (
              <VideoIcon className="size-3.5" />
            )}
            <span className="uppercase">
              {status === "succeeded" ? "Passed" : status === "failed" ? "Failed" : status}
            </span>
          </span>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <CalendarIcon className="size-3.5 text-[#2664EC]" />
              <span className="capitalize">{formattedDate}</span>
            </div>
            {/* Bouton de suppression */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="size-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors rounded-lg"
              title="Supprimer l'entretien"
            >
              <Trash2Icon className="size-3.5" />
            </Button>
          </div>
        </div>

        <CardTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          {interview.title}
        </CardTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
          {interview.description || "No description provided."}
        </p>
      </CardHeader>

      <CardContent className="p-5 pt-0" />

      <CardFooter className="p-5 pt-0 flex items-center gap-2">
        {status === "live" ? (
          <Button
            className="w-full gap-2 bg-red-600 text-white hover:bg-red-700 shadow-sm"
            onClick={handleJoin}
          >
            <VideoIcon className="size-4 animate-pulse" />
            <span>Join Live Meeting</span>
          </Button>
        ) : status === "upcoming" ? (
          <Button
            className="w-full gap-2 bg-[#2664EC] text-white hover:bg-[#1F52BC]"
            onClick={handleJoin}
          >
            <VideoIcon className="size-4" />
            <span>Join Meeting</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full gap-2 border-slate-300 bg-white text-slate-500 hover:bg-slate-100 dark:border-white/15 dark:bg-transparent dark:text-slate-400 dark:hover:bg-white/10"
            disabled
          >
            <span>
              {status === "succeeded"
                ? "Interview Passed Successfully"
                : status === "failed"
                ? "Interview Not Passed"
                : "Completed"}
            </span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}