"use client";

import { useState } from "react";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  XIcon,
  UserIcon,
  UsersIcon,
  Loader2Icon,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import UserInfo from "@/components/UserInfo";
import MeetingCard from "@/components/MeetingCard";

import { TIME_SLOTS } from "@/constants";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Explicit palette (independent from theme variables). Brand colour: #2664EC
const FIELD =
  "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 shadow-none " +
  "focus-visible:border-[#2664EC] focus-visible:ring-[3px] focus-visible:ring-[#2664EC]/25 " +
  "dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500";
const SELECT_TRIGGER = cn(FIELD, "h-10 w-full rounded-lg text-sm");
const SELECT_CONTENT =
  "z-50 min-w-[var(--anchor-width)] rounded-xl border border-slate-200 bg-white p-1 text-slate-900 shadow-xl " +
  "dark:border-white/10 dark:bg-[#0F1629] dark:text-slate-100";
const SELECT_ITEM =
  "cursor-pointer rounded-lg py-2 text-sm " +
  "focus:bg-[#2664EC]/10 focus:text-[#2664EC] data-[highlighted]:bg-[#2664EC]/10 data-[highlighted]:text-[#2664EC] " +
  "dark:focus:text-[#8FB3FF] dark:data-[highlighted]:text-[#8FB3FF]";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
      {children}
    </p>
  );
}

function FieldLabel({
  htmlFor,
  icon: Icon,
  children,
}: {
  htmlFor?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-slate-200"
    >
      {Icon && <Icon className="size-4 text-[#2664EC]" />}
      {children}
    </label>
  );
}

function InterviewScheduleUI() {
  const client = useStreamVideoClient();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Récupération des utilisateurs depuis Convex
  const interviewsQuery = useQuery(api.interviews.getAllInterviews);
  const interviews = interviewsQuery ?? [];
  const isLoadingInterviews = interviewsQuery === undefined;
  const users = useQuery(api.users.getUsers) || [];
  const createInterview = useMutation(api.interviews.createInterview);

  // Filtrage des candidats
  const candidates = users?.filter((u) => u.role === "candidate");
  const interviewers = users?.filter((u) => u.role === "interviewer");

  // État du formulaire
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date(),
    time: "09:00",
    candidateId: candidates[0]?.clerkId || "",
    interviewerIds: user?.id ? [user.id] : [],
  });

  const scheduleMeeting = async () => {
    if (!client || !user) return;
    if (!formData.candidateId || formData.interviewerIds.length === 0) {
      toast.error("Please select both candidate and at least one interviewer");
      return;
    }

    setIsCreating(true);
    try {
      const { title, description, date, time, candidateId, interviewerIds } = formData;
      const [hours, minutes] = time.split(":");
      const meetingDate = new Date(date);
      meetingDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));

      const id = crypto.randomUUID();
      const call = client.call("default", id);

      await call.getOrCreate({
        data: {
          starts_at: meetingDate.toISOString(),
          custom: {
            description: title,
            additionalDetails: description,
          },
        },
      });

      // Enregistrement de l'entretien dans la base de données Convex
      await createInterview({
        title,
        description,
        startTime: meetingDate.getTime(),
        streamCallId: id,
        candidateId,
        interviewerIds,
        status: "upcoming",
      });

      setOpen(false);
      toast.success("Interview scheduled successfully!");
      setFormData({
        title: "",
        description: "",
        date: new Date(),
        time: "09:00",
        candidateId: candidates[0]?.clerkId || "",
        interviewerIds: [user?.id || ""],
      });
    } catch (error) {
      console.error("Erreur lors de la planification :", error);
      toast.error("Failed to schedule the meeting. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const addInterviewer = (interviewerId: string) => {
    if (!formData.interviewerIds.includes(interviewerId)) {
      setFormData((prev) => ({
        ...prev,
        interviewerIds: [...prev.interviewerIds, interviewerId],
      }));
    }
  };

  const removeInterviewer = (interviewerId: string) => {
    if (interviewerId === user?.id) return;
    setFormData((prev) => ({
      ...prev,
      interviewerIds: prev.interviewerIds.filter((id) => id !== interviewerId),
    }));
  };

  const selectedInterviewers = interviewers.filter((i) =>
    formData.interviewerIds.includes(i.clerkId)
  );

  const availableInterviewers = interviewers.filter(
    (i) => !formData.interviewerIds.includes(i.clerkId)
  );

  // Éléments d'affichage uniquement
  const selectedCandidate = candidates.find((c) => c.clerkId === formData.candidateId);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const formattedDate = formData.date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* HEADER INFO */}
        <div className="flex items-start gap-4">
          <div className="hidden size-12 shrink-0 items-center justify-center rounded-2xl border border-[#2664EC]/20 bg-[#2664EC]/10 sm:flex">
            <CalendarIcon className="size-6 text-[#2664EC]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Interviews</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Schedule and manage interviews
              {!isLoadingInterviews && interviews.length > 0 && (
                <span className="ml-2 rounded-full bg-[#2664EC]/10 px-2 py-0.5 text-xs font-medium text-[#2664EC] dark:text-[#8FB3FF]">
                  {interviews.length} total
                </span>
              )}
            </p>
          </div>
        </div>

        {/* DIALOG */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button
                size="lg"
                className="w-full gap-2 bg-[#2664EC] text-white shadow-sm hover:bg-[#1F52BC] focus-visible:ring-[#2664EC]/40 sm:w-auto"
              />
            }
          >
            <PlusIcon className="size-4" />
            Schedule Interview
          </DialogTrigger>

          <DialogContent className="flex max-h-[90dvh] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 dark:border-white/10 dark:bg-[#0F1629] dark:text-slate-100 sm:max-w-[600px]">
            <DialogHeader className="space-y-1 border-b border-slate-200 px-5 py-4 text-left dark:border-white/10 sm:px-6">
              <DialogTitle className="flex items-center gap-3 text-lg font-semibold">
                <span className="flex size-9 items-center justify-center rounded-xl bg-[#2664EC]/10">
                  <CalendarIcon className="size-5 text-[#2664EC]" />
                </span>
                Schedule Interview
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                Set up a technical session with a candidate and your interviewers.
              </DialogDescription>
            </DialogHeader>

            {/* Scrollable body */}
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
              {/* DETAILS */}
              <div className="space-y-4">
                <SectionTitle>Details</SectionTitle>

                {/* INTERVIEW TITLE */}
                <div className="space-y-2">
                  <FieldLabel htmlFor="interview-title">Title</FieldLabel>
                  <Input
                    id="interview-title"
                    placeholder="Interview title"
                    className={cn(FIELD, "h-10 rounded-lg")}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                {/* INTERVIEW DESC */}
                <div className="space-y-2">
                  <FieldLabel htmlFor="interview-description">Description</FieldLabel>
                  <Textarea
                    id="interview-description"
                    placeholder="Interview description"
                    className={cn(FIELD, "resize-none rounded-lg")}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              {/* PARTICIPANTS */}
              <div className="space-y-4">
                <SectionTitle>Participants</SectionTitle>

                {/* CANDIDATE */}
                <div className="space-y-2">
                  <FieldLabel icon={UserIcon}>Candidate</FieldLabel>
                  <Select
                    value={formData.candidateId}
                    onValueChange={(candidateId) => {
                      if (candidateId) setFormData({ ...formData, candidateId });
                    }}
                  >
                    <SelectTrigger className={SELECT_TRIGGER} aria-label="Candidate">
                      <SelectValue placeholder="Select candidate">
                        {selectedCandidate ? <UserInfo user={selectedCandidate} /> : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent
                      alignItemWithTrigger={false}
                      align="start"
                      sideOffset={6}
                      className={SELECT_CONTENT}
                    >
                      {candidates.map((candidate) => (
                        <SelectItem
                          key={candidate.clerkId}
                          value={candidate.clerkId}
                          className={SELECT_ITEM}
                        >
                          <UserInfo user={candidate} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* INTERVIEWERS */}
                <div className="space-y-2">
                  <FieldLabel icon={UsersIcon}>Interviewers</FieldLabel>

                  <div className="flex flex-wrap gap-2">
                    {selectedInterviewers.length === 0 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        No interviewer selected yet
                      </p>
                    )}
                    {selectedInterviewers.map((interviewer) => (
                      <div
                        key={interviewer.clerkId}
                        className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#2664EC]/25 bg-[#2664EC]/10 py-1 pl-2 pr-2 text-sm text-slate-900 dark:text-slate-100"
                      >
                        <UserInfo user={interviewer} />
                        {interviewer.clerkId !== user?.id ? (
                          <button
                            type="button"
                            aria-label="Remove interviewer"
                            onClick={() => removeInterviewer(interviewer.clerkId)}
                            className="rounded-full p-0.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-600"
                          >
                            <XIcon className="size-4" />
                          </button>
                        ) : (
                          <span className="rounded-full bg-[#2664EC] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            You
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {availableInterviewers.length > 0 && (
                    <Select
                      key={formData.interviewerIds.length}
                      onValueChange={(val) => {
                        if (val) addInterviewer(val as string);
                      }}
                    >
                      <SelectTrigger className={SELECT_TRIGGER} aria-label="Add interviewer">
                        <SelectValue placeholder="Add interviewer" />
                      </SelectTrigger>
                      <SelectContent
                        alignItemWithTrigger={false}
                        align="start"
                        sideOffset={6}
                        className={SELECT_CONTENT}
                      >
                        {availableInterviewers.map((interviewer) => (
                          <SelectItem
                            key={interviewer.clerkId}
                            value={interviewer.clerkId}
                            className={SELECT_ITEM}
                          >
                            <UserInfo user={interviewer} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* DATE & TIME */}
              <div className="space-y-4">
                <SectionTitle>Date &amp; time</SectionTitle>

                <div className="grid gap-5">
                  {/* CALENDAR */}
                  <div className="space-y-2">
                    <FieldLabel icon={CalendarIcon}>Date</FieldLabel>
                    <div className="flex justify-center overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#141C31]">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => date && setFormData({ ...formData, date })}
                        disabled={(date) => date < startOfToday}
                        className="calendar-ui [&_.rdp-day]:w-8 [&_.rdp-day]:h-8 [&_.rdp-day]:rounded-full [&_.rdp-day]:p-0 [&_.rdp-day]:text-sm "
                      />
                    </div>
                  </div>

                  {/* TIME + SUMMARY */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <FieldLabel icon={ClockIcon}>Time</FieldLabel>
                      <Select
                        value={formData.time}
                        onValueChange={(time) => {
                          if (time) setFormData({ ...formData, time });
                        }}
                      >
                        <SelectTrigger className={SELECT_TRIGGER} aria-label="Time">
                          <SelectValue placeholder="Select time">{formData.time}</SelectValue>
                        </SelectTrigger>
                        <SelectContent
                          alignItemWithTrigger={false}
                          align="start"
                          sideOffset={6}
                          className={cn(SELECT_CONTENT, "max-h-64")}
                        >
                          {TIME_SLOTS.map((time) => (
                            <SelectItem key={time} value={time} className={SELECT_ITEM}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-xl border border-[#2664EC]/20 bg-[#2664EC]/5 p-3.5 flex flex-col justify-center">
                      <p className="text-[11px] font-semibold tracking-wider text-[#2664EC] dark:text-[#8FB3FF]">
                        Scheduled for
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                        {formattedDate}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        at {formData.time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/80 px-5 py-4 dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
              <Button
                variant="outline"
                className="border-slate-300 bg-white hover:bg-slate-100 dark:border-white/15 dark:bg-transparent dark:hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#2664EC] text-white shadow-sm hover:bg-[#1F52BC] focus-visible:ring-[#2664EC]/40"
                onClick={scheduleMeeting}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  "Schedule Interview"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* LOADING STATE & MEETING CARDS */}
      {isLoadingInterviews ? (
        <div className="flex justify-center py-12">
          <Loader2Icon className="size-8 animate-spin text-[#2664EC]" />
        </div>
      ) : interviews.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {interviews.map((interview) => (
              <MeetingCard key={interview._id} interview={interview} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center dark:border-white/15 dark:bg-white/5">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#2664EC]/10">
            <CalendarIcon className="size-7 text-[#2664EC]" />
          </div>
          <p className="text-base font-semibold text-slate-900 dark:text-white">
            No interviews scheduled
          </p>
          <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Create your first technical interview to get started.
          </p>
        </div>
      )}
    </div>
  );
}

export default InterviewScheduleUI;