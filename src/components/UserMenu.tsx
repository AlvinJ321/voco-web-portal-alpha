import React from 'react';
import { User, CreditCard, LogOut, Settings } from 'lucide-react';

interface UserMenuProps {
  avatarUrl?: string | null;
  onClose: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({
  avatarUrl,
  onClose,
  onProfileClick,
  onLogout,
}) => {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
      <button 
        onClick={onProfileClick}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
      >
        <User className="w-4 h-4" />
        个人资料
      </button>
      <button 
        onClick={onLogout}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        退出登录
      </button>
    </div>
  );
}

export default UserMenu;