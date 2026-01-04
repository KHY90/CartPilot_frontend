/**
 * 알림 설정 API 서비스
 */
import apiClient from './api';
import { getAuthHeaders } from './authApi';

export interface NotificationSettings {
  email_notification_enabled: boolean;
  notification_email: string | null;
}

export interface NotificationSettingsUpdate {
  email_notification_enabled?: boolean;
  notification_email?: string;
}

/**
 * 알림 설정 조회
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  const response = await apiClient.get<NotificationSettings>('/api/notification-settings', {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * 알림 설정 수정
 */
export async function updateNotificationSettings(
  settings: NotificationSettingsUpdate
): Promise<NotificationSettings> {
  const response = await apiClient.put<NotificationSettings>(
    '/api/notification-settings',
    settings,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
}
