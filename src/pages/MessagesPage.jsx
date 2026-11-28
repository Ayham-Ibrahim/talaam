import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MessageCircle, Search, X } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ConversationList } from '@/components/chat/ConversationList';
import { ConversationThread } from '@/components/chat/ConversationThread';
import { useConversations } from '@/hooks/useChat';
import { flattenConversations } from '@/lib/chatCache';
import { useT } from '@/hooks/useT';

/**
 * المحادثات للطالب والمعلم والداعم: القائمة والمحادثة جنباً إلى جنب على الشاشات الكبيرة،
 * وإحداهما فقط على الجوال (المحادثة حين يكون في المسار معرّف).
 */
export function MessagesPage() {
  const t = useT();
  const { conversationId } = useParams();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // طلب واحد بعد توقف الكتابة 300ms لا طلب مع كل حرف
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useConversations(search);
  const conversations = flattenConversations(data);

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-150px)] min-h-[480px] overflow-hidden rounded-2xl border border-line/60 bg-white shadow-card">
        <aside
          className={`w-full shrink-0 flex-col border-l border-line/60 lg:flex lg:w-[320px] ${
            conversationId ? 'hidden' : 'flex'
          }`}
        >
          <div className="space-y-3 border-b border-line/60 px-4 py-4">
            <div className="text-right text-base font-bold text-ink">{t('chat.title')}</div>
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                maxLength={100}
                placeholder={t('chat.searchPlaceholder')}
                aria-label={t('chat.searchPlaceholder')}
                className="w-full rounded-xl border border-line bg-[#FAFBFD] py-2 pl-8 pr-9 text-sm text-ink outline-none focus:border-primary [&::-webkit-search-cancel-button]:hidden"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  aria-label={t('chat.clearSearch')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
              activeId={conversationId}
              hasMore={hasNextPage}
              onLoadMore={fetchNextPage}
              isLoadingMore={isFetchingNextPage}
              isSearching={Boolean(search)}
            />
          </div>
        </aside>

        <section className={`min-w-0 flex-1 flex-col ${conversationId ? 'flex' : 'hidden lg:flex'}`}>
          {conversationId ? (
            <ConversationThread key={conversationId} conversationId={conversationId} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#F7F8FB] text-ink-soft">
              <MessageCircle size={40} className="text-line" />
              <p className="text-sm">{t('chat.selectConversation')}</p>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
