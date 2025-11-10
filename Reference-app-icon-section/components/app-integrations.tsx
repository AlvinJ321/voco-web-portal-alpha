"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"

interface AppIcon {
  name: string
  icon: string
  bgColor: string
}

const apps: AppIcon[] = [
  { name: "Notes", icon: "/icons/notes.png", bgColor: "#FFD60A" },
  { name: "Day One", icon: "/icons/dayone.png", bgColor: "#40C4FF" },
  { name: "Outlook", icon: "/icons/outlook.png", bgColor: "#0078D4" },
  { name: "Safari", icon: "/safari-browser-icon-blue-compass.jpg", bgColor: "#007AFF" },
  { name: "Finder", icon: "/finder-app-icon-blue-smiley-face.jpg", bgColor: "#3B99FC" },
  { name: "Calendar", icon: "/calendar-app-icon-red-date.jpg", bgColor: "#FF3B30" },
  { name: "Photos", icon: "/photos-app-icon-flower-petals-colorful.jpg", bgColor: "#FF9500" },
  { name: "Messages", icon: "/messages-app-icon-green-speech-bubble.jpg", bgColor: "#34C759" },
  { name: "Music", icon: "/music-app-icon-red-note.jpg", bgColor: "#FF2D55" },
  { name: "Pages", icon: "/pages-app-icon-orange-pen.jpg", bgColor: "#FF9500" },
  { name: "Keynote", icon: "/keynote-app-icon-blue-podium.jpg", bgColor: "#007AFF" },
  { name: "Contacts", icon: "/contacts-app-icon-brown-address-book.jpg", bgColor: "#8E8E93" },
]

export function AppIntegrations() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationFrameId: number
    let scrollPosition = 0
    const scrollSpeed = 0.5

    const animate = () => {
      scrollPosition += scrollSpeed

      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0
      }

      scrollContainer.style.transform = `translateX(-${scrollPosition}px)`
      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  const duplicatedApps = [...apps, ...apps]

  return (
    <section className="py-24 px-4 overflow-hidden" style={{ backgroundColor: "#fafafa" }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-semibold text-center mb-16 text-balance" style={{ color: "#3b82f6" }}>
          适用于你能想到的任何苹果桌面应用
        </h2>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#fafafa] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#fafafa] to-transparent z-10 pointer-events-none" />

          <div className="overflow-hidden">
            <div ref={scrollRef} className="flex gap-8 will-change-transform" style={{ width: "fit-content" }}>
              {duplicatedApps.map((app, index) => (
                <div
                  key={`${app.name}-${index}`}
                  className="flex flex-col items-center justify-center gap-4 flex-shrink-0"
                >
                  <div
                    className="w-24 h-24 rounded-2xl shadow-sm flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-110"
                    style={{ backgroundColor: app.bgColor }}
                  >
                    <Image
                      src={app.icon || "/placeholder.svg"}
                      alt={app.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600">{app.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
