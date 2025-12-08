import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import bgImage from '@assets/BG-17938272.jpg';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {/* Background Image with Opacity */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full overflow-auto">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
