import { Component, type ErrorInfo, type ReactNode } from "react";
import { reportRuntimeError } from "../monitoring";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportRuntimeError(error, { componentStack: info.componentStack });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="fatal-error" role="alert">
        <div>
          <span>页面运行异常</span>
          <h1>看板暂时无法显示</h1>
          <p>错误已经记录。你可以刷新页面重试，筛选条件会从地址栏恢复。</p>
          <button onClick={() => window.location.reload()}>刷新页面</button>
        </div>
      </main>
    );
  }
}
