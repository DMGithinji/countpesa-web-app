import { SetDateRange } from "@/lib/getDateRangeData";
import db from "./schema";
import { AnalysisReport, AssessmentMode } from "@/types/AITools";
import { format } from "date-fns";
import Dexie from "dexie";

export default class AnalysisRepository {
  private isDemo: boolean;

  constructor(isDemo: boolean = false) {
    this.isDemo = isDemo;
  }

  protected getReportTable(): Dexie.Table<AnalysisReport, string> {
    return this.isDemo ? db.demoAnalysisReports : db.analysisReports;
  }

  async saveReport(report: AnalysisReport) {
    const exists = await this.getReportTable().get(report.id);
    if (exists) {
      return this.getReportTable().update(report.id, report);
    }
    return await this.getReportTable().add(report);
  }

  async getReport(id: string) {
    return this.getReportTable().get(id);
  }
}

export const getReportAnalysisId = (
  dateRange: SetDateRange,
  assessmentMode: AssessmentMode
) =>
  `${format(dateRange.from, "dd-MM-yyyy")}-${format(
    dateRange.to,
    "dd-MM-yyyy"
  )}_${assessmentMode}`;
