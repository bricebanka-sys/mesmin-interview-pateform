"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import toast from "react-hot-toast";
import { Id, Doc } from "../../../../convex/_generated/dataModel";
import LoaderUI from "@/components/LoaderUI";
import { groupInterviews, getCandidateInfo } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { enUS } from "date-fns/locale";
import CommentDialog from "@/components/CommentDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, CheckCircle2Icon, Trash2Icon, XCircleIcon } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";


type Interview = Doc<"interviews">;

const INTERVIEW_CATEGORY = [
  { id: "upcoming", title: "Upcoming interviews", variant: "default" as const },
  { id: "completed", title: "To be evaluated / Completed", variant: "secondary" as const },
  { id: "succeeded", title: "Successful interviews", variant: "outline" as const },
  { id: "failed", title: "Failed interviews", variant: "destructive" as const },
];

// À l'intérieur de votre composant DashboardPage :

function DashboardPage() {
  const { isSignedIn } = useUser();
  const users = useQuery(api.users.getUsers, isSignedIn ? {} : "skip");
  const interviews = useQuery(api.interviews.getAllInterviews, isSignedIn ? {} : "skip");
  const updateStatus = useMutation(api.interviews.updateInterviewStatus);
  const deleteInterview = useMutation(api.interviews.deleteInterview);

  const handleStatusUpdate = async (interviewId: Id<"interviews">, status: string) => {
    try {
      await updateStatus({ id: interviewId, status });
      toast.success(`Interview marked as ${status}`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
      toast.error("Status update failed.");
    }
  };

  const handleDelete = async (interviewId: Id<"interviews">) => {
    if (window.confirm("Are you sure you want to delete this interview?")) {
      try {
        await deleteInterview({ id: interviewId });
        toast.success("Interview successfully deleted");
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        toast.error("Failure to delete interview");
      }
    }
  };

  if (!users || !interviews) {
    return <LoaderUI />;
  }

  const groupedInterviews = groupInterviews(interviews);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track and manage all of your recruitment sessions.
          </p>
        </div>
        <Link href="/schedule">
          <Button className="bg-[#2664EC] text-white hover:bg-[#1F52BC] shadow-sm">
            Schedule an interview
          </Button>
        </Link>
      </div>

      <div className="space-y-10">
        {INTERVIEW_CATEGORY.map(
          (category) =>
            groupedInterviews[category.id]?.length > 0 && (
              <section key={category.id} className="space-y-4">
                {/* CATEGORY TITLE */}
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    {category.title}
                  </h2>
                  <Badge 
                    variant="outline" 
                    className="rounded-full border-[#2664EC]/20 bg-[#2664EC]/10 px-2.5 py-0.5 text-xs font-semibold text-[#2664EC] dark:text-[#8FB3FF]"
                  >
                    {groupedInterviews[category.id].length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {groupedInterviews[category.id].map((interview: Interview) => {
                    const candidateInfo = getCandidateInfo(users, interview.candidateId);
                    const startTime = new Date(interview.startTime);

                    return (
                      <Card
                        key={interview._id}
                        className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:border-[#2664EC]/40 hover:shadow-md dark:border-white/10 dark:bg-[#0F1629]"
                      >
                        {/* CANDIDATE INFO */}
                        <CardHeader className="p-5 pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar className="size-11 rounded-xl border border-slate-200 dark:border-white/10">
                                <AvatarImage src={candidateInfo.image} />
                                <AvatarFallback className="rounded-xl bg-[#2664EC]/10 text-[#2664EC] font-semibold">
                                  {candidateInfo.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <CardTitle className="text-base font-bold truncate text-slate-900 dark:text-white">
                                  {candidateInfo.name}
                                </CardTitle>
                                <p className="text-sm font-medium text-[#2664EC] dark:text-[#8FB3FF] truncate mt-0.5">
                                  {interview.title}
                                </p>
                              </div>
                            </div>

                            {/* Bouton de suppression admin */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(interview._id)}
                              className="size-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors rounded-lg shrink-0"
                              title="Supprimer l'entretien"
                            >
                              <Trash2Icon className="size-4" />
                            </Button>
                          </div>
                        </CardHeader>

                        {/* DATE & TIME */}
                        <CardContent className="p-5 pt-0 space-y-3">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                            <CalendarIcon className="size-4 text-[#2664EC]" />
                            <span>{format(startTime, "MMMM d, yyyy · h:mm", { locale: enUS })}</span>
                          </div>
                        </CardContent>

                        {/* PASS & FAIL BUTTONS + COMMENT DIALOG */}
                        <CardFooter className="p-5 pt-0 flex flex-col gap-3">
                          {interview.status === "completed" && (
                            <div className="w-full flex items-center justify-center gap-3 pt-2">
                              <Button
                                aria-label="Mark interview as succeeded"
                                onClick={() => handleStatusUpdate(interview._id, "succeeded")}
                                className="w-32 inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-emerald-200 bg-emerald-50/50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-200 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                              >
                                <CheckCircle2Icon className="size-4" />
                                <span>Pass</span>
                              </Button>

                              <Button
                                aria-label="Mark interview as failed"
                                onClick={() => handleStatusUpdate(interview._id, "failed")}
                                className="w-32 inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-700 text-xs font-medium hover:bg-rose-100 hover:border-rose-300 transition-all duration-200 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-900/40"
                              >
                                <XCircleIcon className="size-4" />
                                <span>Fail</span>
                              </Button>
                            </div>
                          )}
                          <div className="w-full pt-1">
                            <CommentDialog interviewId={interview._id} />
                          </div>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )
        )}
      </div>
    </div>
  );
}

export default DashboardPage;