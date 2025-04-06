import { useState } from "react";
import { MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const FeedbackButton = () => {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [wantResponse, setWantResponse] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    setSubmitting(true);

    const feedbackData = {
      google_sheet: 'CountpesaFeedback',
      message: feedback,
      email: wantResponse ? email : null,
      type: "CountPesa Web App Feedback",
    };

    try {
      fetch("https://feedback-to-sheets.onrender.com/feedback/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });
      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 400);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFeedback("");
    setWantResponse(false);
    setEmail("");
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        aria-label="Provide feedback"
        title="Provide feedback"
      >
        <MessageSquare className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) resetForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              We'd Love Your Feedback!
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
                I'd like a response from the team
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
};

export default FeedbackButton;