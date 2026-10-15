import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle} from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useMeetingActions } from '@/hooks/useMeetingActions';


interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isJoinMeeting: boolean;
}

function MeetingModal({
  
    isOpen,
    onClose,
    title,
    isJoinMeeting
  }: MeetingModalProps) {
    const [meetingUrl, setMeetingUrl] = useState("");
    const { createInstantMeeting, joinMeeting } = useMeetingActions();

  const handleStart = async () => {
    if(isJoinMeeting) {
      // if it's a full URL extract meeting ID
      const meetingId = meetingUrl.split("/").pop();
      if(meetingId) joinMeeting(meetingId);
    } else {
      createInstantMeeting()
    }

    setMeetingUrl("");
    onClose();
  };

  // const createInstantMeeting = () => {

  // }

  // const joinMeeting = async () => {
  //   // Logique de connexion à une réunion existante
  //   if (!meetingUrl) return;
  //   console.log("Connexion à l'URL :", meetingUrl);
  // };



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
       {/* Overlay personnalisé plus sombre */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />
      )}
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border-blue-800/50 shadow-2xl mt-16">
        <DialogHeader className="relative pb-2">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
            {title}
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-0 top-0 text-blue-400/60 hover:text-blue-300 transition-colors p-1"
          >
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6l-12 12M6 6l12 12" />
            </svg> */}
          </button>
        </DialogHeader>

        <div className="space-y-6 pt-4 pb-2">
          {isJoinMeeting && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-300/70">
                Meeting Link
              </label>
              <Input
                placeholder="Paste meeting link here..."
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="bg-blue-950/40 border-blue-800/50 text-blue-50 placeholder:text-blue-400/40 focus:border-blue-600/70 focus:ring-blue-600/30 transition-all"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-blue-800/50 text-blue-300 hover:bg-blue-950/50 hover:border-blue-600/70 transition-all"
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleStart}
              disabled={isJoinMeeting && !meetingUrl.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoinMeeting ? "Join Meeting" : "Start Meeting"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MeetingModal