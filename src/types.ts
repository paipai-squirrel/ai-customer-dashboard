export type Role = "supervisor" | "leader";
export type GroupKey = "private" | "talent" | "distribution";
export type Route = "overview" | "analysis" | "customers" | "detail" | "upload";
export type Period = "day" | "week" | "month" | "custom";
export type SortDirection = "asc" | "desc";
export type SortKey =
  | "sales"
  | "sales7d"
  | "sales30d"
  | "yoy"
  | "month"
  | "week"
  | "day"
  | "monthOnMonth"
  | "quarter"
  | "half";

export interface Group {
  name: string;
  short: string;
  platforms: string[];
}

export interface Customer {
  name: string;
  platform: string;
  sales: number;
  sales7d: number;
  sales30d: number;
  orders: number;
  lastOrderDate: string;
  mainProduct: string;
  yoy: string;
  month: string;
  week: string;
  day: string;
  monthOnMonth: string;
  quarter: string;
  half: string;
  activity: string;
  followup: string;
  suggestion: string;
}

export interface DashboardState {
  role: Role;
  group: GroupKey;
  route: Route;
  expandedGroup: GroupKey | null;
  period: Period;
  dateStart: string;
  dateEnd: string;
  selectedDate: string;
  uploadPlatform: string;
  selectedCustomer: string;
  customerPlatform: string;
  activity: string;
  followup: string;
  search: string;
  sortKey: SortKey;
  sortDirection: SortDirection;
  page: number;
}

export interface UploadRecord {
  uploader: string;
  uploadedAt: string;
  platform: string;
  fileName: string;
  status: "成功" | "失败";
}
