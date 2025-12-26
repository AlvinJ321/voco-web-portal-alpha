import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import VocoAppIcon from '../../resource/Voco-app-icon.png';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (data: { user: any; accessToken: string; refreshToken: string }, mode: 'login' | 'signup') => void;
  initialMode?: 'login' | 'signup';
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
}

// Define a more granular error state
interface ErrorState {
  phone?: string;
  code?: string;
  general?: string;
}

export default function AuthModal({ onClose, onSuccess, initialMode = 'signup', onOpenTerms, onOpenPrivacy }: AuthModalProps) {
  const [mode, setMode] = useState(initialMode);
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorState>({});
  const [countdown, setCountdown] = useState(0);
  const [isAgreementChecked, setIsAgreementChecked] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    // Reset state when initial mode changes
    clearAllState();
  }, [initialMode]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const clearAllState = () => {
    setPhone('');
    setVerificationCode('');
    setIsVerificationSent(false);
    setIsLoading(false);
    setErrors({});
    setCountdown(0);
    setIsAgreementChecked(false);
  };

  const handleSendVerification = async () => {
    if (phone.length < 11) { // Basic validation
      setErrors({ phone: 'Please enter a valid 11-digit phone number.' });
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch('/api/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, intent: mode }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Set error based on status code for specific feedback
        if (response.status === 404 || response.status === 409 || response.status === 429) {
          setErrors({ phone: data.message });
        } else {
          setErrors({ general: data.message || 'Failed to send verification code.' });
        }
        return; // Stop execution
      }

      setIsVerificationSent(true);
      setCountdown(60);
    } catch (err) {
      console.error('Send verification error:', err);
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack available');
      setErrors({ general: 'An unexpected network error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      setErrors({ ...errors, code: 'Verification code cannot be empty.' });
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone,
          verificationCode,
          intent: mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific errors for the verification step
        if (response.status === 400) { // Invalid or expired code
            setErrors({ code: data.message });
        } else {
            setErrors({ general: data.message || 'An unknown error occurred.' });
        }
        return;
      }

      // On success, pass the whole data object up
      onSuccess(data, mode);

    } catch (err) {
      console.error('Verification/Login error:', err);
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack available');
      console.error('Error type:', typeof err);
      if (err instanceof Error) {
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);
      }
      setErrors({ general: 'An unexpected network error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleMode = () => {
    setMode(prevMode => prevMode === 'login' ? 'signup' : 'login');
    // Reset errors and inputs when toggling
    setErrors({});
    setVerificationCode('');
    setIsVerificationSent(false);
    setCountdown(0); // Also reset countdown
    setIsAgreementChecked(false);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <img src={VocoAppIcon} alt="Voco logo" className="mx-auto h-12 w-12 rounded-lg mb-2" />
          <h2 className="text-xl font-bold text-gray-800">{mode === 'login' ? '登录' : '注册'}</h2>
        </div>

        {errors.general && <p className="text-red-500 text-sm text-center mb-4 bg-red-50 p-3 rounded-md">{errors.general}</p>}

        <form onSubmit={handleVerifySubmit} className="space-y-4">
          <div>
            <div className="flex gap-2">
              <span className="bg-gray-100 px-3 py-2 rounded-l-lg text-gray-600 border border-r-0 border-gray-200 flex items-center">
                +86
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="手机号"
                className={`flex-1 px-4 py-2 border rounded-r-lg focus:outline-none focus:ring-2 ${errors.phone ? 'border-red-500 ring-red-300' : 'border-gray-200 focus:ring-blue-500'}`}
                disabled={isLoading || countdown > 0} // Disable phone input after sending code
              />
              <button
                type="button"
                onClick={handleSendVerification}
                disabled={isLoading || countdown > 0}
                className="shrink-0 text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isLoading && !isVerificationSent ? '发送中...' : countdown > 0 ? `重新发送 (${countdown}s)` : '获取验证码'}
              </button>
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</p>}
          </div>

          <div>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="输入验证码"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.code ? 'border-red-500 ring-red-300' : 'border-gray-200 focus:ring-blue-500'}`}
              disabled={!isVerificationSent}
            />
            {errors.code && <p className="text-red-500 text-xs mt-1 ml-1">{errors.code}</p>}
          </div>

          {mode === 'signup' && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <input
                id="signup-agreement"
                type="checkbox"
                checked={isAgreementChecked}
                onChange={(e) => setIsAgreementChecked(e.target.checked)}
                required
                className="mt-1"
              />
              <label htmlFor="signup-agreement" className="leading-relaxed">
                我已阅读并同意{' '}
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="text-blue-600 hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  《用户协议》
                </button>{' '}
                和{' '}
                <button
                  type="button"
                  onClick={onOpenPrivacy}
                  className="text-blue-600 hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  《隐私政策》
                </button>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={!isVerificationSent || isLoading || (mode === 'signup' && !isAgreementChecked)}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 font-semibold"
          >
            {isLoading ? (mode === 'login' ? '登录中...' : '注册中...') : (mode === 'login' ? '登录' : '注册')}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <button onClick={toggleMode} className="text-sm text-blue-600 hover:underline">
            {mode === 'login' ? '还没有账户？去注册' : '已有账户？去登录'}
          </button>
        </div>

      </div>
    </div>
  );
}