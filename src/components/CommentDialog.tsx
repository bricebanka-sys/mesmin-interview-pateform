"use client";

import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import toast from "react-hot-toast";
import { MessageSquareIcon, StarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { cn, getInterviewerInfo } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { format } from "date-fns";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

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

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

function CommentDialog({ interviewId }: { interviewId: Id<"interviews"> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("3");

  const addComment = useMutation(api.comments.addComment);
  const users = useQuery(api.users.getUsers);
  const existingComments = useQuery(api.comments.getComments, { interviewId });

  const handleSubmit = async () => {
    if (!comment.trim()) return toast.error("Please enter comment");

    try {
      await addComment({
        interviewId,
        content: comment.trim(),
        rating: parseInt(rating, 10),
      });

      toast.success("Comment submitted");
      setComment("");
      setRating("3");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to submit comment:", error);
      toast.error("Failed to submit comment");
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((starValue) => (
        <StarIcon
          key={starValue}
          className={cn(
            "size-4",
            starValue <= rating
              ? "fill-[#2664EC] text-[#2664EC]"
              : "text-slate-300 dark:text-slate-600"
          )}
        />
      ))}
    </div>
  );

  if (existingComments === undefined || users === undefined) return null;

  return (
    <>
      {/* Overlay global avec effet de flou pour toute la page en arrière-plan */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-all duration-300" />
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {/* TRIGGER BUTTON (Base UI: "render" replaces "asChild") */}
        <DialogTrigger
          render={
            <Button
              variant="secondary"
              className="w-full gap-2 border border-[#2664EC]/25 bg-[#2664EC]/10 text-[#2664EC] shadow-none hover:bg-[#2664EC]/15 focus-visible:ring-[#2664EC]/40 dark:text-[#8FB3FF]"
            />
          }
        >
          <MessageSquareIcon className="size-4" />
          Add Comment
          {existingComments.length > 0 && (
            <span className="ml-1 rounded-full bg-[#2664EC] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
              {existingComments.length}
            </span>
          )}
        </DialogTrigger>

        <DialogContent className="z-50 flex max-h-[90dvh] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 dark:border-white/10 dark:bg-[#0F1629] dark:text-slate-100 sm:max-w-[600px]">
          <DialogHeader className="space-y-1 border-b border-slate-200 px-5 py-4 text-left dark:border-white/10 sm:px-6">
            <DialogTitle className="flex items-center gap-3 text-lg font-semibold">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#2664EC]/10">
                <MessageSquareIcon className="size-5 text-[#2664EC]" />
              </span>
              Interview Comment
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
              Share your evaluation of the candidate with the interview team.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable body */}
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
            {existingComments.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Previous Comments
                  </h4>
                  <Badge
                    variant="outline"
                    className="border-[#2664EC]/30 bg-[#2664EC]/10 text-[#2664EC] dark:text-[#8FB3FF]"
                  >
                    {existingComments.length} Comment{existingComments.length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                {/* DISPLAY EXISTING COMMENTS */}
                <ScrollArea className="h-[200px] sm:h-[240px]">
                  <div className="space-y-3 pr-3">
                    {existingComments.map((existingComment) => {
                      const interviewer = getInterviewerInfo(users, existingComment.interviewerId);
                      return (
                        <div
                          key={existingComment._id}
                          className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <Avatar className="size-9 ring-2 ring-[#2664EC]/20">
                                <AvatarImage src={interviewer.image} />
                                <AvatarFallback className="bg-[#2664EC]/10 text-xs font-semibold text-[#2664EC]">
                                  {interviewer.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                                  {interviewer.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {format(existingComment._creationTime, "MMM d, yyyy \u2022 h:mm a")}
                                </p>
                              </div>
                            </div>
                            {renderStars(existingComment.rating)}
                          </div>
                          <p className="break-words text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                            {existingComment.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}

            <div className="space-y-4">
              {/* RATING */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-800 dark:text-slate-200">Rating</Label>
                <Select
                  value={rating}
                  onValueChange={(value) => {
                    if (value) setRating(value);
                  }}
                >
                  <SelectTrigger className={SELECT_TRIGGER} aria-label="Rating">
                    {/* Shows stars and label instead of the raw value */}
                    <SelectValue placeholder="Select rating">
                      <span className="flex items-center gap-3">
                        {renderStars(parseInt(rating, 10))}
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {RATING_LABELS[parseInt(rating, 10)]}
                        </span>
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent
                    alignItemWithTrigger={false}
                    align="start"
                    sideOffset={6}
                    className={SELECT_CONTENT}
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <SelectItem key={value} value={value.toString()} className={SELECT_ITEM}>
                        <div className="flex items-center gap-3">
                          {renderStars(value)}
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {RATING_LABELS[value]}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* COMMENT */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Your Comment
                </Label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your detailed comment about the candidate..."
                  className={cn(FIELD, "min-h-32 resize-none rounded-lg")}
                />
              </div>
            </div>
          </div>

          {/* BUTTONS (always visible) */}
          <DialogFooter className="flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/80 px-5 py-4 dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
            <Button
              variant="outline"
              className="border-slate-300 bg-white hover:bg-slate-100 dark:border-white/15 dark:bg-transparent dark:hover:bg-white/10"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#2664EC] text-white shadow-sm hover:bg-[#1F52BC] focus-visible:ring-[#2664EC]/40"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
export default CommentDialog;