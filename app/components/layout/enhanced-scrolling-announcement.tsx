import { useThemeSettings } from "@weaverse/hydrogen";
import { useEffect, useState } from "react";

const announcements = [
  "🔥 Grand Clearance Sale - Flat 40% OFF & Flat 60% OFF",
  "⚡ Free Delivery across Pakistan - Limited Time Offer", 
  "✨ New Collection Launch - Premium Quality Fashion",
  "🎯 Buy One Get One Free on Selected Items",
  "🚚 Same Day Delivery Available in Major Cities"
];

export function EnhancedScrollingAnnouncement() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const themeSettings = useThemeSettings();
  const { topbarHeight = 40 } = themeSettings;

  function updateStyles() {
    document.body.style.setProperty(
      "--topbar-height",
      `${Math.max(topbarHeight - window.scrollY, 0)}px`,
    );
  }

  useEffect(() => {
    updateStyles();
    window.addEventListener("scroll", updateStyles);
    return () => window.removeEventListener("scroll", updateStyles);
  }, [topbarHeight]);

  // Auto-rotate announcements
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative flex items-center overflow-hidden whitespace-nowrap text-center bg-black text-white z-50"
      style={{
        height: `${topbarHeight}px`,
      }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-black to-gray-900" />
      
      {/* Scrolling content */}
      <div className="relative flex w-full">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="animate-marquee flex items-center whitespace-nowrap px-8"
            style={{
              animationDuration: "25s",
              animationDelay: `${idx * -3.125}s`,
            }}
          >
            <span className="text-sm font-medium">
              {announcements[currentIndex]}
            </span>
            <span className="mx-8 text-yellow-400">★</span>
          </div>
        ))}
      </div>

      {/* Fade edges */}
      <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-black to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-black to-transparent pointer-events-none" />
    </div>
  );
}