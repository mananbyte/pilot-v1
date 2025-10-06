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
  const [isAnimating, setIsAnimating] = useState(false);
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

  // Auto-rotate announcements with slide animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
        setIsAnimating(false);
      }, 150); // Half of transition duration
    }, 3500); // Show each announcement for 3.5 seconds
    return () => clearInterval(interval);
  }, []);

  // Manual navigation functions
  const goToNext = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
        setIsAnimating(false);
      }, 150);
    }
  };

  const goToPrevious = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
        setIsAnimating(false);
      }, 150);
    }
  };

  return (
    <div
      className="relative flex items-center justify-center bg-black text-white z-50 cursor-pointer group"
      style={{
        height: `${topbarHeight}px`,
      }}
      onClick={goToNext}
    >
      {/* Background gradient - CUSTOMIZE COLORS HERE */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-black to-gray-900" />
      {/* 
        Color Options:
        - Red theme: from-red-900 via-red-600 to-red-900
        - Blue theme: from-blue-900 via-blue-600 to-blue-900  
        - Green theme: from-green-900 via-green-600 to-green-900
        - Purple theme: from-purple-900 via-purple-600 to-purple-900
        - Custom: from-[#your-color] via-[#your-color] to-[#your-color]
      */}
      
      {/* Previous Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goToPrevious();
        }}
        className="absolute left-2 z-10 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 opacity-0 group-hover:opacity-100"
        aria-label="Previous announcement"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden px-12">
        <div 
          className={`text-center transition-all duration-300 ease-in-out ${
            isAnimating ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
          }`}
        >
          <span className="text-sm font-medium">
            {announcements[currentIndex]}
          </span>
        </div>
      </div>

      {/* Next Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goToNext();
        }}
        className="absolute right-2 z-10 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 opacity-0 group-hover:opacity-100"
        aria-label="Next announcement"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Progress Indicators */}
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {announcements.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              if (!isAnimating && index !== currentIndex) {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsAnimating(false);
                }, 150);
              }
            }}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-white scale-125' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to announcement ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}