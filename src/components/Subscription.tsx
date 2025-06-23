import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';

interface SubscriptionProps {
  onBack: () => void;
}

export default function Subscription({ onBack }: SubscriptionProps) {
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

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold mb-8">订阅管理</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-600 transition-colors">
            <div className="text-xl font-semibold mb-2">月度订阅</div>
            <div className="text-3xl font-bold mb-4">¥29<span className="text-base font-normal text-gray-500">/月</span></div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-600" />
                <span>无限制使用</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-600" />
                <span>AI 润色功能</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-600" />
                <span>所有应用支持</span>
              </li>
            </ul>
            <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              选择
            </button>
          </div>

          <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-600 transition-colors">
            <div className="text-xl font-semibold mb-2">年度订阅</div>
            <div className="text-3xl font-bold mb-4">¥299<span className="text-base font-normal text-gray-500">/年</span></div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-600" />
                <span>无限制使用</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-600" />
                <span>AI 润色功能</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-600" />
                <span>所有应用支持</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-600" />
                <span>节省 20%</span>
              </li>
            </ul>
            <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              选择
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}