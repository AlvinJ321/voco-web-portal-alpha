import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import apiFetch, { apiUpload } from '../api';

interface User {
  username: string;
  avatarUrl?: string;
  avatarKey?: string;
}

interface UserProfileProps {
  user: User | null;
  onBack: () => void;
  onProfileUpdate: () => void;
}

export default function UserProfile({ user, onBack, onProfileUpdate }: UserProfileProps) {
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    let newAvatarKey = user?.avatarKey;

    if (avatarFile) {
      try {
        const response = await apiUpload('/upload-avatar', avatarFile);
        if (response.ok) {
          const data = await response.json();
          newAvatarKey = data.avatarUrl;
        } else {
          console.error('Failed to upload avatar');
          alert('头像上传失败!');
          return;
        }
      } catch (error) {
        console.error('Error uploading avatar:', error);
        alert('头像上传出错!');
        return;
      }
    }

    try {
      const response = await apiFetch('/profile', {
        method: 'PUT',
        body: JSON.stringify({
          username,
          avatarUrl: newAvatarKey,
        }),
      });

      if (response.ok) {
        onProfileUpdate();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        console.error('Failed to update profile');
        alert('个人资料更新失败!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('个人资料更新出错!');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 py-4 border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>
      </header>

      <main className="max-w-xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold mb-8">个人资料</h1>
        
        <div className="space-y-8">
          <div className="flex flex-col items-center">
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <div 
              className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4 cursor-pointer"
              onClick={handleAvatarClick}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <Upload className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <button 
              className="text-blue-600 hover:text-blue-700"
              onClick={handleAvatarClick}
            >
              更换头像
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-center">
            <button 
              onClick={handleSave}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? '保存中...' : '保存更改'}
            </button>
            {saveSuccess && (
              <p className="text-green-600 text-sm mt-2">
                个人资料更新成功!
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}