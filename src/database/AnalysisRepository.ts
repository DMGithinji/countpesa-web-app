import { SetDateRange } from "@/lib/getDateRangeData";
import db from "./schema";
import { AnalysisReport, AssessmentMode } from "@/types/AITools";

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

export const getReportAnalysisId = (dateRange: SetDateRange, assessmentMode: AssessmentMode) => `${dateRange.from}-${dateRange.to}_${assessmentMode}`

// Create a singleton instance
const analysisRepository = new AnalysisRepository();
export default analysisRepository;
