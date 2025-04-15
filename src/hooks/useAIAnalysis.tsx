import { useCallback, useEffect, useState } from "react";
import useAIMessageStore from "@/stores/aiMessages.store";
import useTransactionStore from "@/stores/transactions.store";
import { useAnalysisRepository } from "@/context/RepositoryContext";
import { submitData } from "@/lib/feedbackUtils";
import { getAnalysisPrompt } from "@/prompts/composer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisReport } from "@/prompts/types";
import { getReportAnalysisId } from "@/database/AnalysisRepository";

export const useAIAnalysis = ({ isAnalysisSheetOpen }: { isAnalysisSheetOpen: boolean }) => {
  const assessmentMode = useAIMessageStore((state) => state.assessmentMode);
  const [aiResponse, setAIResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const analysisRepository = useAnalysisRepository();

  const filters = useTransactionStore((state) => state.currentFilters);
  const transactions = useTransactionStore((state) => state.transactions);
  const calculatedData = useTransactionStore((state) => state.calculatedData);
  const dateRangeData = useTransactionStore((state) => state.dateRangeData);
  const { dateRange } = dateRangeData;

  const generateAssessment = useCallback(
    async (ignorePast = false) => {
      setIsLoading(true);
      const reportId = getReportAnalysisId(dateRange, assessmentMode, filters);
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

        const derivedData = {
          transactions,
          calculatedData,
          dateRangeData,
        };
        const prompt = getAnalysisPrompt(assessmentMode, derivedData, filters);

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
    [
      dateRange,
      assessmentMode,
      filters,
      analysisRepository,
      transactions,
      calculatedData,
      dateRangeData,
    ]
  );

  useEffect(() => {
    if (isAnalysisSheetOpen && !!calculatedData) {
      generateAssessment();
    }
  }, [generateAssessment, isAnalysisSheetOpen, calculatedData]);

  const saveOnClose = useCallback(async () => {
    const reportId = getReportAnalysisId(dateRange, assessmentMode, filters);
    if (aiResponse) {
      await analysisRepository.saveReport({
        id: reportId,
        report: aiResponse,
        createdAt: new Date(),
      } as AnalysisReport);
    }
  }, [dateRange, assessmentMode, filters, aiResponse, analysisRepository]);

  const copyToClipboard = useCallback(() => {
    const plainText = aiResponse;
    navigator.clipboard.writeText(plainText).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    });
  }, [aiResponse]);

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
