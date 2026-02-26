import { useState } from 'react';
import './LoginPage.css';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { authService } from '../../services/auth.service';
import type { LoginCredentials } from '../../types/auth.types';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

interface FormState {
  credentials: LoginCredentials;
  showPassword: boolean;
  remember: boolean;
}

// ---- Async state shape ----
interface AsyncState {
  loading: boolean;
  error: string;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [form, setForm] = useState<FormState>({
    credentials: { email: '', password: '' },
    showPassword: false,
    remember: false,
  });

  const [async, setAsync] = useState<AsyncState>({ loading: false, error: '' });

  // ---- Helpers ----
  const setField = <K extends keyof LoginCredentials>(key: K, value: string) => {
    setForm((prev) => ({
      ...prev,
      credentials: { ...prev.credentials, [key]: value },
    }));
    if (async.error) setAsync((prev) => ({ ...prev, error: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { email, password } = form.credentials;
    if (!email.trim() || !password) {
      setAsync({ loading: false, error: 'Vui lòng nhập đầy đủ email và mật khẩu.' });
      return;
    }

    setAsync({ loading: true, error: '' });

    const result = await authService.login(form.credentials);

    if (result.success) {
      if (form.remember) localStorage.setItem('fg_remember', '1');
      onLoginSuccess();
    } else {
      setAsync({ loading: false, error: result.message });
    }
  };

  const { credentials, showPassword, remember } = form;
  const { loading, error } = async;

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Brand */}
        <div className="login-card__brand">
          <div className="login-card__logo-icon">
            <ShieldCheck size={26} />
          </div>
          <span className="login-card__logo-name">FloodGuard</span>
          <span className="login-card__tagline">Hệ thống quản lý cảnh báo lũ lụt</span>
        </div>

        {/* Heading */}
        <h1 className="login-card__title">Đăng nhập</h1>
        <p className="login-card__subtitle">Nhập thông tin để truy cập bảng điều khiển</p>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>

          {/* Email */}
          <div className="login-form__group">
            <label className="login-form__label" htmlFor="email">Email</label>
            <div className="login-form__input-wrap">
              <span className="login-form__input-icon"><Mail size={16} /></span>
              <input
                id="email"
                type="email"
                className={`login-form__input${error ? ' login-form__input--error' : ''}`}
                placeholder="admin@floodguard.vn"
                value={credentials.email}
                onChange={(e) => setField('email', e.target.value)}
                autoComplete="username"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-form__group">
            <label className="login-form__label" htmlFor="password">Mật khẩu</label>
            <div className="login-form__input-wrap">
              <span className="login-form__input-icon"><Lock size={16} /></span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`login-form__input${error ? ' login-form__input--error' : ''}`}
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setField('password', e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="login-form__eye-btn"
                onClick={() => setForm((p) => ({ ...p, showPassword: !p.showPassword }))}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="login-form__options">
            <label className="login-form__remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setForm((p) => ({ ...p, remember: e.target.checked }))}
                disabled={loading}
              />
              Ghi nhớ đăng nhập
            </label>
            <button type="button" className="login-form__forgot">
              Quên mật khẩu?
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="login-form__error" role="alert">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="login-form__submit" disabled={loading}>
            {loading
              ? <><span className="login-form__spinner" />Đang đăng nhập...</>
              : 'Đăng nhập'
            }
          </button>
        </form>

      </div>
    </div>
  );
}

