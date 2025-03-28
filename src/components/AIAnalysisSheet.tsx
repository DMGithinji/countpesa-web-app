import { GoogleGenerativeAI } from "@google/generative-ai";
import { marked } from "marked";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import useSidepanelStore from "@/stores/ui.store";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { ClipboardCheck, ClipboardCopy, Sparkle } from "lucide-react";

import { endOfDay, formatDate } from "date-fns";
import { useTransactionContext } from "@/context/TransactionDataContext";
import { SetDateRange } from "@/lib/getDateRangeData";
import analysisRepository, {
  getReportAnalysisId,
} from "@/database/AnalysisRepository";
import { AnalysisReport, AssessmentMode } from "@/types/AITools";
import {
  GetPromptTemplate,
  GetRoastPromptTemplate,
} from "@/configs/PromptTemplate";
import useAIMessageStore from "@/stores/aiMessages.store";
import { getCalculationSummary } from "@/lib/getAIPrompt";

const BottomDrawer = () => {
  const isOpen = useSidepanelStore((state) => state.drawerOpen);
  const setDrawerOpen = useSidepanelStore((state) => state.setDrawerOpen);
  const assessmentMode = useAIMessageStore((state) => state.assessmentMode);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const { transactions, calculatedData, dateRangeData } =
    useTransactionContext();

  const { dateRange, defaultPeriod } = dateRangeData;
  const formattedDateRange = useMemo(() => {
    return {
      ...dateRange,
      to:
        dateRange.to.getTime() > new Date().getTime()
          ? endOfDay(new Date())
          : dateRange.to,
    };
  }, [dateRange]);

  const calculationResults = useMemo(() => getCalculationSummary(transactions, calculatedData, defaultPeriod), [calculatedData, defaultPeriod, transactions]);

  const generateAssessment = useCallback(
    async (ignorePast = false) => {
      setIsLoading(true);
      const reportId = getReportAnalysisId(formattedDateRange, assessmentMode);
      const existingReport = await analysisRepository.getReport(reportId);

      if (existingReport && !ignorePast) {
        setStreamingResponse(existingReport.report);
        setIsLoading(false);
        return;
      }

      setStreamingResponse("");

      try {
        const genAI = new GoogleGenerativeAI(
          import.meta.env.VITE_GEMINI_API_KEY
        );
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const promptFunction =
          assessmentMode === AssessmentMode.SERIOUS
            ? GetPromptTemplate
            : GetRoastPromptTemplate;
        const prompt = promptFunction(
          calculationResults,
          formattedDateRange as SetDateRange
        );
        const result = await model.generateContentStream(prompt);

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          setStreamingResponse((prev) => prev + chunkText);
        }
      } catch (error) {
        console.error("Error generating AI assessment:", error);
        setStreamingResponse(
          "Sorry, there was an error generating your financial assessment. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [formattedDateRange, assessmentMode, calculationResults]
  );

  useEffect(() => {
    if (isOpen && calculationResults) {
      generateAssessment();
    }
  }, [isOpen, calculationResults, generateAssessment]);

  const handleOnClose = async () => {
    const reportId = getReportAnalysisId(formattedDateRange, assessmentMode);
    if (streamingResponse) {
      await analysisRepository.saveReport({
        id: reportId,
        report: streamingResponse,
        createdAt: new Date(),
      } as AnalysisReport);
      setDrawerOpen(false);
    } else {
      setDrawerOpen(false);
    }
  };

  const copyToClipboard = () => {
    const plainText = streamingResponse;
    navigator.clipboard.writeText(plainText).then(() => {
      setCopied(true);
      setTimeout(() => {
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      }, 0);
    });
  };

  return (
    <Drawer open={isOpen} onClose={handleOnClose}>
      <DrawerContent className="container mx-auto max-w-4xl">
        <DrawerHeader>
          <DrawerTitle className="flex gap-2 items-center ">
            <Sparkle className="h-6 w-6" />
            <span className="!text-foreground">
              AI Financial Assessment Report (
              {formatDate(formattedDateRange.from, "MMMM d, yyyy")} -{" "}
              {formatDate(formattedDateRange.to, "MMMM d, yyyy")})
            </span>
          </DrawerTitle>
          <DrawerDescription className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                <span>
                  Analyzing your financial data...
                </span>
              </div>
            ) : (
              <ScrollArea className="whitespace-pre-wrap prose h-[400px] rounded-md border max-w-none pt-4 px-4">
                {streamingResponse ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(streamingResponse),
                    }}
                  />
                ) : (
                  "Preparing your financial assessment..."
                )}
              </ScrollArea>
            )}
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <div className="flex justify-between w-full">
            <Button
              variant="secondary"
              onClick={() => generateAssessment(true)}
              disabled={isLoading}
              className="cursor-pointer"
            >
              Regenerate Assessment
            </Button>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={copyToClipboard}
                disabled={isLoading || !streamingResponse}
                className="flex items-center gap-2 cursor-pointer text-foreground"
              >
                {copied ? (
                  <ClipboardCheck className="h-4 w-4" />
                ) : (
                  <ClipboardCopy className="h-4 w-4" />
                )}
                Copy
              </Button>
              <DrawerClose>
                <Button
                  className="cursor-pointer"
                  variant="outline"
                  onClick={() => setDrawerOpen(false)}
                >
                  Close
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default BottomDrawer;
