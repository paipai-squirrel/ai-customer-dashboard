import { groups, periodLabels } from "../data";
import { useDashboard } from "../dashboard/context";
import { yuan } from "../utils";

const trendValues: Record<string, number> = {
  销售同比: 12.5,
  日环比: 3.8,
  周环比: 8.2,
  月环比: -2.6,
  同比: 11.2,
  月月环比: 4.8,
  季度环比: 9.6,
  半年环比: 15.3,
};

export function OverviewPage({ mode }: { mode: "overview" | "analysis" }) {
  const { state } = useDashboard();
  const group = groups[state.group];
  const salesRows: Array<[string, number, number, number]> =
    mode === "overview"
      ? [
          ["整体", 88420, 527600, 2198400],
          ["私域组", 28600, 168200, 760300],
          ["达人组", 34220, 203400, 827800],
          ["分销组", 25600, 156000, 610300],
        ]
      : [
          ["整体", 28600, 168200, 760300],
          ...group.platforms.map(
            (platform, index) =>
              [
                platform,
                13200 + index * 5200,
                71200 + index * 18600,
                302400 + index * 98500,
              ] as [string, number, number, number],
          ),
        ];

  const metricLabels =
    mode === "overview"
      ? ["整体", "私域组", "达人组", "分销组"]
      : ["整体", ...group.platforms];
  const baseTrendLabels =
    state.period === "custom"
      ? ["同比", "月月环比", "季度环比", "半年环比"]
      : ["销售同比", "日环比", "周环比", "月环比"];
  let trendLabels = baseTrendLabels;
  let omitted = "";
  if (state.period === "custom") {
    const start = new Date(`${state.dateStart}T00:00:00`);
    const end = new Date(`${state.dateEnd}T00:00:00`);
    const sameMonth =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth();
    const sameQuarter =
      start.getFullYear() === end.getFullYear() &&
      Math.floor(start.getMonth() / 3) === Math.floor(end.getMonth() / 3);
    trendLabels = [
      "同比",
      ...(sameMonth ? ["月月环比"] : []),
      ...(sameQuarter ? ["季度环比"] : []),
      "半年环比",
    ];
    if (!sameQuarter)
      omitted = "当前日期范围跨季度，月月环比和季度环比不展示。";
    else if (!sameMonth) omitted = "当前日期范围跨月，月月环比不展示。";
  }

  return (
    <div className="section-stack">
      <article className="card">
        <div className="card-title">
          <h2>销售指标模块</h2>
          <span className="status-chip">二维表格</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>维度</th>
                <th>昨日总金额</th>
                <th>近 7 日总销售金额</th>
                <th>近 30 日总销售金额</th>
              </tr>
            </thead>
            <tbody>
              {salesRows.map((row) => (
                <tr key={row[0]}>
                  <td>
                    <strong>{row[0]}</strong>
                  </td>
                  <td>{yuan(row[1])}</td>
                  <td>{yuan(row[2])}</td>
                  <td>{yuan(row[3])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="card">
        <div className="card-title">
          <h2>趋势指标模块</h2>
          <span className="soft-chip">
            当前时间维度：{periodLabels[state.period]}
          </span>
        </div>
        <div className="trend-list">
          {trendLabels.map((label) => {
            const value = trendValues[label];
            return (
              <div className="trend-item" key={label}>
                <strong>{label}</strong>
                <div className="track">
                  <span
                    className={value < 0 ? "negative" : ""}
                    style={{ width: `${Math.max(18, Math.abs(value) * 5)}%` }}
                  />
                </div>
                <span className={value < 0 ? "delta-down" : "delta-up"}>
                  {value > 0 ? "+" : ""}
                  {value}%
                </span>
              </div>
            );
          })}
          {omitted && <div className="notice">{omitted}</div>}
        </div>
      </article>

      <div className="grid">
        {metricLabels.map((label, index) => {
          const metrics = [
            ["客户总数", 360 - index * 38],
            ["高活跃客户数", 86 - index * 9],
            ["活跃客户", 128 - index * 13],
            ["稳定客户", 74 - index * 7],
            ["观察客户", 42 + index * 3],
            ["风险客户", 21 + index * 2],
            ["流失预警客户", 12 + index],
            ["流失客户", 7 + index],
          ];
          return (
            <article className="card" key={label}>
              <div className="card-title">
                <h3>{label}</h3>
                <span className="soft-chip">客户展示模块</span>
              </div>
              <div className="metric-grid">
                {metrics.map(([metric, value]) => (
                  <div className="mini-metric" key={metric}>
                    <span>{metric}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
