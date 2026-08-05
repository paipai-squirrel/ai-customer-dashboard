import { useRef, useState, type ChangeEvent } from "react";
import { groups, uploadRecords } from "../data";
import { useDashboard } from "../dashboard/context";

interface Feedback {
  message: string;
  error: boolean;
}

export function UploadPage() {
  const { state, patch } = useDashboard();
  const inputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const platforms = groups[state.group].platforms;
  const activePlatform = platforms.includes(state.uploadPlatform)
    ? state.uploadPlatform
    : platforms[0];

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const valid = /\.(csv|xlsx)$/i.test(file.name);
    setFeedback({
      error: !valid,
      message: valid
        ? `已选择：${file.name}。平台：${activePlatform}；数据日期：${state.selectedDate}。`
        : "文件格式不支持，请选择 CSV 或 XLSX 文件。",
    });
  };

  return (
    <div className="upload-layout">
      <article className="card">
        <div className="card-title">
          <div>
            <h2>销售数据上传页</h2>
            <p>上传入口按平台展示；一个文件只对应一个平台。</p>
          </div>
          <span className="status-chip">指定具体日期</span>
        </div>
        <div className="inline-tabs upload-tabs">
          {platforms.map((platform) => (
            <button
              key={platform}
              className={`pill-button ${activePlatform === platform ? "active" : ""}`}
              onClick={() => {
                patch({ uploadPlatform: platform });
                setFeedback(null);
              }}
            >
              {platform}
            </button>
          ))}
        </div>
        <div className="upload-box">
          <div>
            <div className="upload-icon">↑</div>
            <h3>上传 {activePlatform} 销售数据</h3>
            <p>
              支持 CSV /
              XLSX。演示环境仅在浏览器本地展示文件选择结果，不会发送数据。
            </p>
            <button
              className="primary-button"
              onClick={() => inputRef.current?.click()}
            >
              选择销售数据文件
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx"
              hidden
              onChange={handleUpload}
            />
            {feedback && (
              <div
                className={`upload-feedback ${feedback.error ? "error" : ""}`}
                role="status"
              >
                {feedback.message}
              </div>
            )}
          </div>
        </div>
        <div className="notice upload-notice">
          上传记录保留上传人、上传时间、平台、文件名、成功 / 失败状态。
        </div>
      </article>

      <article className="card">
        <div className="card-title">
          <h2>上传记录</h2>
          <span className="soft-chip">最近记录</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>上传人</th>
                <th>上传时间</th>
                <th>平台</th>
                <th>文件名</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {uploadRecords.map((row) => (
                <tr key={`${row.uploadedAt}-${row.fileName}`}>
                  <td>{row.uploader}</td>
                  <td>{row.uploadedAt}</td>
                  <td>{row.platform}</td>
                  <td>{row.fileName}</td>
                  <td>
                    <span
                      className={
                        row.status === "成功"
                          ? "activity-chip high"
                          : "risk-chip"
                      }
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
