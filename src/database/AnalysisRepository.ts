import { SetDateRange } from "@/lib/getDateRangeData";
import db from "./schema";
import { AnalysisReport, AssessmentMode } from "@/types/AITools";
import { format } from "date-fns";

export class AnalysisRepository {

  async saveReport(report: AnalysisReport) {
    const exists = await db.analysisReports.get(report.id);
    if (exists) {
      return db.analysisReports.update(report.id, report);
    }
    return await db.analysisReports.add(report);
  }

  async getReport(id: string) {
    return db.analysisReports.get(id);
  }
}

export const getReportAnalysisId = (dateRange: SetDateRange, assessmentMode: AssessmentMode) => `${format(dateRange.from, 'dd-MM-yyyy')}-${format(dateRange.to, 'dd-MM-yyyy')}_${assessmentMode}`

// Create a singleton instance
const analysisRepository = new AnalysisRepository();
export default analysisRepository;
