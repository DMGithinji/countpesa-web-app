import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkle } from "lucide-react";
import useSidepanelStore from "@/stores/ui.store";
import { AssessmentMode } from "@/types/AITools";
import { useCallback } from "react";
import useAIMessageStore from "@/stores/aiMessages.store";

const AnalysisInitiator = () => {
  const openDrawer = useSidepanelStore((state) => state.setDrawerOpen);
  const setAssessmentMode = useAIMessageStore(
    (state) => state.setAssessmentMode
  );

  const handleAssessment = useCallback((mode: AssessmentMode) => {
    console.log(mode)
    setAssessmentMode(mode);
    openDrawer(true);
  }, [openDrawer, setAssessmentMode]);

  return (
    <div className="flex items-center space-x-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={'outline'} className="flex items-center gap-2">
            <Sparkle className="h-4 w-4" />
            <span className="hidden sm:block">Get Assessment</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => handleAssessment(AssessmentMode.SERIOUS)}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-800"></div>
              Serious Mode
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleAssessment(AssessmentMode.ROAST)}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-400"></div>
              Roast Mode
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AnalysisInitiator;
