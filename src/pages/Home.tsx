import { useState, FormEvent } from 'react';
import { MainLayout } from '@components/layout';
import { IoMenuOutline, IoSendOutline, IoAddOutline } from 'react-icons/io5';

interface SuggestionItem {
  id: string;
  text: string;
}

const suggestions: SuggestionItem[] = [
  { id: '1', text: 'What is the ideal gas level' },
  { id: '2', text: 'How many cases per rack' },
  { id: '3', text: 'Upcoming weather trends affecting me' },
];

const Home = () => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    // Handle message submission
    console.log('Message:', message);
    setMessage('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
  };

  return (
    <MainLayout>
      <div className="h-full flex flex-col items-center justify-center px-8">
        {/* Welcome Text */}
        <h1 className="text-[27px] font-semibold text-[#000000] font-open-sans mb-8">
          Let's get started...
        </h1>

        {/* Main Input Container */}
        <div className="w-full max-w-[591px]">
          {/* Input Box */}
          <div className="bg-white border border-[#EBEBEB] rounded-[30px] shadow-[8px_17px_28px_6px_rgba(0,0,0,0.15)] p-4">
            <form onSubmit={handleSubmit}>
              {/* Input Field */}
              <input
                type="text"
                placeholder="Ask anything"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full text-[17px] font-semibold text-[#000000] placeholder-[#A9A9A9] font-open-sans bg-transparent outline-none mb-4"
              />

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* File Upload Button */}
                  <button
                    type="button"
                    className="w-[33px] h-[33px] flex items-center justify-center border border-[#EBEBEB] rounded-full hover:bg-[#F5F7FB] transition-colors"
                  >
                    <IoAddOutline className="w-4 h-4 text-[#000000]" />
                  </button>

                  {/* Settings Button */}
                  <button
                    type="button"
                    className="w-[33px] h-[33px] flex items-center justify-center border border-[#EBEBEB] rounded-full hover:bg-[#F5F7FB] transition-colors"
                  >
                    <IoMenuOutline className="w-4 h-4 text-[#D8D8D8]" />
                  </button>
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  className="w-[33px] h-[33px] flex items-center justify-center border border-[#EBEBEB] rounded-full hover:bg-[#F5F7FB] transition-colors"
                >
                  <IoSendOutline className="w-4 h-4 text-[#D8D8D8]" />
                </button>
              </div>
            </form>
          </div>

          {/* Suggestions Box */}
          <div className="mt-4 bg-white border border-[#EBEBEB] rounded-[30px] shadow-[8px_17px_26px_8px_rgba(0,0,0,0.15)] p-4">
            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="w-full text-left px-4 py-3 rounded-[10px] bg-white hover:bg-[#F5F7FB] transition-colors"
                >
                  <span className="text-[13px] font-semibold text-[#000000] font-open-sans">
                    {suggestion.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
