"use client";

import { useEffect, useState } from "react";
import { CallRecording } from "@stream-io/video-react-sdk";
import LoaderUI from "@/components/LoaderUI";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileTextIcon } from "lucide-react";
import useGetCalls from "@/hooks/useGetCalls";
import RecordingsCard from "@/components/RecordingsCard";

function RecordingsPage() {
  const { endedCalls, isLoading } = useGetCalls();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [isFetchingRecordings, setIsFetchingRecordings] = useState(true);

  useEffect(() => {
    const fetchRecordings = async () => {
      if (!endedCalls) return;

      if (endedCalls.length === 0) {
        setRecordings([]);
        setIsFetchingRecordings(false);
        return;
      }

      try {
        setIsFetchingRecordings(true);
        const allRecordings: CallRecording[] = [];
        const batchSize = 3; // Traitement par lots de 3 pour éviter les erreurs 429

        for (let i = 0; i < endedCalls.length; i += batchSize) {
          const batch = endedCalls.slice(i, i + batchSize);
          const batchResults = await Promise.all(
            batch.map(async (call) => {
              if (typeof call.queryRecordings !== "function") return { recordings: [] };
              try {
                return await call.queryRecordings();
              } catch (err) {
                console.error("Erreur sur un appel spécifique :", err);
                return { recordings: [] };
              }
            })
          );

          allRecordings.push(...batchResults.flatMap((item) => item?.recordings || []));
        }

        setRecordings(allRecordings);
      } catch (error) {
        console.error("Erreur globale lors de la récupération des enregistrements:", error);
      } finally {
        setIsFetchingRecordings(false);
      }
    };

    fetchRecordings();
  }, [endedCalls]);

  if (isLoading || isFetchingRecordings) return <LoaderUI />;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <FileTextIcon className="size-6 text-[#2664EC]" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recordings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {recordings.length} {recordings.length === 1 ? "recording" : "recordings"} available
          </p>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)] mt-3">
        {recordings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
            {recordings.map((r, index) => (
              <RecordingsCard key={r.url || r.end_time || index} recording={r} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-center">
            <p className="text-xl font-medium text-muted-foreground">No recordings available</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export default RecordingsPage;