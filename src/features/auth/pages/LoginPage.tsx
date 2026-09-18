import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { AlertOctagon, ArrowRight, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

  // Quét QR khi chưa đăng nhập → quay lại đúng cây sau khi login (09_DECISIONS D1)
  const redirectTo = searchParams.get('redirect') || ROUTES.dashboard;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Tự động đăng nhập khi chạy script kiểm thử / chụp ảnh giao diện
  useEffect(() => {
    if (searchParams.get('auto') === '1' && !isAuthenticated) {
      void login({ email: 'manager@durian.vn', password: 'thailevan1974' }).then(() => {
        navigate(redirectTo, { replace: true });
      });
    }
  }, [searchParams, isAuthenticated, login, navigate, redirectTo]);

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
    <main className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-4 py-8">
      {/* Background Image with Orchard Scene */}
      <div 
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000"
        style={{ backgroundImage: "url('/durian_bg.jpg')" }}
      />
      
      {/* Soft warm light/green overlay matching the reference screenshot */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-[#dcebcc]/75 via-[#f0f7e8]/50 to-emerald-900/20 backdrop-blur-[4px]" />

      {/* Main Container */}
      <div className="relative z-10 flex w-full max-w-[460px] flex-col items-center">
        {/* Header with Full Durian QR Logo */}
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="flex items-center justify-center p-3 transition-transform hover:scale-[1.02]">
            <img 
              src="/logo.jpg" 
              alt="Durian QR - Quản lý vườn sầu riêng thông minh" 
              className="h-44 w-auto max-w-[340px] rounded-3xl object-contain shadow-md border border-white/60"
            />
          </div>
        </div>

        {/* Card Form */}
        <div className="w-full rounded-3xl border border-white/80 bg-white/90 p-7 shadow-[0_12px_36px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-9">
          <p className="mb-7 text-center text-[15px] leading-relaxed text-[#4b5563]">
            Quản lý tình trạng cây sầu riêng qua mã QR.
            <br />
            Đăng nhập để tiếp tục.
          </p>

          {formError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-left text-sm text-red-700"
            >
              <AlertOctagon aria-hidden className="mt-0.5 size-5 shrink-0 text-red-500" />
              <p className="font-medium">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
            {/* email Input */}
            <div className="flex flex-col gap-1.5 text-left">
              <label 
                htmlFor="email" 
                className="text-[15px] font-semibold text-[#144229]"
              >
                Email <span className="text-[#144229]">*</span>
              </label>
              <input
                id="email"
                type="text"
                autoComplete="email"
                autoCapitalize="none"
                placeholder="Nhập tên tài khoản"
                className={`h-12 w-full rounded-xl border bg-white px-4 text-[15px] text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[#134e34] focus:outline-hidden focus:ring-2 focus:ring-[#134e34]/20 ${
                  errors.email ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
                }`}
                {...register('email')}
              />
              {errors.email?.message && (
                <span className="text-xs font-medium text-red-600">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5 text-left">
              <label 
                htmlFor="password" 
                className="text-[15px] font-semibold text-[#144229]"
              >
                Mật khẩu <span className="text-[#144229]">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  className={`h-12 w-full rounded-xl border bg-white pl-4 pr-11 text-[15px] text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[#134e34] focus:outline-hidden focus:ring-2 focus:ring-[#134e34]/20 ${
                    errors.password ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 hover:text-gray-800"
                >
                  {showPassword ? (
                    <EyeOff className="size-5 stroke-[1.75]" />
                  ) : (
                    <Eye className="size-5 stroke-[1.75]" />
                  )}
                </button>
              </div>
              {errors.password?.message && (
                <span className="text-xs font-medium text-red-600">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#0e4429] px-6 text-[16px] font-semibold text-white shadow-sm transition-all hover:bg-[#093520] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="inline-block size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <ArrowRight className="size-5 stroke-[2.2]" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
