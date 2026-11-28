import { NavLink } from 'react-router-dom';
import { Ban } from 'lucide-react';
import { Avatar, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { CHAT_PATH } from '@/hooks/useChat';
import { useInfiniteScrollTrigger } from '@/hooks/useInfiniteScrollTrigger';
import { useT } from '@/hooks/useT';
import { formatMessageTime } from './chatFormat';

function lastMessagePreview(t, message) {
  if (!message) return t('chat.noMessagesYet');
  if (message.is_deleted) return t('chat.deletedMessage');
  return message.body;
}

export function ConversationList({ conversations, isLoading, isError, onRetry, activeId, hasMore, onLoadMore, isLoadingMore, isSearching }) {
  const t = useT();
  const sentinelRef = useInfiniteScrollTrigger({
    onIntersect: () => !isLoadingMore && onLoadMore?.(),
    enabled: Boolean(hasMore),
    rootMargin: '200px',
  });

  if (isError) return <ErrorState onRetry={onRetry} />;

  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!conversations?.length) {
    return (
      <div className="p-4">
        {isSearching ? (
          <EmptyState title={t('chat.searchEmpty')} />
        ) : (
          <EmptyState title={t('chat.emptyTitle')} hint={t('chat.emptyHint')} />
        )}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line/60">
      {conversations.map((conversation) => {
        const counterpart = conversation.counterpart;
        const isActive = String(conversation.id) === String(activeId);
        return (
          <li key={conversation.id}>
            <NavLink
              to={`${CHAT_PATH}/${conversation.id}`}
              className={`flex items-center gap-3 px-4 py-3 text-right transition-colors ${
                isActive ? 'bg-primary/10' : 'hover:bg-line/30'
              }`}
            >
              <Avatar name={counterpart?.name} src={counterpart?.avatar_path} size="sm" className="!h-11 !w-11 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate text-sm font-bold text-ink">{counterpart?.name}</span>
                    {conversation.status === 'blocked' && <Ban size={13} className="shrink-0 text-accent-pink" />}
                  </span>
                  <span className="shrink-0 text-[11px] text-ink-soft">
                    {conversation.last_message_at ? formatMessageTime(conversation.last_message_at, true) : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`truncate text-xs ${
                      conversation.unread_count ? 'font-semibold text-ink' : 'text-ink-soft'
                    }`}
                  >
                    {lastMessagePreview(t, conversation.last_message)}
                  </span>
                  {!!conversation.unread_count && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                      {conversation.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </NavLink>
          </li>
        );
      })}
      {hasMore && (
        <li ref={sentinelRef} className="py-3 text-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
          >
            {isLoadingMore ? '…' : t('chat.loadMoreConversations')}
          </button>
        </li>
      )}
    </ul>
  );
}
