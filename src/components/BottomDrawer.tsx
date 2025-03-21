import { GoogleGenerativeAI } from "@google/generative-ai";
import { marked } from 'marked';
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
import useSidepanelStore from "@/stores/sidepanel.store";
import { useEffect, useMemo, useState } from "react";
import { useCalculate } from "@/hooks/useCalculate";
import { ScrollArea } from "./ui/scroll-area";
import { ClipboardCheck, ClipboardCopy, Sparkle } from "lucide-react";
import { useDateRange } from "@/hooks/useDateRange";
import { AssessmentMode, GetPromptTemplate, GetRoastPromptTemplate } from "@/types/PromptTemplate";
import { groupTransactionsByPeriod, Period } from "@/lib/groupByPeriod";
import useTransactionStore from "@/stores/transactions.store";
import { Transaction } from "@/types/Transaction";
import { calculateTransactionTotals } from "@/lib/getTotal";
import { formatDate } from "date-fns";

const BottomDrawer = () => {
  const isOpen = useSidepanelStore((state) => state.drawerOpen);
  const setDrawerOpen = useSidepanelStore((state) => state.setDrawerOpen);
  const assessmentMode = useSidepanelStore((state) => state.assessmentMode);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const transactions = useTransactionStore((state) => state.transactions);
  const { dateRange, defaultPeriod } = useDateRange();
  const {
    transactionTotals,
    balance,
    balanceTrend,
    topAccountsSentToByAmt,
    topAccountsReceivedFromByAmt,
    topCategoriesMoneyInByAmt,
    topCategoriesMoneyOutByAmt,
    topAccountsSentToByCount,
    topAccountsReceivedFromByCount,
    topCategoriesMoneyInByCount,
    topCategoriesMoneyOutByCount,
  } = useCalculate();

  const calculationResults = useMemo(() => ({
    transactionTotals,
    balance,
    balanceTrend,
    dataGroupedByPeriod: getPeriodData(transactions, defaultPeriod),
    topAccountsSentToByAmt: topAccountsSentToByAmt.slice(0, 15),
    topAccountsReceivedFromByAmt: topAccountsReceivedFromByAmt.slice(0, 15),
    topCategoriesMoneyInByAmt: topCategoriesMoneyInByAmt.slice(0, 15),
    topCategoriesMoneyOutByAmt: topCategoriesMoneyOutByAmt.slice(0, 15),
    topAccountsSentToByCount: topAccountsSentToByCount.slice(0, 15),
    topAccountsReceivedFromByCount: topAccountsReceivedFromByCount.slice(0, 15),
    topCategoriesMoneyInByCount: topCategoriesMoneyInByCount.slice(0, 15),
    topCategoriesMoneyOutByCount: topCategoriesMoneyOutByCount.slice(0, 15),
  }), [])

  useEffect(() => {
    if (isOpen && calculationResults) {
      generateAssessment(calculationResults);
    }
  }, [isOpen, calculationResults]);

  const generateAssessment = async (data) => {
    setIsLoading(true);
    setStreamingResponse("");

    try {
      // Initialize Google Generative AI
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const promptFunction = assessmentMode === AssessmentMode.SERIOUS ? GetPromptTemplate : GetRoastPromptTemplate;
      const prompt = promptFunction(data, dateRange);
      const result = await model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        setStreamingResponse(prev => prev + chunkText);
      }
    } catch (error) {
      console.error("Error generating AI assessment:", error);
      setStreamingResponse("Sorry, there was an error generating your financial assessment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

    // Function to copy assessment to clipboard
    const copyToClipboard = () => {
      // Convert markdown to plain text for clipboard
      const plainText = streamingResponse;
      navigator.clipboard.writeText(plainText)
        .then(() => {
            setCopied(true);
          setTimeout(() => {
            setTimeout(() => {
              setCopied(false);
            }, 2000);
          }, 0);

        });
    };



  return (
    <Drawer open={isOpen} onClose={() => setDrawerOpen(false)}>
      <DrawerContent className="container mx-auto max-w-4xl">
      <DrawerHeader>
          <DrawerTitle className="flex gap-2 items-center ">
            <Sparkle className="h-6 w-6 !text-slate-800" />
              <span className="!text-slate-800">AI Financial Assessment Report ({formatDate(dateRange.from, 'MMMM d, yyyy')} - {formatDate(dateRange.to, 'MMMM d, yyyy')})</span>
          </DrawerTitle>
          <DrawerDescription className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                <span>Analyzing your financial data...</span>
              </div>
            ) : (
              <ScrollArea  className="whitespace-pre-wrap prose h-[400px] rounded-md border max-w-none pt-4 px-4">
                {streamingResponse ? (
                  <div dangerouslySetInnerHTML={{ __html: marked.parse(streamingResponse) }} />
                ) : (
                  "Preparing your financial assessment..."
                )}
              </ScrollArea >
            )}
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <div className="flex justify-between w-full">
            <Button
              variant="secondary"
              onClick={() => generateAssessment(calculationResults)}
              disabled={isLoading}
            >
              Regenerate Assessment
            </Button>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={copyToClipboard}
                disabled={isLoading || !streamingResponse}
                className="flex items-center gap-2"
              >
                {copied ? <ClipboardCheck className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                Copy
              </Button>
              <DrawerClose>
                <Button variant="outline" onClick={() => setDrawerOpen(false)}>Close</Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default BottomDrawer;

const getPeriodData = (transactions: Transaction[], period: Period) => {
  const groupedTransactions = groupTransactionsByPeriod(transactions, period);

  const summed = Object.keys(groupedTransactions).map(period => {
    const { totalAmount, moneyInAmount, moneyOutAmount} = calculateTransactionTotals(groupedTransactions[period])
    return { period, totalAmount, moneyInAmount, moneyOutAmount }
  })
  return summed
}