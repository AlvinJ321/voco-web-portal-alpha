import React from 'react';

interface UseCase {
  title: string;
  description: string;
  items: string[];
  emoji: string;
  renderBackground: (uniqueId: string) => React.ReactNode;
}

const useCases: UseCase[] = [
  {
    title: '研发人员',
    description: '直接对话AI工具，保持心流状态',
    items: ['Cursor Agent', 'Deepseek', '豆包', '百度文心'],
    emoji: '👨‍💻',
    renderBackground: (uniqueId: string) => (
      <>
        <defs>
          <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${uniqueId})`}/>
        <text x="80%" y="25%" fontSize="120" fill="#3B82F6" opacity="0.15" fontFamily="monospace">{'<>'}</text>
      </>
    )
  },
  {
    title: '创作者',
    description: '捕捉并记录灵感，不再因为打字慢而错失创意',
    items: ['Apple notes', '幕布', 'Notion', '语雀'],
    emoji: '✍️',
    renderBackground: (uniqueId: string) => (
      <>
        <defs>
          <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${uniqueId})`}/>
        <path d="M -50 200 Q 200 100 500 300" stroke="#3B82F6" strokeWidth="80" fill="none" opacity="0.1"/>
      </>
    )
  },
  {
    title: '产品, 运营, 销售',
    description: '处理消息、邮件与评论，4倍提效',
    items: ['回复信息，评论', '写邮件', '写文档'],
    emoji: '💼',
    renderBackground: (uniqueId: string) => (
      <>
        <defs>
          <linearGradient id={uniqueId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${uniqueId})`}/>
        <path d="M 50 350 L 150 280 L 250 200 L 350 120 L 450 80" stroke="#3B82F6" strokeWidth="40" fill="none" opacity="0.15"/>
      </>
    )
  },
  {
    title: '外企职场人',
    description: '中英文夹杂没问题，不再切换输入法',
    items: [],
    emoji: '🌐',
    renderBackground: (uniqueId: string) => (
      <>
        <defs>
          <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.35"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${uniqueId})`}/>
        <circle cx="75%" cy="35%" r="100" fill="none" stroke="#3B82F6" strokeWidth="30" opacity="0.15"/>
        <path d="M 300 50 L 300 250" stroke="#3B82F6" strokeWidth="30" opacity="0.1"/>
        <path d="M 200 150 Q 300 120 400 150" stroke="#3B82F6" strokeWidth="30" opacity="0.1" fill="none"/>
      </>
    )
  }
];

export default function UseCaseSection() {
  return (
    <section className="border-b py-16 px-4" style={{ borderColor: 'var(--border)', backgroundColor: '#f3f4f6' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => {
            const uniqueGradientId = `gradient-${index}`;

            return (
              <div
                key={index}
                className="group relative overflow-hidden border-2 bg-white shadow-sm transition-all hover:shadow-md"
                style={{
                  borderRadius: '1.5rem',
                  borderColor: '#d1d5db',
                  borderStyle: 'solid'
                }}
              >
                {/* Background decoration */}
                <div className="absolute inset-0 opacity-[0.08]">
                  <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                    {useCase.renderBackground(uniqueGradientId)}
                  </svg>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col gap-6 py-6">
                  {/* Header */}
                  <div className="px-6">
                    <h3 className="flex items-center gap-3 text-2xl font-semibold text-slate-900 mb-2">
                      {useCase.title}
                      <span className="text-3xl" role="img" aria-label={useCase.title}>
                        {useCase.emoji}
                      </span>
                    </h3>
                    <p className="text-lg font-semibold text-gray-600">
                      {useCase.description}
                    </p>
                  </div>

                  {/* Content */}
                  {useCase.items.length > 0 ? (
                    <div className="px-6 space-y-2">
                      <ul className="space-y-2 text-gray-700">
                        {useCase.items.map((item, itemIndex) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="px-6 py-8">
                      {/* Empty content area to match wireframe */}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
