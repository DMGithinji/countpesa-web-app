import Dexie from "dexie";
import { AnalysisReport } from "@/prompts/types";
import db from "./schema";

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
    return this.getReportTable().add(report);
  }

  async getReport(id: string) {
    return this.getReportTable().get(id);
  }
}
