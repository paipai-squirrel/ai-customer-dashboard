import { useDashboard } from "../dashboard/context";
import { activityClass, customersForGroup, yuan } from "../utils";

export function DetailPage() {
  const { state } = useDashboard();
  const customers = customersForGroup(state);
  const customer =
    customers.find((row) => row.name === state.selectedCustomer) ??
    customers[0];
  const isRisk = ["风险", "预警", "流失"].some((word) =>
    customer.activity.includes(word),
  );
  const info = [
    ["客户名称", customer.name],
    ["合作开始时间", "2025-03-18"],
    ["客户活跃度", customer.activity],
    ["风险原因", isRisk ? "近 7 日拿货下降，最近拿货间隔拉长" : "暂无明显风险"],
    ["跟进动作", customer.suggestion],
    ["所属平台", customer.platform],
  ];
  const metrics = [
    ["销售金额", yuan(customer.sales)],
    ["近 7 日销售金额", yuan(customer.sales7d)],
    ["近 30 日销售金额", yuan(customer.sales30d)],
    ["平均单次拿货金额", yuan(Math.round(customer.sales30d / customer.orders))],
    ["同比", customer.yoy],
    ["拿货次数", customer.orders],
    ["日环比", customer.day],
    ["周环比", customer.week],
    ["月环比", customer.month],
  ];

  return (
    <>
      <div className="detail-hero">
        <article className="card">
          <div className="card-title">
            <h2>客户基础信息</h2>
            <span
              className={`activity-chip ${activityClass(customer.activity)}`}
            >
              {customer.activity}
            </span>
          </div>
          <div className="info-grid">
            {info.map(([label, value]) => (
              <div className="info-cell" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </article>
        <article className="card">
          <div className="card-title">
            <h2>销售金额模块</h2>
          </div>
          <div className="metric-grid">
            {metrics.map(([label, value]) => (
              <div className="mini-metric" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="card">
        <div className="card-title">
          <h2>拿货趋势板块</h2>
        </div>
        <div className="grid three">
          {["日", "周", "月"].map((unit, index) => (
            <div className="table-wrap" key={unit}>
              <table className="compact-table">
                <thead>
                  <tr>
                    <th colSpan={3}>{unit}拿货趋势</th>
                  </tr>
                  <tr>
                    <th>产品</th>
                    <th>拿货数量</th>
                    <th>拿货金额</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{customer.mainProduct}</td>
                    <td>{120 + index * 180}</td>
                    <td>{yuan(28600 + index * 46200)}</td>
                  </tr>
                  <tr>
                    <td>新品体验装</td>
                    <td>{48 + index * 74}</td>
                    <td>{yuan(9600 + index * 18800)}</td>
                  </tr>
                  <tr>
                    <td>会员专享套装</td>
                    <td>{32 + index * 52}</td>
                    <td>{yuan(7200 + index * 12800)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </article>
    </>
  );
}
