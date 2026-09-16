import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui';

interface Props {
  children: ReactNode;
  /** Nhãn vùng bị lỗi để người dùng biết phần nào hỏng */
  area?: string;
}

interface State {
  error: Error | null;
}

/** 2 cấp: root app và mỗi route — 1 màn hình hỏng không làm trắng cả app (05_FRONTEND §16) */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', this.props.area ?? 'app', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        role="alert"
        className="m-4 flex flex-col items-center gap-3 rounded-lg border border-error/30 bg-error-subtle p-8 text-center"
      >
        <h2 className="text-h3 text-text-primary">Màn hình này gặp sự cố</h2>
        <p className="max-w-md text-body-sm text-text-secondary">
          Phần {this.props.area ?? 'giao diện'} không hiển thị được. Các phần khác của ứng dụng vẫn
          dùng bình thường. Tải lại trang để thử lại.
        </p>
        <Button
          variant="secondary"
          onClick={() => window.location.reload()}
          leftIcon={<RotateCcw className="size-5" />}
        >
          Tải lại trang
        </Button>
      </div>
    );
  }
}
