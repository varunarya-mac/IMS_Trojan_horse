import { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import {
  IoAddOutline,
  IoSearchOutline,
  IoChevronDownOutline,
  IoNotificationsOutline,
  IoCompassOutline,
} from 'react-icons/io5';
import { FiLogOut } from 'react-icons/fi';
import logoSvg from '@assets/logo.svg';

interface MenuItem {
  id: string;
  label: string;
}

const agentItems: MenuItem[] = [
  { id: '1', label: 'Refrigeration Alarming' },
  { id: '2', label: 'Refrigeration Alarming' },
  { id: '3', label: 'Refrigeration Alarming' },
];

const chatItems: MenuItem[] = [
  { id: '1', label: 'LT1_HG76983289' },
  { id: '2', label: 'LT1_HG76983289' },
  { id: '3', label: 'LT1_HG76983289' },
  { id: '4', label: 'LT1_HG76983289' },
  { id: '5', label: 'LT1_HG76983289' },
  { id: '6', label: 'LT1_HG76983289' },
  { id: '7', label: 'LT1_HG76983289' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [agentsExpanded, setAgentsExpanded] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className="w-[290px] h-screen bg-[#F5F7FB] flex flex-col relative">
      {/* Logo */}
      <div className="px-6 pt-9 pb-4">
        <img src={logoSvg} alt="Logo" className="h-[34px]" />
      </div>

      {/* Action Buttons */}
      <div className="px-5 space-y-2">
        {/* New Chat Button */}
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-[10px] hover:bg-white transition-colors">
          <div className="w-[29px] h-[29px] flex items-center justify-center">
            <IoAddOutline className="w-5 h-5 text-[#1D2441]" />
          </div>
          <span className="font-open-sans font-bold text-sm text-[#000000]">New Chat</span>
        </button>

        {/* Explore Button */}
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-[10px] hover:bg-white transition-colors">
          <div className="w-[29px] h-[29px] flex items-center justify-center">
            <IoCompassOutline className="w-5 h-5 text-[#1D2441]" />
          </div>
          <span className="font-open-sans font-bold text-sm text-[#000000]">Explore</span>
        </button>

        {/* Search Chats Button */}
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-[10px] hover:bg-white transition-colors">
          <div className="w-[29px] h-[29px] flex items-center justify-center">
            <IoSearchOutline className="w-5 h-5 text-[#1D2441]" />
          </div>
          <span className="font-open-sans font-bold text-sm text-[#000000]">Search Chats</span>
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

      {/* Agents Section */}
      <div className="px-5">
        <button
          onClick={() => setAgentsExpanded(!agentsExpanded)}
          className="flex items-center gap-2 mb-2"
        >
          <span className="font-open-sans font-bold text-sm text-[#000000]">Agents</span>
          <IoChevronDownOutline
            className={`w-4 h-4 text-[#000000] transition-transform ${agentsExpanded ? '' : '-rotate-90'}`}
          />
        </button>

        {agentsExpanded && (
          <div className="space-y-1">
            {agentItems.map((item) => (
              <button
                key={item.id}
                className="w-full text-left px-3 py-2 rounded-[10px] hover:bg-white transition-colors"
              >
                <span className="font-open-sans font-normal text-sm text-[#000000]">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-6 my-4 border-t border-[#C4D5F7]" />

      {/* Chats Section */}
      <div className="px-5 flex-1 overflow-hidden flex flex-col">
        <span className="font-open-sans font-bold text-sm text-[#000000] mb-2">Chats</span>

        <div className="flex-1 overflow-y-auto space-y-1">
          {chatItems.map((item) => (
            <button
              key={item.id}
              className="w-full text-left px-3 py-2 rounded-[10px] hover:bg-white transition-colors"
            >
              <span className="font-open-sans font-normal text-sm text-[#000000]">{item.label}</span>
            </button>
          ))}
        </div>

        {/* View all chats */}
        <button className="w-full text-left px-3 py-2 mt-2 rounded-[10px] hover:bg-white transition-colors">
          <span className="font-open-sans font-normal text-sm text-[#000000]">View all chats</span>
        </button>
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
