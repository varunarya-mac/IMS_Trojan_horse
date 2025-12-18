import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useChatContext } from '@context/ChatContext';
import { useChats } from '@hooks/useChat';
import {
  IoAddOutline,
  IoSearchOutline,
  IoNotificationsOutline,
  IoCompassOutline,
  IoChatbubbleOutline,
} from 'react-icons/io5';
import { FiLogOut } from 'react-icons/fi';
import logoSvg from '@assets/logo.svg';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentChatId, setCurrentChatId, startNewChat } = useChatContext();
  const { data: chatsData, isLoading: isChatsLoading } = useChats();

  const isExploreActive = location.pathname === '/explore' || location.pathname.startsWith('/flow/');
  const isHomeActive = location.pathname === '/';
  const isChatsActive = location.pathname === '/chats';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNewChat = () => {
    startNewChat();
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  // Get recent chats (limit to 7 for sidebar)
  const recentChats = chatsData?.chats?.slice(0, 7) || [];

  return (
    <aside className="w-[290px] h-screen bg-[#F5F7FB] flex flex-col relative">
      {/* Logo */}
      <div className="px-6 pt-9 pb-4">
        <img src={logoSvg} alt="Logo" className="h-[34px]" />
      </div>

      {/* Action Buttons */}
      <div className="px-5 space-y-2">
        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-[10px] transition-colors ${
            isHomeActive && !currentChatId ? 'bg-white shadow-sm' : 'hover:bg-white'
          }`}
        >
          <div className="w-[29px] h-[29px] flex items-center justify-center">
            <IoAddOutline className={`w-5 h-5 ${isHomeActive && !currentChatId ? 'text-[#248CD0]' : 'text-[#1D2441]'}`} />
          </div>
          <span className={`font-open-sans font-bold text-sm ${isHomeActive && !currentChatId ? 'text-[#248CD0]' : 'text-[#000000]'}`}>
            New Chat
          </span>
        </button>

        {/* Explore Button */}
        <button
          onClick={() => navigate('/explore')}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-[10px] transition-colors ${
            isExploreActive ? 'bg-white shadow-sm' : 'hover:bg-white'
          }`}
        >
          <div className="w-[29px] h-[29px] flex items-center justify-center">
            <IoCompassOutline className={`w-5 h-5 ${isExploreActive ? 'text-[#248CD0]' : 'text-[#1D2441]'}`} />
          </div>
          <span className={`font-open-sans font-bold text-sm ${isExploreActive ? 'text-[#248CD0]' : 'text-[#000000]'}`}>
            Explore
          </span>
        </button>

        {/* Search Chats Button */}
        <button
          onClick={() => navigate('/chats')}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-[10px] transition-colors ${
            isChatsActive ? 'bg-white shadow-sm' : 'hover:bg-white'
          }`}
        >
          <div className="w-[29px] h-[29px] flex items-center justify-center">
            <IoSearchOutline className={`w-5 h-5 ${isChatsActive ? 'text-[#248CD0]' : 'text-[#1D2441]'}`} />
          </div>
          <span className={`font-open-sans font-bold text-sm ${isChatsActive ? 'text-[#248CD0]' : 'text-[#000000]'}`}>
            Search Chats
          </span>
        </button>

        {/* To Action Button */}
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-[10px] hover:bg-white transition-colors">
          <div className="w-[29px] h-[29px] flex items-center justify-center">
            <IoNotificationsOutline className="w-5 h-5 text-[#1D2441]" />
          </div>
          <span className="font-open-sans font-bold text-sm text-[#000000]">To Action</span>
        </button>
      </div>

      {/* Divider */}
      <div className="mx-6 my-4 border-t border-[#C4D5F7]" />

      {/* Chats Section */}
      <div className="px-5 flex-1 overflow-hidden flex flex-col">
        <span className="font-open-sans font-bold text-sm text-[#000000] mb-2">Chats</span>

        <div className="flex-1 overflow-y-auto space-y-1">
          {isChatsLoading ? (
            <div className="px-3 py-2">
              <span className="font-open-sans text-sm text-[#A9A9A9]">Loading...</span>
            </div>
          ) : recentChats.length > 0 ? (
            recentChats.map((chat) => {
              const isActive = currentChatId === chat.$id && isHomeActive;
              return (
                <button
                  key={chat.$id}
                  onClick={() => handleChatSelect(chat.$id)}
                  className={`w-full text-left px-3 py-2 rounded-[10px] transition-colors flex items-center gap-2 ${
                    isActive ? 'bg-white shadow-sm' : 'hover:bg-white'
                  }`}
                >
                  <IoChatbubbleOutline className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#248CD0]' : 'text-[#A9A9A9]'}`} />
                  <span className={`font-open-sans font-normal text-sm truncate ${isActive ? 'text-[#248CD0]' : 'text-[#000000]'}`}>
                    {chat.title || 'Untitled Chat'}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="px-3 py-2">
              <span className="font-open-sans text-sm text-[#A9A9A9]">No chats yet</span>
            </div>
          )}
        </div>

        {/* View all chats */}
        {recentChats.length > 0 && (
          <button
            onClick={() => navigate('/chats')}
            className="w-full text-left px-3 py-2 mt-2 rounded-[10px] hover:bg-white transition-colors"
          >
            <span className="font-open-sans font-normal text-sm text-[#A9A9A9] hover:text-[#248CD0]">
              View all chats
            </span>
          </button>
        )}
      </div>

      {/* User Section - Bottom */}
      <div className="px-5 py-4 border-t border-[#C4D5F7] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#248CD0] flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <span className="font-open-sans font-semibold text-sm text-[#A9A9A9]">
            {user?.name || 'User'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-white transition-colors"
          title="Logout"
        >
          <FiLogOut className="w-5 h-5 text-[#A9A9A9]" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
