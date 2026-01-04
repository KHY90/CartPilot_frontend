/**
 * useChat 훅
 * ChatContext를 re-export하여 하위 호환성 유지
 */
import { useChat } from '../contexts/ChatContext';

export { useChat };
export default useChat;
