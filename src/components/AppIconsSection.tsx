import React, { useEffect, useRef } from 'react';

// Import app icons
import AppleIcon from '../../resource/app-icons/apple.png';
import DayOneIcon from '../../resource/app-icons/Dayone3.png';
import EmailIcon from '../../resource/app-icons/email.png';
import FeishuIcon from '../../resource/app-icons/Feishu2.png';
import NotionIcon from '../../resource/app-icons/Notion-logo.svg.png';
import ObsidianIcon from '../../resource/app-icons/obsidian-icon.png';
import QQIcon from '../../resource/app-icons/qq.png';
import TeamsIcon from '../../resource/app-icons/Teams.png';
import WeChatIcon from '../../resource/app-icons/wechat.png';
import FlomoIcon from '../../resource/app-icons/Flomo.png';
import YinxiangIcon from '../../resource/app-icons/印象笔记.png';
import DingDingIcon from '../../resource/app-icons/钉钉.png';

interface AppIcon {
  name: string;
  icon: string;
  size?: 'large' | 'small';
}

const apps: AppIcon[] = [
  { name: 'Notes', icon: AppleIcon },
  { name: 'Day One', icon: DayOneIcon },
  { name: 'Outlook', icon: EmailIcon },
  { name: '飞书', icon: FeishuIcon },
  { name: 'Notion', icon: NotionIcon },
  { name: 'Obsidian', icon: ObsidianIcon },
  { name: 'QQ', icon: QQIcon },
  { name: 'Teams', icon: TeamsIcon },
  { name: '微信', icon: WeChatIcon },
  { name: 'Flomo', icon: FlomoIcon },
  { name: '印象笔记', icon: YinxiangIcon },
  { name: '钉钉', icon: DingDingIcon },
];

export default function AppIconsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationFrameId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5;

    const animate = () => {
      scrollPosition += scrollSpeed;

      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }

      scrollContainer.style.transform = `translateX(-${scrollPosition}px)`;
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const duplicatedApps = [...apps, ...apps, ...apps, ...apps];

  return (
    <section className="border-b py-16 px-4 overflow-hidden" style={{ backgroundColor: '#fafafa', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-semibold text-center mb-12 text-balance" style={{ color: '#3b82f6' }}>
          适用于你能想到的任何苹果桌面应用
        </h2>

        <div className="relative pb-4">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#fafafa] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#fafafa] to-transparent z-10 pointer-events-none" />

          <div className="overflow-hidden">
            <div ref={scrollRef} className="flex gap-6 will-change-transform" style={{ width: 'fit-content' }}>
              {duplicatedApps.map((app, index) => (
                <div
                  key={`${app.name}-${index}`}
                  className="flex flex-col items-center gap-3 flex-shrink-0"
                >
                  <div
                    className={`${
                      app.size === 'large' ? 'w-20 h-20' : 
                      app.size === 'small' ? 'w-14 h-14' : 
                      'w-16 h-16'
                    } rounded-2xl shadow-sm overflow-hidden transition-transform duration-300 hover:scale-110 flex items-center justify-center`}
                  >
                    <img
                      src={app.icon}
                      alt={app.name}
                      className="w-full h-full object-cover rounded-2xl"
                      style={{ 
                        display: 'block',
                        imageRendering: 'auto',
                        objectPosition: 'center',
                        width: '100%',
                        height: '100%',
                        minWidth: '100%',
                        minHeight: '100%'
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600">{app.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

