export type FeedbackType = "Error Report" | "Web App Feedback";

export enum GoogleSheet {
  CountpesaFeedback = "CountpesaFeedback",
}

export interface SubmissionData {
  google_sheet: GoogleSheet;
  message: string;
  email: string | null;
  type: FeedbackType;
}

export interface Message {
  type: "error" | "feedback";
  message: string;
  email?: string;
}

export const submitData = async ({ message, email, type }: Message) => {
  const submissionData = {
    google_sheet: GoogleSheet.CountpesaFeedback,
    message,
    email,
    type: type === "error" ? "Error Report" : "Web App Feedback",
  };

  const endpoint = `${import.meta.env.VITE_FEEDBACK_ENDPOINT}/feedback/`;

  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(submissionData),
  });
};
