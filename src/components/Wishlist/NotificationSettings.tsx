/**
 * NotificationSettings - 알림 설정 컴포넌트
 * 이메일 알림 설정 및 테스트 발송
 */
import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../services/api';
import { getAuthHeaders } from '../../services/authApi';
import './NotificationSettings.css';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail?: string;
  emailEnabled: boolean;
  onSave: (email: string, enabled: boolean) => Promise<void>;
}

interface NotificationStatus {
  email_available: boolean;
  user_email_enabled: boolean;
  user_notification_email: string;
}

function NotificationSettings({
  isOpen,
  onClose,
  currentEmail = '',
  emailEnabled: initialEnabled,
  onSave,
}: NotificationSettingsProps) {
  const toast = useToast();
  const [email, setEmail] = useState(currentEmail);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [status, setStatus] = useState<NotificationStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setEmail(currentEmail);
      setEnabled(initialEnabled);
      loadNotificationStatus();
    }
  }, [isOpen, currentEmail, initialEnabled]);

  const loadNotificationStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const response = await apiClient.get<NotificationStatus>(
        '/api/wishlist/notifications/status',
        { headers: getAuthHeaders() }
      );
      setStatus(response.data);
    } catch (err) {
      console.error('알림 상태 로드 실패:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleSave = async () => {
    if (enabled && !email.trim()) {
      toast.warning('이메일 주소를 입력해주세요.');
      return;
    }

    if (enabled && !isValidEmail(email)) {
      toast.warning('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(email, enabled);
      toast.success('알림 설정이 저장되었습니다.');
      onClose();
    } catch (err) {
      toast.error('알림 설정 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!email.trim()) {
      toast.warning('이메일 주소를 입력해주세요.');
      return;
    }

    if (!isValidEmail(email)) {
      toast.warning('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setIsTesting(true);
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(
        '/api/wishlist/notifications/test-email',
        { email },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error('테스트 이메일 발송에 실패했습니다.');
    } finally {
      setIsTesting(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  if (!isOpen) return null;

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="notification-header">
          <h3>이메일 알림 설정</h3>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="notification-content">
          {/* 서비스 상태 */}
          <div className={`service-status ${status?.email_available ? 'available' : 'unavailable'}`}>
            <span className="status-icon">
              {isLoadingStatus ? '...' : status?.email_available ? 'O' : '!'}
            </span>
            <span className="status-text">
              {isLoadingStatus
                ? '상태 확인 중...'
                : status?.email_available
                  ? '이메일 알림 서비스 사용 가능'
                  : '이메일 알림 서비스 현재 사용 불가'}
            </span>
          </div>

          {/* 알림 활성화 토글 */}
          <div className="setting-row">
            <label className="toggle-label">
              <span className="label-text">이메일 알림 받기</span>
              <div className={`toggle-switch ${enabled ? 'active' : ''}`} onClick={() => setEnabled(!enabled)}>
                <div className="toggle-slider" />
              </div>
            </label>
          </div>

          {/* 이메일 입력 */}
          <div className="setting-row">
            <label className="input-label">
              <span className="label-text">알림 수신 이메일</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="email-input"
                disabled={!enabled}
              />
            </label>
          </div>

          {/* 테스트 발송 */}
          {enabled && (
            <div className="test-section">
              <button
                className="test-btn"
                onClick={handleTestEmail}
                disabled={isTesting || !email}
              >
                {isTesting ? '발송 중...' : '테스트 이메일 발송'}
              </button>
              <span className="test-hint">설정 저장 전 이메일 수신을 확인할 수 있습니다</span>
            </div>
          )}

          {/* 알림 조건 안내 */}
          <div className="conditions-section">
            <h4>알림을 받는 조건</h4>
            <ul className="conditions-list">
              <li>
                <span className="condition-icon">1</span>
                <span>90일 최저가에 도달했을 때</span>
              </li>
              <li>
                <span className="condition-icon">2</span>
                <span>설정한 목표가에 도달했을 때</span>
              </li>
              <li>
                <span className="condition-icon">3</span>
                <span>가격이 일정 비율 이상 하락했을 때</span>
              </li>
            </ul>
            <p className="conditions-note">
              각 상품별로 알림을 켜두셔야 알림이 발송됩니다.
            </p>
          </div>
        </div>

        <div className="notification-footer">
          <button className="cancel-btn" onClick={onClose}>
            취소
          </button>
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationSettings;
