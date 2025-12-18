/**
 * ChatHistory Page
 * Lists all chats with pagination and "Load More" functionality
 */

import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@components/layout';
import { useChatsPaginated, useDeleteChat } from '@hooks/useChat';
import { useChatContext } from '@context/ChatContext';
import {
  IoChatbubbleOutline,
  IoTrashOutline,
  IoDocumentTextOutline,
  IoTimeOutline,
} from 'react-icons/io5';
import type { Chat } from '../types/chat';

const ChatHistory = () => {
  const navigate = useNavigate();
  const { setCurrentChatId } = useChatContext();
  const deleteChat = useDeleteChat();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatsPaginated(20);

  // Flatten all pages into a single array of chats
  const allChats = data?.pages.flatMap((page) => page.chats) || [];
  const totalChats = data?.pages[0]?.total || 0;

  const handleChatClick = (chat: Chat) => {
    setCurrentChatId(chat.$id);
    navigate('/');
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteChat.mutateAsync(chatId);
      } catch (err) {
        console.error('Failed to delete chat:', err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <MainLayout>
      <div className="h-full flex flex-col p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1D2441] font-open-sans">
            Chat History
          </h1>
          <p className="text-[#A9A9A9] text-sm mt-1">
            {totalChats > 0
              ? `${totalChats} conversation${totalChats !== 1 ? 's' : ''}`
              : 'No conversations yet'}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#248CD0]" />
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-2">Failed to load chats</p>
              <p className="text-[#A9A9A9] text-sm">
                {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            </div>
          ) : allChats.length === 0 ? (
            <div className="text-center py-12">
              <IoChatbubbleOutline className="w-16 h-16 text-[#D8D8D8] mx-auto mb-4" />
              <p className="text-[#A9A9A9] text-lg mb-2">No chats yet</p>
              <p className="text-[#A9A9A9] text-sm">
                Start a new conversation from the home page
              </p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 px-6 py-2 bg-[#248CD0] text-white rounded-lg hover:bg-[#1a7ab8] transition-colors"
              >
                Start New Chat
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {allChats.map((chat) => (
                <div
                  key={chat.$id}
                  onClick={() => handleChatClick(chat)}
                  className="bg-white border border-[#EBEBEB] rounded-xl p-4 hover:shadow-md hover:border-[#248CD0] transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#F5F7FB] flex items-center justify-center flex-shrink-0">
                        <IoChatbubbleOutline className="w-5 h-5 text-[#248CD0]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#1D2441] truncate group-hover:text-[#248CD0] transition-colors">
                          {chat.title || 'Untitled Chat'}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-[#A9A9A9]">
                          <span className="flex items-center gap-1">
                            <IoTimeOutline className="w-4 h-4" />
                            {formatDate(chat.$createdAt)}
                          </span>
                          {chat.csvFileName && (
                            <span className="flex items-center gap-1">
                              <IoDocumentTextOutline className="w-4 h-4" />
                              {chat.csvFileName}
                            </span>
                          )}
                          <span>{chat.messageCount} messages</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(e, chat.$id)}
                      className="p-2 rounded-lg text-[#A9A9A9] hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete chat"
                    >
                      <IoTrashOutline className="w-5 h-5" />
                    </button>
                  </div>
                  {chat.status === 'processing' && (
                    <div className="mt-2 text-xs text-[#248CD0] flex items-center gap-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-[#248CD0]" />
                      Processing...
                    </div>
                  )}
                  {chat.status === 'error' && (
                    <div className="mt-2 text-xs text-red-500">
                      Error occurred
                    </div>
                  )}
                </div>
              ))}

              {/* Load More Button */}
              {hasNextPage && (
                <div className="flex justify-center pt-4 pb-8">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="px-6 py-3 bg-[#F5F7FB] text-[#1D2441] rounded-lg hover:bg-[#E8ECF4] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1D2441]" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}

              {/* End of list indicator */}
              {!hasNextPage && allChats.length > 0 && (
                <div className="text-center py-4 text-[#A9A9A9] text-sm">
                  You've reached the end
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ChatHistory;
