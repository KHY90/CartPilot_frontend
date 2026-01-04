/**
 * ChatContext
 * 채팅 상태를 앱 전역에서 유지
 */
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ChatState, ConversationMessage, ChatResponse } from '../types';
import { sendChatMessage } from '../services/api';

interface ChatContextValue {
  messages: ConversationMessage[];
  isLoading: boolean;
  error: string | null;
  currentResponse: ChatResponse | null;
  sessionId: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  clearError: () => void;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  currentResponse: null,
  sessionId: null,
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ChatState>(initialState);

  /**
   * 메시지 전송
   */
  const sendMessage = useCallback(async (message: string) => {
    // 로딩 시작 및 사용자 메시지 추가
    const userMessage: ConversationMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      // API 호출
      const response = await sendChatMessage({
        message,
        session_id: state.sessionId || undefined,
      });

      // 어시스턴트 응답 메시지 생성
      let assistantContent = '';
      if (response.type === 'clarification' && response.clarification) {
        assistantContent = response.clarification.question;
      } else if (response.type === 'error' && response.error_message) {
        assistantContent = response.error_message;
      } else if (response.type === 'recommendation') {
        assistantContent = '추천 결과를 확인해 주세요!';
      }

      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date().toISOString(),
        metadata: { response },
      };

      // 세션 ID 저장 (구매 기록 등록용)
      const newSessionId = response.session_id || state.sessionId;
      if (newSessionId) {
        localStorage.setItem('cartpilot_last_session_id', newSessionId);
      }

      // 추천 결과가 있으면 localStorage에도 저장 (백엔드 캐시 fallback용)
      if (response.type === 'recommendation' && response.recommendation?.cards) {
        const searchResults = response.recommendation.cards.map((card) => ({
          product_id: card.product_id,
          title: card.title,
          price: card.price,
          price_display: card.price_display,
          mall_name: card.mall_name,
          link: card.link,
          image: card.image,
        }));
        localStorage.setItem('cartpilot_search_results', JSON.stringify(searchResults));
      }

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
        currentResponse: response,
        sessionId: newSessionId,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [state.sessionId]);

  /**
   * 대화 초기화
   */
  const clearChat = useCallback(() => {
    setState(initialState);
  }, []);

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages: state.messages,
        isLoading: state.isLoading,
        error: state.error,
        currentResponse: state.currentResponse,
        sessionId: state.sessionId,
        sendMessage,
        clearChat,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

export default ChatContext;
