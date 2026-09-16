import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { AlertOctagon, LogIn, Sprout } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { useAuth } from '@/stores/auth-context';
import { toAppError } from '@/services/http';
import { ROUTES } from '@/constants/routes';
import { loginSchema } from '../schemas/login.schema';
import type { LoginFormValues } from '../schemas/login.schema';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  // Quét QR khi chưa đăng nhập → quay lại đúng cây sau khi login (09_DECISIONS D1)
  const redirectTo = searchParams.get('redirect') || ROUTES.dashboard;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      await login(values);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      // Lỗi hiển thị đầu form, KHÔNG xóa dữ liệu đã nhập (05_FRONTEND §6.1)
      setFormError(toAppError(error).message);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Sprout aria-hidden className="size-6 text-primary" />
          <h1 className="text-h2 text-text-primary">Durian QR</h1>
          <p className="text-body-sm text-text-secondary">
            Quản lý tình trạng cây sầu riêng qua mã QR. Đăng nhập để tiếp tục.
          </p>
        </div>

        <Card>
          {formError && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-md border border-error/30 bg-error-subtle p-3"
            >
              <AlertOctagon aria-hidden className="mt-0.5 size-5 shrink-0 text-error" />
              <p className="text-body-sm font-medium text-error">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <Input
              label="Tên tài khoản"
              autoComplete="username"
              autoCapitalize="none"
              required
              error={errors.username?.message}
              {...register('username')}
            />
            <Input
              label="Mật khẩu"
              type="password"
              autoComplete="current-password"
              required
              error={errors.password?.message}
              {...register('password')}
            />
            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={isSubmitting}
              leftIcon={<LogIn className="size-5" />}
            >
              Đăng nhập
            </Button>
          </form>
        </Card>

        <Card className="mt-4" padding="sm">
          <p className="mb-2 text-caption font-semibold text-text-secondary">
            Tài khoản demo (dữ liệu mock, chưa có backend)
          </p>
          <ul className="flex flex-col gap-1 text-caption text-text-muted">
            <li>
              Quản lý: <code className="font-mono">quanly / quanly123</code>
            </li>
            <li>
              Nhân công: <code className="font-mono">nhancong / nhancong123</code>
            </li>
            <li>
              Khách xem: <code className="font-mono">khachxem / khachxem123</code>
            </li>
          </ul>
        </Card>
      </div>
    </main>
  );
}
