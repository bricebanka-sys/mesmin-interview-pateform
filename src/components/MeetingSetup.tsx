import { useCall, DeviceSettings, VideoPreview } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Switch } from "./ui/switch";
import {
  CameraIcon,
  CameraOffIcon,
  MicIcon,
  SettingsIcon,
  VideoIcon,
  ShieldCheck,
} from "lucide-react";
import { Button } from "./ui/button";

interface MeetingSetupProps {
  onSetupComplete: () => void;
}

// Switch: #2664EC when on, neutral grey when off (works with Radix and Base UI)
const SWITCH_CLASS =
  "data-[checked]:!bg-[#2664EC] data-[state=checked]:!bg-[#2664EC] " +
  "data-[unchecked]:!bg-slate-300 data-[state=unchecked]:!bg-slate-300 " +
  "dark:data-[unchecked]:!bg-slate-600 dark:data-[state=unchecked]:!bg-slate-600";

// Shown inside VideoPreview when the user turns the camera off
const CameraOffPreview = () => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-muted/60">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2664EC]/10">
      <CameraOffIcon className="h-7 w-7 text-[#2664EC]" />
    </div>
    <p className="text-sm font-medium text-muted-foreground">Camera is off</p>
  </div>
);

// Shown inside VideoPreview when no camera device is available
const NoCameraPreview = () => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-muted/60 px-4 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2664EC]/10">
      <CameraOffIcon className="h-7 w-7 text-[#2664EC]" />
    </div>
    <div>
      <p className="text-sm font-medium text-foreground">No camera found</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Check your device and browser permissions
      </p>
    </div>
  </div>
);

function MeetingSetup({ onSetupComplete }: MeetingSetupProps) {
  // States for camera and mic (camera off by default, mic on)
  const [isCameraDisabled, setIsCameraDisabled] = useState(true);
  const [isMicDisabled, setIsMicDisabled] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const call = useCall();

  // Sync camera state with Stream SDK (with error handling)
  useEffect(() => {
    if (!call) return;
    let cancelled = false;

    const syncCamera = async () => {
      try {
        if (isCameraDisabled) {
          await call.camera.disable();
        } else {
          await call.camera.enable();
          if (!cancelled) setCameraError(null);
        }
      } catch (error) {
        console.error("Camera error:", error);
        if (!cancelled && !isCameraDisabled) {
          // Enabling failed: put the switch back to "off" and tell the user why
          setCameraError(
            "Camera unavailable. Check that a camera is connected and that the browser has permission."
          );
          setIsCameraDisabled(true);
        }
      }
    };

    syncCamera();
    return () => {
      cancelled = true;
    };
  }, [isCameraDisabled, call]);

  // Sync microphone state with Stream SDK
  useEffect(() => {
    if (!call) return;

    const syncMicrophone = async () => {
      try {
        if (isMicDisabled) {
          await call.microphone.disable();
        } else {
          await call.microphone.enable();
        }
      } catch (error) {
        console.error("Microphone error:", error);
      }
    };

    syncMicrophone();
  }, [isMicDisabled, call]);

  const handleJoin = async () => {
    if (!call) return;
    await call.join();
    onSetupComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-background via-background to-[#2664EC]/5 text-foreground transition-colors duration-300">
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* VIDEO PREVIEW CONTAINER */}
          <Card className="p-6 flex flex-col justify-between border-border/50 shadow-2xl bg-card/80 backdrop-blur-md rounded-2xl transition-all duration-300 hover:border-[#2664EC]/40">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <VideoIcon className="h-5 w-5 text-[#2664EC]" />
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">
                      Camera Preview
                    </h1>
                  </div>
                  <p className="text-sm text-muted-foreground">Make sure you look good!</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#2664EC]/10 px-3 py-1 text-xs font-medium text-[#2664EC] border border-[#2664EC]/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2664EC] animate-pulse" />
                  Live preview
                </span>
              </div>
            </div>

            {/* VIDEO PREVIEW */}
            <div className="my-4 flex-1 min-h-[260px] sm:min-h-[350px] lg:min-h-[400px] rounded-2xl overflow-hidden bg-black/50 dark:bg-black/70 border border-[#2664EC]/50 relative flex items-center justify-center shadow-inner">
              <div className="absolute inset-0 w-full h-full">
                <VideoPreview
                  className="h-full w-full object-cover"
                  DisabledVideoPreview={CameraOffPreview}
                  NoCameraPreview={NoCameraPreview}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
              <ShieldCheck className="h-4 w-4 text-[#2664EC]" />
              <span>Your connection is secure and encrypted</span>
            </div>
          </Card>

          {/* CARD CONTROLS */}
          <Card className="p-6 flex flex-col justify-between border-border/50 shadow-2xl bg-card/80 backdrop-blur-md rounded-2xl transition-all duration-300">
            <div className="space-y-6">
              {/* MEETING DETAILS */}
              <div className="border-b border-border/40 pb-4">
                <h2 className="text-xl font-semibold tracking-tight mb-2 text-foreground">
                  Meeting Details
                </h2>
                {call ? (
                  <p className="text-sm text-muted-foreground break-all font-mono bg-muted/40 p-2.5 rounded-xl border border-border/30">
                    {call.id}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
                )}
              </div>

              {/* CONTROLS LIST */}
              <div className="space-y-3.5">
                {/* CAM CONTROL */}
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/20 border border-border/30 transition-all duration-200 hover:bg-muted/40 hover:border-[#2664EC]/30">
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-[#2664EC]/10 flex items-center justify-center text-[#2664EC]">
                      <CameraIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Camera</p>
                      <p
                        className={`text-xs ${
                          isCameraDisabled ? "text-muted-foreground" : "text-[#2664EC]"
                        }`}
                      >
                        {isCameraDisabled ? "Off" : "On"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    aria-label="Toggle camera"
                    className={SWITCH_CLASS}
                    checked={!isCameraDisabled}
                    onCheckedChange={(checked) => {
                      setCameraError(null);
                      setIsCameraDisabled(!checked);
                    }}
                  />
                </div>

                {cameraError && (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400"
                  >
                    {cameraError}
                  </p>
                )}

                {/* MIC CONTROL */}
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/20 border border-border/30 transition-all duration-200 hover:bg-muted/40 hover:border-[#2664EC]/30">
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-[#2664EC]/10 flex items-center justify-center text-[#2664EC]">
                      <MicIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Microphone</p>
                      <p
                        className={`text-xs ${
                          isMicDisabled ? "text-muted-foreground" : "text-[#2664EC]"
                        }`}
                      >
                        {isMicDisabled ? "Off" : "On"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    aria-label="Toggle microphone"
                    className={SWITCH_CLASS}
                    checked={!isMicDisabled}
                    onCheckedChange={(checked) => setIsMicDisabled(!checked)}
                  />
                </div>

                {/* DEVICE SETTINGS */}
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/20 border border-border/30 transition-all duration-200 hover:bg-muted/40 hover:border-[#2664EC]/30">
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-[#2664EC]/10 flex items-center justify-center text-[#2664EC]">
                      <SettingsIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Settings</p>
                      <p className="text-xs text-muted-foreground">Configure devices</p>
                    </div>
                  </div>
                  <div className="text-foreground [&_button]:text-[#2664EC]">
                    <DeviceSettings />
                  </div>
                </div>
              </div>
            </div>

            {/* JOIN BTN & FOOTER */}
            <div className="space-y-4 pt-6 mt-6 border-t border-border/40">
              <Button
                className="w-full bg-[#2664EC] hover:bg-[#1f52bc] text-white font-medium shadow-lg shadow-[#2664EC]/30 transition-all py-6 text-base"
                size="lg"
                onClick={handleJoin}
              >
                Join Meeting
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Do not worry, our team is super friendly! We want you to succeed. {"\u{1F389}"}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default MeetingSetup;