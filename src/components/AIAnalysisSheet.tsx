import { useRef } from "react";
import { marked } from "marked";
import { Download, Sparkle } from "lucide-react";
import { formatDate } from "date-fns";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import useUiStore from "@/stores/ui.store";
import usePrint from "@/hooks/usePrint";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";

function AIAnalysisSheet() {
  const isOpen = useUiStore((state) => state.drawerOpen);
  const setDrawerOpen = useUiStore((state) => state.setDrawerOpen);
  const reportContentRef = useRef(null);

  const printReport = usePrint();
  const { isLoading, aiResponse, reportRange, saveOnClose, generateAssessment } = useAIAnalysis({
    isAnalysisSheetOpen: isOpen,
  });

  const handleOnClose = async () => {
    await saveOnClose();
    setDrawerOpen(false);
  };

  return (
    <Drawer open={isOpen} onClose={handleOnClose}>
      <DrawerContent className="container mx-auto max-w-4xl">
        <DrawerHeader>
          <DrawerTitle className="flex gap-2 items-center">
            <Sparkle className="h-6 w-6" />
            <span className="!text-foreground">
              AI Financial Assessment Report ({formatDate(reportRange.from, "MMMM d, yyyy")} -{" "}
              {formatDate(reportRange.to, "MMMM d, yyyy")})
            </span>
          </DrawerTitle>
          <DrawerDescription className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
                <span>Analyzing your financial data...</span>
              </div>
            ) : (
              <ScrollArea className="whitespace-pre-wrap prose h-[400px] rounded-md border max-w-none pt-4 px-4">
                <div
                  id="report-content-container"
                  ref={reportContentRef}
                  className="p-4 report-content"
                  data-report-content="true"
                  dangerouslySetInnerHTML={{
                    __html: aiResponse
                      ? marked.parse(aiResponse)
                      : "<p>Preparing your financial assessment...</p>",
                  }}
                />
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
                onClick={() => printReport({ aiResponse, reportRange })}
                disabled={isLoading || !aiResponse}
                className="flex items-center gap-2 cursor-pointer text-foreground"
              >
                <Download className="h-4 w-4" />
                Print Report
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
}

export default AIAnalysisSheet;
