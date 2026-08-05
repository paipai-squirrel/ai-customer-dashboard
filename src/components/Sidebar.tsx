import { groups } from "../data";
import { useDashboard } from "../dashboard/context";
import type { GroupKey, Route } from "../types";

const basePages: Array<[Route, string, string]> = [
  ["analysis", "组别分析页", ""],
  ["customers", "客户列表页", "筛选/排序"],
  ["detail", "客户详情页", "客户画像"],
];

export function Sidebar() {
  const { state, patch, switchRole, selectGroup } = useDashboard();
  const pages =
    state.role === "leader"
      ? [
          ...basePages,
          ["upload", "销售数据上传页", "数据上传"] as [Route, string, string],
        ]
      : basePages;

  const toggleGroup = (key: GroupKey) => {
    if (state.expandedGroup === key) {
      patch({ expandedGroup: null });
      return;
    }
    selectGroup(key);
  };

  const openPage = (key: GroupKey, route: Route) => {
    if (key !== state.group) selectGroup(key);
    patch({ group: key, expandedGroup: key, route });
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">AI</div>
        <div>
          <div className="brand-title">客户经营看板</div>
          <div className="brand-subtitle">渠道部 · 智能经营分析</div>
        </div>
      </div>

      <div className="role-card">
        <div className="role-label">工作台角色</div>
        <div className="segmented">
          <button
            className={state.role === "supervisor" ? "active" : ""}
            onClick={() => switchRole("supervisor")}
          >
            主管端
          </button>
          <button
            className={state.role === "leader" ? "active" : ""}
            onClick={() => switchRole("leader")}
          >
            组长端
          </button>
        </div>
      </div>

      <nav className="nav-section" aria-label="主导航">
        <div className="nav-title">
          {state.role === "supervisor" ? "主管端页面" : "组长端页面"}
        </div>
        {state.role === "supervisor" && (
          <button
            className={`nav-button ${state.route === "overview" ? "active" : ""}`}
            onClick={() => patch({ route: "overview", expandedGroup: null })}
          >
            <span>渠道总览页</span>
          </button>
        )}

        <div className="group-nav">
          {(
            Object.entries(groups) as Array<
              [GroupKey, (typeof groups)[GroupKey]]
            >
          ).map(([key, group]) => {
            const isOpen = state.expandedGroup === key;
            return (
              <div className="group-container" key={key}>
                <button
                  className={`group-toggle ${isOpen ? "open" : ""}`}
                  aria-expanded={isOpen}
                  onClick={() => toggleGroup(key)}
                >
                  <span className="group-toggle-main">
                    <strong>{group.name}</strong>
                    <small>{group.platforms.length} 个平台</small>
                  </span>
                  <span className="group-chevron" aria-hidden="true">
                    ›
                  </span>
                </button>
                {!isOpen ? null : (
                  <div className="group-pages">
                    {pages.map(([route, label, hint]) => (
                      <button
                        key={route}
                        className={`nav-button ${state.group === key && state.route === route ? "active" : ""}`}
                        onClick={() => openPage(key, route)}
                      >
                        <span>{label}</span>
                        {hint && <span className="hint">{hint}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      <div className="side-note">
        演示数据仅用于前端交互预览。工程已预留数据服务层，可替换为真实接口。
      </div>
    </aside>
  );
}
