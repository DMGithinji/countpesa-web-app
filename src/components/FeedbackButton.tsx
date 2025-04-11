import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { submitData } from "@/lib/feedbackUtils";

function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [wantResponse, setWantResponse] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFeedback("");
    setWantResponse(false);
    setEmail("");
  };

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    setSubmitting(true);

    submitData({
      type: "feedback",
      message: feedback,
      email: wantResponse ? email : "",
    });

    setTimeout(() => {
      setOpen(false);
      resetForm();
      setSubmitting(false);
    }, 400);
  };

  return (
    <>
      <div
        role="none"
        className="hover:bg-secondary focus:bg-secondary cursor-pointer px-2 py-2 rounded-full flex gap-2 items-center"
        onClick={() => setOpen(true)}
        title="Provide feedback"
      >
        <MessageSquare size={18} />
        <span className="block md:hidden">Feedback</span>
      </div>

      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen);
          if (!newOpen) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              We&apos;d Love Your Feedback!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Textarea
                id="feedback"
                placeholder="Share your thoughts, suggestions, or issues..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="h-32 resize-none border-input"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="want-response"
                checked={wantResponse}
                onClick={() => setWantResponse(!wantResponse)}
                className="border-input"
              />
              <Label htmlFor="want-response" className="text-sm font-medium cursor-pointer">
                I&apos;d like a response from the team
              </Label>
            </div>

            {wantResponse && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Your Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-foreground"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!feedback.trim() || submitting || (wantResponse && !email.trim())}
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default FeedbackButton;
