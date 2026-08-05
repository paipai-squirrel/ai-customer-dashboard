import { groups } from "../data";
import { useDashboard } from "../dashboard/context";
import type { Period } from "../types";

const periods: Array<[Period, string]> = [
  ["day", "日"],
  ["week", "周"],
  ["month", "月"],
  ["custom", "自定义日期"],
];

export function Toolbar() {
  const { state, patch } = useDashboard();

  if (state.route === "detail") {
    return (
      <section className="panel toolbar">
        <button
          className="secondary-button"
          onClick={() => patch({ route: "customers" })}
        >
          ← 返回客户列表
        </button>
        <span className="status-chip">
          当前小组：{groups[state.group].name}
        </span>
      </section>
    );
  }

  if (state.route === "upload") {
    return (
      <section className="panel toolbar">
        <span className="soft-chip">时间选择维度：指定具体日期</span>
        <input
          className="field"
          type="date"
          value={state.selectedDate}
          aria-label="上传数据日期"
          onChange={(event) => patch({ selectedDate: event.target.value })}
        />
      </section>
    );
  }

  return (
    <section className="panel toolbar">
      <div className="period-tabs">
        {periods.map(([key, label]) => (
          <button
            key={key}
            className={`tab-button ${state.period === key ? "active" : ""}`}
            onClick={() => patch({ period: key })}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="date-fields">
        {state.period === "custom" ? (
          <>
            <input
              className="field"
              type="date"
              value={state.dateStart}
              max={state.dateEnd}
              aria-label="开始日期"
              onChange={(event) => patch({ dateStart: event.target.value })}
            />
            <span className="date-separator">至</span>
            <input
              className="field"
              type="date"
              value={state.dateEnd}
              min={state.dateStart}
              aria-label="结束日期"
              onChange={(event) => patch({ dateEnd: event.target.value })}
            />
          </>
        ) : (
          <input
            className="field"
            type="date"
            value={state.selectedDate}
            aria-label="统计日期"
            onChange={(event) => patch({ selectedDate: event.target.value })}
          />
        )}
      </div>
    </section>
  );
}
