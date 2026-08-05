import { activityLevels, followupLevels, groups, periodLabels } from "../data";
import { useDashboard } from "../dashboard/context";
import type { Customer, SortKey } from "../types";
import { activityClass, deltaClass, filteredCustomers, yuan } from "../utils";

const periodCompare: Record<
  "day" | "week" | "month",
  { label: string; key: SortKey }
> = {
  day: { label: "日环比", key: "day" },
  week: { label: "周环比", key: "week" },
  month: { label: "月环比", key: "month" },
};

export function CustomersPage() {
  const { state, patch } = useDashboard();
  const rows = filteredCustomers(state);
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(state.page, totalPages);
  const pageRows = rows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const sort = (key: SortKey) =>
    patch({
      sortKey: key,
      sortDirection:
        state.sortKey === key && state.sortDirection === "desc"
          ? "asc"
          : "desc",
      page: 1,
    });
  const sortable = (label: string, key: SortKey) => (
    <button
      className={`sort-button ${state.sortKey === key ? "active" : ""}`}
      onClick={() => sort(key)}
    >
      {label}
      <span className="sort-icon">
        {state.sortKey === key
          ? state.sortDirection === "asc"
            ? "↑"
            : "↓"
          : "↕"}
      </span>
    </button>
  );

  const commonCells = (row: Customer) => (
    <>
      <td>
        <button
          className="link-button"
          onClick={() => patch({ route: "detail", selectedCustomer: row.name })}
        >
          {row.name}
        </button>
      </td>
      <td>{row.platform}</td>
      <td>{yuan(row.sales)}</td>
      <td>{yuan(row.sales7d)}</td>
      <td>{yuan(row.sales30d)}</td>
      <td>{row.orders}</td>
      <td>{row.lastOrderDate}</td>
      <td>{row.mainProduct}</td>
      <td className={deltaClass(row.yoy)}>{row.yoy}</td>
    </>
  );

  return (
    <>
      <div className="panel filters">
        <select
          className="field"
          aria-label="平台筛选"
          value={state.customerPlatform}
          onChange={(event) =>
            patch({ customerPlatform: event.target.value, page: 1 })
          }
        >
          <option value="all">全部平台</option>
          {groups[state.group].platforms.map((platform) => (
            <option key={platform}>{platform}</option>
          ))}
        </select>
        <select
          className="field"
          aria-label="活跃程度筛选"
          value={state.activity}
          onChange={(event) => patch({ activity: event.target.value, page: 1 })}
        >
          <option value="all">全部活跃程度</option>
          {activityLevels.map((level) => (
            <option key={level}>{level}</option>
          ))}
        </select>
        <select
          className="field"
          aria-label="跟进状态筛选"
          value={state.followup}
          onChange={(event) => patch({ followup: event.target.value, page: 1 })}
        >
          <option value="all">全部跟进状态</option>
          {followupLevels.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <input
          className="field"
          aria-label="搜索客户名称"
          placeholder="搜索客户名称"
          value={state.search}
          onChange={(event) => patch({ search: event.target.value, page: 1 })}
        />
        <button
          className="secondary-button"
          onClick={() =>
            patch({
              customerPlatform: "all",
              activity: "all",
              followup: "all",
              search: "",
              page: 1,
            })
          }
        >
          重置筛选
        </button>
      </div>

      <article className="card">
        <div className="card-title">
          <div>
            <h2>客户列表页</h2>
            <p>
              默认展示 20 条；销售额、近 7 日、近 30
              日、同比及环比字段支持排序。
            </p>
          </div>
          <span className="status-chip">
            当前时间维度：{periodLabels[state.period]}
          </span>
        </div>
        <div className="table-wrap customer-table">
          <table>
            <thead>
              <tr>
                <th>客户名称</th>
                <th>平台</th>
                <th>{sortable("销售额", "sales")}</th>
                <th>{sortable("近 7 日销售额", "sales7d")}</th>
                <th>{sortable("近 30 日销售额", "sales30d")}</th>
                <th>拿货次数</th>
                <th>最近拿货时间</th>
                <th>主要拿货产品</th>
                <th>{sortable("同比", "yoy")}</th>
                {state.period === "custom" ? (
                  <>
                    <th>{sortable("月月环比", "monthOnMonth")}</th>
                    <th>{sortable("季度环比", "quarter")}</th>
                    <th>{sortable("半年环比", "half")}</th>
                  </>
                ) : (
                  <th>
                    {sortable(
                      periodCompare[state.period].label,
                      periodCompare[state.period].key,
                    )}
                  </th>
                )}
                <th>活跃程度</th>
                <th>跟进状态</th>
                <th>建议跟进动作</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length ? (
                pageRows.map((row) => (
                  <tr key={row.name}>
                    {commonCells(row)}
                    {state.period === "custom" ? (
                      <>
                        <td className={deltaClass(row.monthOnMonth)}>
                          {row.monthOnMonth}
                        </td>
                        <td className={deltaClass(row.quarter)}>
                          {row.quarter}
                        </td>
                        <td className={deltaClass(row.half)}>{row.half}</td>
                      </>
                    ) : (
                      (() => {
                        const key = periodCompare[state.period].key as
                          "day" | "week" | "month";
                        return (
                          <td className={deltaClass(row[key])}>{row[key]}</td>
                        );
                      })()
                    )}
                    <td>
                      <span
                        className={`activity-chip ${activityClass(row.activity)}`}
                      >
                        {row.activity}
                      </span>
                    </td>
                    <td>{row.followup}</td>
                    <td>{row.suggestion}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={state.period === "custom" ? 15 : 13}>
                    <div className="empty">没有符合当前筛选条件的客户</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>
            展示 {rows.length ? (currentPage - 1) * pageSize + 1 : 0}-
            {Math.min(currentPage * pageSize, rows.length)} 条，共 {rows.length}{" "}
            条
          </span>
          <div className="pager-buttons">
            <button
              disabled={currentPage === 1}
              onClick={() => patch({ page: currentPage - 1 })}
            >
              上一页
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  className={page === currentPage ? "active" : ""}
                  key={page}
                  onClick={() => patch({ page })}
                >
                  {page}
                </button>
              ),
            )}
            <button
              disabled={currentPage === totalPages}
              onClick={() => patch({ page: currentPage + 1 })}
            >
              下一页
            </button>
          </div>
        </div>
      </article>
    </>
  );
}
