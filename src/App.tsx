import { Sidebar } from "./components/Sidebar";
import { Toolbar } from "./components/Toolbar";
import { groups } from "./data";
import { DashboardProvider } from "./dashboard/DashboardProvider";
import { useDashboard } from "./dashboard/context";
import { CustomersPage } from "./pages/CustomersPage";
import { DetailPage } from "./pages/DetailPage";
import { OverviewPage } from "./pages/OverviewPage";
import { UploadPage } from "./pages/UploadPage";
import "./App.css";

function Dashboard() {
  const { state } = useDashboard();
  const group = groups[state.group];
  const titles = {
    overview: "渠道总览页",
    analysis: `${group.name} · 组别分析页`,
    customers: `${group.name} · 客户列表页`,
    detail: `${state.selectedCustomer} · 客户详情页`,
    upload: `${group.name} · 销售数据上传页`,
  };

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <header className="topbar">
          <div>
            <div className="eyebrow">
              {state.role === "supervisor"
                ? "SUPERVISOR VIEW"
                : "GROUP LEADER VIEW"}
            </div>
            <h1>{titles[state.route]}</h1>
            <p className="subtitle">
              聚合渠道销售与客户活跃数据，辅助团队快速识别增长机会与经营风险。
            </p>
          </div>
          <span className="live-indicator">
            <i /> 演示数据
          </span>
        </header>
        <Toolbar />
        <section className="content" aria-live="polite">
          {state.route === "overview" && <OverviewPage mode="overview" />}
          {state.route === "analysis" && <OverviewPage mode="analysis" />}
          {state.route === "customers" && <CustomersPage />}
          {state.route === "detail" && <DetailPage />}
          {state.route === "upload" && <UploadPage />}
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  );
}
