import React, { useState } from 'react';
import { LayoutGrid, Settings, CreditCard, LogOut, Zap, User as UserIcon, PanelLeftClose, PanelLeft } from 'lucide-react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useUserCredits } from '../hooks/useUserCredits';

interface SidebarProps {
  currentView: string;
  setView: (view: 'projects' | 'settings' | 'pricing' | 'workspace' | string) => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { credits } = useUserCredits(user?.uid);
  
  const handleSignOut = () => {
    signOut(auth);
  };

  const navItems = [
    { id: 'projects', label: 'Dashboard', icon: LayoutGrid },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
  ];

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#0f102e] border-r border-white/5 flex flex-col h-full flex-shrink-0 transition-all duration-300`}>
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="GhostWriter Logo" className="w-8 h-8 object-contain shrink-0" onError={(e) => e.currentTarget.style.display = 'none'} />
          {!isCollapsed && <span className="text-xl font-bold tracking-tight text-white truncate">GhostWriter</span>}
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`text-gray-400 hover:text-white transition-colors ${isCollapsed ? 'hidden' : 'block'}`}
          title="Collapse Sidebar"
        >
          <PanelLeftClose className="w-5 h-5" />
        </button>
      </div>

      {isCollapsed && (
        <div className="px-6 pb-4 flex justify-center">
          <button 
            onClick={() => setIsCollapsed(false)}
            className="text-gray-400 hover:text-white transition-colors"
            title="Expand Sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      <nav className="flex-1 px-4 flex flex-col gap-2 mt-4">
        {navItems.map((item) => {
          const isActive = currentView === item.id || (item.id === 'projects' && currentView === 'workspace');
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              } ${isCollapsed ? 'px-0 justify-center w-12 mx-auto' : 'px-4 w-full'}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className={`p-4 mt-auto border-t border-white/5 flex flex-col gap-3 ${isCollapsed ? 'items-center' : ''}`}>
        <div className={`flex items-center bg-white/5 border border-white/10 ${isCollapsed ? 'p-2 rounded-full justify-center' : 'gap-3 px-3 py-2 rounded-xl'}`} title={isCollapsed ? (user?.isAnonymous ? 'Guest Artist' : user?.email || '') : undefined}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-600 to-pink-500 flex items-center justify-center overflow-hidden shrink-0">
             {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="w-5 h-5 text-white" />
              )}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden text-left flex-1">
               <span className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">
                  {user?.isAnonymous ? 'Guest Mode' : 'Account'}
               </span>
               <span className="text-sm font-semibold truncate text-white">
                  {user?.isAnonymous ? 'Guest Artist' : user?.email}
               </span>
            </div>
          )}
        </div>

        {credits !== null && (
          <div className={`flex items-center justify-between bg-yellow-500/10 border border-yellow-500/20 ${isCollapsed ? 'p-2 rounded-full justify-center mt-2' : 'px-4 py-2.5 rounded-xl'}`} title={isCollapsed ? `Credits: ${credits}` : undefined}>
             <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500/20 shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium text-yellow-500">Credits</span>}
             </div>
             {!isCollapsed && <span className="text-sm font-bold text-yellow-500">{credits}</span>}
          </div>
        )}

        <button
          onClick={handleSignOut}
          title={isCollapsed ? "Sign Out" : undefined}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 ${isCollapsed ? 'px-0 w-12 mx-auto mt-2' : 'w-full px-4'}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
