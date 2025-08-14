import { ReactNode } from 'react';
import Sidebar from './sidebar';
import Header from './header';
import { useLanguage } from '@/contexts/language-context';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isRTL } = useLanguage();

  return (
    <div className={`flex h-screen overflow-hidden ${isRTL ? 'flex-row-reverse' : 'flex-row'}`} dir={isRTL ? "rtl" : "ltr"}>
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}