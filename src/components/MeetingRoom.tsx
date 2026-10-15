"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CallControls,
  CallingState,
  CallParticipantsList,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ClockIcon,
  LayoutListIcon,
  LoaderIcon,
  ShieldCheckIcon,
  UsersIcon,
  FileCodeIcon,
  CodeIcon,
  BookOpenIcon,
  LightbulbIcon,
  AlertCircleIcon,
} from "lucide-react";


import { 
  SiJavascript, 
  SiTypescript, 
  SiPython, 
  SiOpenjdk, // "SiJava" est déprécié, "SiOpenjdk" est le logo Java officiel actuel
  SiCplusplus, 

} from "react-icons/si";

import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import EndCallButton from "./EndCallButton";
import { CODING_QUESTIONS, LANGUAGES } from "@/constants";
import { Editor } from "@monaco-editor/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Explicit palette (does not depend on theme variables). Brand colour: #2664EC
const ICON_BTN =
  "size-10 border-slate-300 bg-white text-slate-700 hover:bg-slate-100 " +
  "dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10";
const ICON_BTN_ACTIVE =
  "border-[#2664EC] bg-[#2664EC]/10 text-[#2664EC] hover:bg-[#2664EC]/15 " +
  "dark:border-[#2664EC] dark:bg-[#2664EC]/20 dark:text-[#8FB3FF] dark:hover:bg-[#2664EC]/25";

// Minuterie de session, isolée afin de ne pas affecter la logique de la salle.
function ElapsedTime() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
      <ClockIcon className="size-3.5" />
      {hours > 0 ? `${hours}:` : ""}
      {pad(minutes)}:{pad(secs)}
    </span>
  );
}




// Extensions de fichier affichées dans l'onglet de l'éditeur
// Extensions de fichier affichées dans l'onglet de l'éditeur (inchangé)
export const FILE_EXTENSIONS: Record<string, string> = {
  javascript: "js",
  typescript: "ts",
  python: "py",
  java: "java",
  cpp: "cpp",
  csharp: "cs",
};

// NOUVEAU : Mapping des langages vers leurs icônes et couleurs officielles
const LANGUAGE_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  javascript: { icon: SiJavascript, color: "#F7DF1E" }, // Jaune JS
  typescript: { icon: SiTypescript, color: "#3178C6" }, // Bleu TS
  python: { icon: SiPython, color: "#3776AB" },         // Bleu foncé Python
  java: { icon: SiOpenjdk, color: "#E76F00" },          // Orange Java
  cpp: { icon: SiCplusplus, color: "#00599C" },         // Bleu C++        // Violet C#
};

function LanguageBadge({ id }: { id: string }) {
  const badge = LANGUAGE_ICONS[id];

  // Fallback si le langage n'est pas dans la liste
  if (!badge) {
    return (
      <span
        aria-hidden
        className="flex size-5 shrink-0 items-center justify-center rounded bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300"
      >
        <CodeIcon className="size-3" />
      </span>
    );
  }

  const Icon = badge.icon;

  return (
    <span
      aria-hidden
      className="flex size-5 shrink-0 items-center justify-center rounded bg-transparent"
    >
      <Icon 
        className="size-4 transition-transform hover:scale-110" 
        style={{ color: badge.color }} 
      />
    </span>
  );
}

// Styles communs des sélecteurs (couleurs explicites : mode clair et sombre)
const SELECT_TRIGGER =
  "h-9 min-w-0 gap-2 rounded-lg border-slate-300 bg-white text-sm text-slate-900 shadow-none " +
  "hover:bg-slate-50 focus-visible:border-[#2664EC] focus-visible:ring-[#2664EC]/30 " +
  "dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10";
const SELECT_CONTENT =
  "z-50 min-w-[var(--anchor-width)] rounded-xl border border-slate-200 bg-white p-1 text-slate-900 shadow-xl " +
  "dark:border-white/10 dark:bg-[#0F1629] dark:text-slate-100";
const SELECT_ITEM =
  "cursor-pointer rounded-lg py-2 text-sm " +
  "focus:bg-[#2664EC]/10 focus:text-[#2664EC] data-[highlighted]:bg-[#2664EC]/10 data-[highlighted]:text-[#2664EC] " +
  "dark:focus:text-[#8FB3FF] dark:data-[highlighted]:text-[#8FB3FF]";



// Éditeur de code interactif avec Monaco et sélecteurs de questions/langages
function CodeEditorPanel() {
  const [selectedQuestion, setSelectedQuestion] = useState(CODING_QUESTIONS[0]);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(selectedQuestion.starterCode.javascript);

  // L'éditeur suit le thème actif de l'application
  const { resolvedTheme } = useTheme();

  const currentLanguage = LANGUAGES.find((l) => l.id === selectedLanguage);
  const fileExtension = FILE_EXTENSIONS[selectedLanguage] ?? "txt";

  const handleQuestionChange = (questionId: string) => {
    const question = CODING_QUESTIONS.find((q) => q.id === questionId) || CODING_QUESTIONS[0];
    setSelectedQuestion(question);
    setCode(question.starterCode[selectedLanguage as keyof typeof question.starterCode] || "");
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setCode(selectedQuestion.starterCode[language as keyof typeof selectedQuestion.starterCode] || "");
  };

  return (
    <div className="flex h-full w-full flex-col border-r border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-[#0B1120] dark:text-slate-100">
      <ResizablePanelGroup orientation="vertical" className="h-full w-full">
        {/* Panneau du haut : Description de la question et consignes */}
        <ResizablePanel defaultSize="40%" minSize="20%">
          <ScrollArea className="h-full">
            <div className="space-y-6 p-5 sm:p-6">
              {/* En-tête : titre à gauche, sélecteurs à droite (passent dessous si l'espace manque) */}
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4 dark:border-white/10">
                <div className="min-w-[200px] flex-1">
                  <h2 className="text-xl font-bold tracking-tight">{selectedQuestion.title}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Choose your language and solve it live.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  {/* Sélecteur de problème */}
                  <Select
                    value={selectedQuestion.id}
                    onValueChange={(val) => {
                      if (val) handleQuestionChange(val);
                    }}
                  >
                    <SelectTrigger className={cn(SELECT_TRIGGER, "w-[200px]")} aria-label="Problème">
                      <SelectValue placeholder="Problème">
                        <span className="flex min-w-0 items-center gap-2">
                          <FileCodeIcon className="size-4 shrink-0 text-[#2664EC]" />
                          <span className="truncate">{selectedQuestion.title}</span>
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    {/* La liste s'ouvre sous le bouton au lieu de le recouvrir */}
                    <SelectContent
                      alignItemWithTrigger={false}
                      align="start"
                      sideOffset={6}
                      className={SELECT_CONTENT}
                    >
                      {CODING_QUESTIONS.map((q) => (
                        <SelectItem key={q.id} value={q.id} className={SELECT_ITEM}>
                          <span className="flex items-center gap-2">
                            <FileCodeIcon className="size-4 shrink-0 text-[#2664EC]" />
                            {q.title}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Sélecteur de langage */}
                  <Select
                    value={selectedLanguage}
                    onValueChange={(val) => {
                      if (val) handleLanguageChange(val);
                    }}
                  >
                    <SelectTrigger className={cn(SELECT_TRIGGER, "w-[150px]")} aria-label="Langage">
                      <SelectValue placeholder="Langage">
                        <span className="flex min-w-0 items-center gap-2">
                          <LanguageBadge id={selectedLanguage} />
                          <span className="truncate">{currentLanguage?.name ?? selectedLanguage}</span>
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent
                      alignItemWithTrigger={false}
                      align="start"
                      sideOffset={6}
                      className={SELECT_CONTENT}
                    >
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.id} value={lang.id} className={SELECT_ITEM}>
                          <span className="flex items-center gap-2">
                            <LanguageBadge id={lang.id} />
                            {lang.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-semibold text-[#2664EC]">
                  <BookOpenIcon className="size-4" />
                  <span>Description</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {selectedQuestion.description}
                </p>
              </div>

              {/* Exemples */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-semibold text-[#2664EC]">
                  <LightbulbIcon className="size-4" />
                  <span>Examples</span>
                </div>
                {selectedQuestion.examples?.map((ex, idx) => (
                  <div
                    key={idx}
                    className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm dark:border-white/10 dark:bg-white/5"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Example {idx + 1}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="font-medium text-slate-900 dark:text-white">Input : </span>
                      <code className="rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-xs dark:bg-white/10">
                        {ex.input}
                      </code>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="font-medium text-slate-900 dark:text-white">Output : </span>
                      <code className="rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-xs dark:bg-white/10">
                        {ex.output}
                      </code>
                    </p>
                    {ex.explanation && (
                      <p className="text-slate-600 dark:text-slate-300">
                        <span className="font-medium text-slate-900 dark:text-white">Explanation : </span>
                        {ex.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Contraintes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-semibold text-[#2664EC]">
                  <AlertCircleIcon className="size-4" />
                  <span>Constraints</span>
                </div>
                <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                  {(selectedQuestion.constraints || []).map((constraint, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#2664EC]" />
                      <span>{constraint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle
          withHandle
          className="bg-slate-200 transition-colors hover:bg-[#2664EC]/60 dark:bg-white/10 [&>div]:bg-[#2664EC]"
        />

        {/* Panneau du bas : Éditeur Monaco */}
        <ResizablePanel defaultSize="60%" minSize="25%">
          <div className="flex h-full w-full flex-col bg-white text-slate-600 dark:bg-[#0B1120] dark:text-slate-300">
            {/* Barre d'onglet */}
            <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-white/10 dark:bg-[#0F172A]">
              <div aria-hidden className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-red-400/70" />
                <span className="size-2.5 rounded-full bg-amber-400/70" />
                <span className="size-2.5 rounded-full bg-emerald-400/70" />
              </div>
              <div className="flex items-center gap-2 rounded-md bg-slate-200/70 px-3 py-1 font-mono text-xs text-slate-700 dark:bg-white/5 dark:text-slate-200">
                <LanguageBadge id={selectedLanguage} />
                solution.{fileExtension}
              </div>
              <span className="ml-auto rounded-full border border-[#2664EC]/40 bg-[#2664EC]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#2664EC] dark:text-[#8FB3FF]">
                Live Session
              </span>
            </div>

            {/* Éditeur */}
            <div className="relative flex-1 overflow-hidden">
              <Editor
                height="100%"
                language={selectedLanguage}
                theme={resolvedTheme === "light" ? "light" : "vs-dark"}
                value={code}
                onChange={(value) => setCode(value || "")}
                loading={<LoaderIcon className="size-5 animate-spin text-[#2664EC]" />}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 12, bottom: 12 },
                  lineNumbersMinChars: 3,
                  smoothScrolling: true,
                }}
              />
            </div>

            {/* Barre d'état */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-[10px] text-slate-500 dark:border-white/10 dark:bg-[#0F172A]">
              <span>{currentLanguage?.name ?? selectedLanguage}</span>
              <span>UTF-8 · Interactive Mode - By Mesmin</span>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function MeetingRoom() {
  const router = useRouter();
  const [layout, setLayout] = useState<"grid" | "speaker">("speaker");
  const [showParticipants, setShowParticipants] = useState(false);

  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();

  useEffect(() => {
    if (callingState === CallingState.LEFT || callingState === CallingState.OFFLINE) {
      router.push('/');
    }
  }, [callingState, router]);

  if (callingState === CallingState.LEFT || callingState === CallingState.OFFLINE) {
    return null;
  }


  

  if (callingState !== CallingState.JOINED) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex h-[calc(100vh-65px)] flex-col items-center justify-center gap-6 bg-slate-50 dark:bg-[#080D19]"
      >
        <div className="relative flex size-16 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#2664EC]/20" />
          <span className="relative flex size-16 items-center justify-center rounded-full border border-[#2664EC]/30 bg-white shadow-lg dark:bg-[#0F1629]">
            <LoaderIcon className="size-7 animate-spin text-[#2664EC]" />
          </span>
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-slate-900 dark:text-white">
            Preparing your interview room
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Establishing a secure connection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-65px)] w-full flex-col overflow-hidden bg-slate-50 dark:bg-[#080D19]">
      {/* STATUS BAR */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-white/10 dark:bg-[#0F1629]/90 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2664EC]/30 bg-[#2664EC]/10 px-2.5 py-1 text-xs font-semibold text-[#2664EC] dark:text-[#8FB3FF]">
            <span className="size-1.5 animate-pulse rounded-full bg-[#2664EC]" />
            LIVE
          </span>
          <span className="hidden text-sm font-medium text-slate-900 dark:text-white sm:inline">
            Remote interview
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 sm:inline-flex">
            <ShieldCheckIcon className="size-3.5 text-[#2664EC]" />
            Secure connection
          </span>
          <ElapsedTime />
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
          {/* LEFT PANEL: code editor */}
          <ResizablePanel defaultSize="35%" minSize="25%" className="hidden lg:block">
            <CodeEditorPanel />
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="hidden bg-slate-200 transition-colors hover:bg-[#2664EC]/60 dark:bg-white/10 lg:flex [&>div]:bg-[#2664EC]"
          />

          {/* RIGHT PANEL: video and controls */}
          <ResizablePanel defaultSize="65%" minSize="25%" className="flex h-full flex-col">
            <div className="relative min-h-0 flex-1 p-3">
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner dark:border-white/10 dark:from-[#0F1629] dark:to-[#0A0F1C]">
                {layout === "grid" ? <PaginatedGridLayout /> : <SpeakerLayout />}

                {showParticipants && (
                  <div className="absolute inset-y-3 right-3 z-20 w-[calc(100%-1.5rem)] overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-2xl duration-200 animate-in slide-in-from-right dark:border-white/10 dark:bg-[#0F1629] sm:w-80">
                    <CallParticipantsList onClose={() => setShowParticipants(false)} />
                  </div>
                )}
              </div>
            </div>

            {/* CONTROLS DOCK */}
            <div className="shrink-0 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-[#0F1629]/90 sm:px-6">
              <div className="grid grid-cols-2 items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="outline"
                          size="icon"
                          className={ICON_BTN}
                          aria-label="Change layout"
                          title="Change layout"
                        />
                      }
                    >
                      <LayoutListIcon className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        onClick={() => setLayout("speaker")}
                        className={cn(layout === "speaker" && "font-medium text-[#2664EC]")}
                      >
                        Speaker view
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setLayout("grid")}
                        className={cn(layout === "grid" && "font-medium text-[#2664EC]")}
                      >
                        Grid view
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="icon"
                    className={cn("relative", ICON_BTN, showParticipants && ICON_BTN_ACTIVE)}
                    aria-label="Show participants"
                    aria-pressed={showParticipants}
                    title="Participants"
                    onClick={() => setShowParticipants(!showParticipants)}
                  >
                    <UsersIcon className="size-4" />
                    {participantCount > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2664EC] px-1 text-[10px] font-semibold text-white">
                        {participantCount}
                      </span>
                    )}
                  </Button>
                </div>

                <div className="order-last col-span-2 flex justify-center md:order-none md:col-span-1">
                  <div className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 dark:border-white/10 dark:bg-white/5">
                    <CallControls onLeave={() => router.push("/")} />
                  </div>
                </div>

                <div className="flex justify-end">
                  <EndCallButton />
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

export default MeetingRoom;