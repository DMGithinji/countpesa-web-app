import { useCallback, useEffect, useMemo, useState } from "react";
import useAIMessageStore from "@/stores/aiMessages.store";
import useTransactionStore from "@/stores/transactions.store";
import { useAnalysisRepository } from "@/context/RepositoryContext";
import { submitData } from "@/lib/feedbackUtils";
import { getAnalysisPrompt } from "@/prompts/composer";
import { getReportAnalysisId } from "@/database/AnalysisRepository";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisReport } from "@/types/AITools";

export const useAIAnalysis = ({ isAnalysisSheetOpen }: { isAnalysisSheetOpen: boolean }) => {
  const assessmentMode = useAIMessageStore((state) => state.assessmentMode);
  const [aiResponse, setAIResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const analysisRepository = useAnalysisRepository();

  const dateRangeData = useTransactionStore((state) => state.dateRangeData);
  const transactions = useTransactionStore((state) => state.transactions);
  const calculatedData = useTransactionStore((state) => state.calculatedData);
  const { dateRange, derivedState } = useMemo(
    () => ({
      dateRange: dateRangeData.dateRange,
      derivedState: {
        transactions,
        calculatedData,
        dateRangeData,
      },
    }),
    [calculatedData, dateRangeData, transactions]
  );

  const generateAssessment = useCallback(
    async (ignorePast = false) => {
      setIsLoading(true);
      const reportId = getReportAnalysisId(dateRange, assessmentMode);
      const existingReport = await analysisRepository.getReport(reportId);

      if (existingReport && !ignorePast) {
        setAIResponse(existingReport.report);
        setIsLoading(false);
        return;
      }

      setAIResponse("");

      try {
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = getAnalysisPrompt(assessmentMode, derivedState);

        // Use the non-streaming version of the API instead
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        setAIResponse(response);
      } catch (error) {
        setAIResponse(
          "Sorry, there was an error generating your financial assessment. Please try again."
        );
        submitData({
          type: "error",
          message: JSON.stringify({
            name: `Error generating AI assessment`,
            error,
            timestamp: new Date().toISOString(),
          }),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [dateRange, assessmentMode, analysisRepository, derivedState]
  );

  useEffect(() => {
    if (isAnalysisSheetOpen && derivedState.calculatedData) {
      generateAssessment();
    }
  }, [generateAssessment, derivedState.calculatedData, isAnalysisSheetOpen]);

  const saveOnClose = async () => {
    const reportId = getReportAnalysisId(dateRange, assessmentMode);
    if (aiResponse) {
      await analysisRepository.saveReport({
        id: reportId,
        report: aiResponse,
        createdAt: new Date(),
      } as AnalysisReport);
    }
  };

  const copyToClipboard = () => {
    const plainText = aiResponse;
    navigator.clipboard.writeText(plainText).then(() => {
      setCopied(true);
      setTimeout(() => {
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      }, 0);
    });
  };

  return {
    generateAssessment,
    reportRange: dateRange,
    aiResponse,
    isLoading,
    copied,
    copyToClipboard,
    saveOnClose,
  };
};
