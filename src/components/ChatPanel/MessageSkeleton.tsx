/**
 * MessageSkeleton 컴포넌트
 * 채팅 메시지 로딩 플레이스홀더
 */
import Skeleton from '../common/Skeleton';
import './MessageSkeleton.css';

function MessageSkeleton() {
  return (
    <div className="message-skeleton">
      {/* 어시스턴트 아바타 */}
      <div className="skeleton-avatar">
        <Skeleton width={32} height={32} variant="circular" />
      </div>

      {/* 메시지 버블 */}
      <div className="skeleton-bubble">
        <Skeleton width="70%" height="16px" />
        <Skeleton width="100%" height="16px" />
        <Skeleton width="85%" height="16px" />
        <Skeleton width="40%" height="16px" />
      </div>
    </div>
  );
}

export default MessageSkeleton;
