"use client";

import { useState } from "react";
import { CallRecording } from "@stream-io/video-react-sdk";
import { Button } from "@/components/ui/button";
import { PlayIcon, CopyIcon, CalendarIcon, ClockIcon, CheckIcon, VideoIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import toast from "react-hot-toast";
import { formatRecordingDuration } from "@/lib/utils";

interface RecordingsCardProps {
  recording: CallRecording;
}

export default function RecordingsCard({ recording }: RecordingsCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(recording.url);
    setCopied(true);
    toast.success("Recording link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = recording.start_time
    ? format(new Date(recording.start_time), "MMM d, yyyy · HH:mm", { locale: fr })
    : "Date inconnue";

  const duration = formatRecordingDuration(recording.start_time, recording.end_time);

  return (
    <Card className="group overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:border-[#2664EC]/40 hover:shadow-md dark:border-white/10 dark:bg-[#0F1629]">
      {/* EN-TÊTE DE LA CARTE */}
      <CardHeader className="p-4 pb-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-full border border-[#2664EC]/20 bg-[#2664EC]/10 px-2.5 py-0.5 text-xs font-semibold text-[#2664EC] dark:text-[#8FB3FF]">
            <VideoIcon className="size-3.5" />
            <span>Recording</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
            <ClockIcon className="size-3.5 text-[#2664EC]" />
            <span>{duration}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
          <CalendarIcon className="size-3.5 text-slate-400" />
          <span className="capitalize">{formattedDate}</span>
        </div>
      </CardHeader>

      {/* CONTENU (LECTEUR VIDÉO INTÉGRÉ) */}
      <CardContent className="p-4 pt-0">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-900 dark:border-white/10">
          {isPlaying ? (
            <video
              src={recording.url}
              controls
              autoPlay
              className="h-full w-full object-contain"
            />
          ) : (
            <div
              className="relative flex h-full w-full cursor-pointer items-center justify-center bg-slate-950/80 transition-all group-hover:bg-slate-950/60"
              onClick={() => setIsPlaying(true)}
            >
              <div className="flex size-12 items-center justify-center rounded-full border border-white/20 bg-[#2664EC] text-white shadow-lg transition-transform duration-200 group-hover:scale-110">
                <PlayIcon className="size-5 fill-current ml-0.5" />
              </div>
              <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white backdrop-blur">
                Click to read
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {/* PIED DE CARTE / ACTIONS */}
      <CardFooter className="flex items-center gap-2 p-4 pt-0">
        <Button
          className="flex-1 gap-2 bg-[#2664EC] text-white hover:bg-[#2664EC]/90 dark:bg-[#2664EC] dark:hover:bg-[#2664EC]/80"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          <PlayIcon className="size-4 fill-current" />
          <span>{isPlaying ? "Hide video" : "Play video"}</span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleCopyLink}
          className="shrink-0 border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
          title="Copier le lien"
        >
          {copied ? (
            <CheckIcon className="size-4 text-emerald-500" />
          ) : (
            <CopyIcon className="size-4" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}