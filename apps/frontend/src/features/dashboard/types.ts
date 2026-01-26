export interface DashboardSummary {
  income: number;
  expense: number;
  cashFlow: number;
  totalAvailable: number;
}

export interface ChartData {
  categoryName: string;
  total: number;
  color: string;
}

export interface ExpensesAnalysis {
  fixed: number;
  variable: number;
}

export interface DashboardReportResponse {
  summary: DashboardSummary;
  chartData: ChartData[];
  expensesAnalysis: ExpensesAnalysis;
}
