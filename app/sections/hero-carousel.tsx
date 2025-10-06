import {
  createSchema,
  IMAGES_PLACEHOLDERS,
  useThemeSettings,
} from "@weaverse/hydrogen";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { useState, useEffect, useCallback, useRef } from "react";
import { backgroundInputs } from "~/components/background-image";
import { overlayInputs } from "~/components/overlay";
import type { SectionProps } from "~/components/section";
import { layoutInputs, Section } from "~/components/section";
import { cn } from "~/utils/cn";

export interface HeroCarouselProps extends VariantProps<typeof variants> {
  ref: React.Ref<HTMLElement>;
  image1?: string;
  alt1?: string;
  image2?: string;
  alt2?: string;
  image3?: string;
  alt3?: string;
  autoPlay: boolean;
  autoPlayInterval: number;
  showDots: boolean;
  showArrows: boolean;
  transitionDuration: number;
}

const variants = cva("relative flex flex-col [&_.paragraph]:mx-[unset] overflow-hidden", {
  variants: {
    height: {
      small: "min-h-[40vh] lg:min-h-[50vh]",
      medium: "min-h-[50vh] lg:min-h-[60vh]",
      large: "min-h-[70vh] lg:min-h-[80vh]",
      full: "",
    },
    enableTransparentHeader: {
      true: "",
      false: "",
    },
    contentPosition: {
      "top left": "items-start justify-start [&_.paragraph]:text-left",
      "top center": "items-center justify-start [&_.paragraph]:text-center",
      "top right": "items-end justify-start [&_.paragraph]:text-right",
      "center left": "items-start justify-center [&_.paragraph]:text-left",
      "center center": "items-center justify-center [&_.paragraph]:text-center",
      "center right": "items-end justify-center [&_.paragraph]:text-right",
      "bottom left": "items-start justify-end [&_.paragraph]:text-left",
      "bottom center": "items-center justify-end [&_.paragraph]:text-center",
      "bottom right": "items-end justify-end [&_.paragraph]:text-right",
    },
  },
  compoundVariants: [
    {
      height: "full",
      enableTransparentHeader: true,
      className: "h-screen-no-topbar",
    },
    {
      height: "full",
      enableTransparentHeader: false,
      className: "h-screen-dynamic",
    },
  ],
  defaultVariants: {
    height: "large",
    contentPosition: "center center",
  },
});

export default function HeroCarousel(props: HeroCarouselProps & SectionProps) {
  const { 
    ref, 
    children, 
    height, 
    contentPosition, 
    image1,
    alt1,
    image2,
    alt2,
    image3,
    alt3,
    autoPlay = true,
    autoPlayInterval = 5000,
    showDots = true,
    showArrows = true,
    transitionDuration = 600,
    ...rest 
  } = props;
  
  const { enableTransparentHeader } = useThemeSettings();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Build images array from individual props
  const images = [
    ...(image1 ? [{ id: "1", image: image1, alt: alt1 || "Hero Image 1" }] : []),
    ...(image2 ? [{ id: "2", image: image2, alt: alt2 || "Hero Image 2" }] : []),
    ...(image3 ? [{ id: "3", image: image3, alt: alt3 || "Hero Image 3" }] : []),
  ];

  // Use default images if none provided
  const defaultImages = [
    { id: "1", image: IMAGES_PLACEHOLDERS.banner_1, alt: "Hero Image 1" },
    { id: "2", image: IMAGES_PLACEHOLDERS.banner_2, alt: "Hero Image 2" },
    { id: "3", image: IMAGES_PLACEHOLDERS.collection_1, alt: "Hero Image 3" },
  ];

  const finalImages = images.length > 0 ? images : defaultImages;

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isPaused || finalImages.length <= 1) return;

    intervalRef.current = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoPlay, isPaused, autoPlayInterval, currentIndex]);

  // Navigation functions
  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % finalImages.length);
    setTimeout(() => setIsTransitioning(false), transitionDuration);
  }, [isTransitioning, finalImages.length, transitionDuration]);

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + finalImages.length) % finalImages.length);
    setTimeout(() => setIsTransitioning(false), transitionDuration);
  }, [isTransitioning, finalImages.length, transitionDuration]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), transitionDuration);
  }, [isTransitioning, currentIndex, transitionDuration]);

  // Touch/Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const difference = touchStartX.current - touchEndX.current;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(difference) > threshold) {
      if (difference > 0) {
        goToNext(); // Swipe left - next image
      } else {
        goToPrevious(); // Swipe right - previous image
      }
    }
  };

  // Mouse handlers for desktop
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <div
      className={cn(
        "relative w-full",
        variants({
          contentPosition,
          height,
          enableTransparentHeader,
        })
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Images Container */}
      <div className="absolute inset-0">
        {finalImages.map((image, index) => (
          <div
            key={image.id}
            className={cn(
              "absolute inset-0 transition-all duration-500 ease-in-out",
              index === currentIndex
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            )}
            style={{
              transitionDuration: `${transitionDuration}ms`,
            }}
          >
            <img
              src={image.image}
              alt={image.alt || `Hero Image ${index + 1}`}
              className="h-full w-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content Container */}
      <Section
        ref={ref}
        {...rest}
        containerClassName={cn(
          "relative z-10 flex",
          variants({
            contentPosition,
            height,
            enableTransparentHeader,
          })
        )}
      >
        {children}
      </Section>

      {/* Navigation Arrows */}
      {showArrows && finalImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            disabled={isTransitioning}
            className={cn(
              "absolute left-4 top-1/2 z-20 -translate-y-1/2",
              "flex h-12 w-12 items-center justify-center rounded-full",
              "bg-white/20 backdrop-blur-sm transition-all duration-300",
              "hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "group"
            )}
            aria-label="Previous image"
          >
            <svg 
              className="h-6 w-6 text-white transition-transform group-hover:-translate-x-0.5" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          <button
            onClick={goToNext}
            disabled={isTransitioning}
            className={cn(
              "absolute right-4 top-1/2 z-20 -translate-y-1/2",
              "flex h-12 w-12 items-center justify-center rounded-full",
              "bg-white/20 backdrop-blur-sm transition-all duration-300",
              "hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "group"
            )}
            aria-label="Next image"
          >
            <svg 
              className="h-6 w-6 text-white transition-transform group-hover:translate-x-0.5" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && finalImages.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 space-x-2">
          {finalImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={cn(
                "h-3 w-3 rounded-full transition-all duration-300",
                "focus:outline-none focus:ring-2 focus:ring-white/50",
                "disabled:cursor-not-allowed",
                index === currentIndex
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar (optional) */}
      {autoPlay && !isPaused && (
        <div className="absolute bottom-0 left-0 h-1 w-full bg-white/10">
          <div 
            className="h-full bg-white transition-all ease-linear"
            style={{
              width: isTransitioning ? '100%' : '0%',
              transitionDuration: isTransitioning ? '100ms' : `${autoPlayInterval}ms`
            }}
          />
        </div>
      )}
    </div>
  );
}

export const schema = createSchema({
  type: "hero-carousel",
  title: "Hero Carousel",
  settings: [
    {
      group: "Layout",
      inputs: [
        {
          type: "select",
          name: "height",
          label: "Section height",
          configs: {
            options: [
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
              { value: "full", label: "Fullscreen" },
            ],
          },
        },
        {
          type: "position",
          name: "contentPosition",
          label: "Content position",
          defaultValue: "center center",
        },
        ...layoutInputs.filter(
          (inp) => inp.name !== "divider" && inp.name !== "borderRadius",
        ),
      ],
    },
    {
      group: "Carousel Settings",
      inputs: [
        {
          type: "switch",
          name: "autoPlay",
          label: "Auto-play slides",
          defaultValue: true,
        },
        {
          type: "range",
          name: "autoPlayInterval",
          label: "Auto-play interval (ms)",
          configs: {
            min: 2000,
            max: 10000,
            step: 500,
          },
          defaultValue: 5000,
        },
        {
          type: "switch",
          name: "showDots",
          label: "Show dots indicator",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "showArrows",
          label: "Show navigation arrows",
          defaultValue: true,
        },
        {
          type: "range",
          name: "transitionDuration",
          label: "Transition duration (ms)",
          configs: {
            min: 300,
            max: 1000,
            step: 100,
          },
          defaultValue: 600,
        },
      ],
    },
    {
      group: "Images",
      inputs: [
        {
          type: "image",
          name: "image1",
          label: "Hero Image 1",
          defaultValue: IMAGES_PLACEHOLDERS.banner_1,
        },
        {
          type: "text",
          name: "alt1",
          label: "Alt text 1",
          defaultValue: "Hero Image 1",
        },
        {
          type: "image",
          name: "image2",
          label: "Hero Image 2",
          defaultValue: IMAGES_PLACEHOLDERS.banner_2,
        },
        {
          type: "text",
          name: "alt2",
          label: "Alt text 2",
          defaultValue: "Hero Image 2",
        },
        {
          type: "image",
          name: "image3",
          label: "Hero Image 3",
          defaultValue: IMAGES_PLACEHOLDERS.collection_1,
        },
        {
          type: "text",
          name: "alt3",
          label: "Alt text 3",
          defaultValue: "Hero Image 3",
        },
      ],
    },
    { group: "Overlay", inputs: overlayInputs },
  ],
  childTypes: ["subheading", "heading", "paragraph", "button"],
  presets: {
    height: "large",
    contentPosition: "center center",
    autoPlay: true,
    autoPlayInterval: 5000,
    showDots: true,
    showArrows: true,
    transitionDuration: 600,
    image1: IMAGES_PLACEHOLDERS.banner_1,
    alt1: "Hero Image 1",
    image2: IMAGES_PLACEHOLDERS.banner_2,
    alt2: "Hero Image 2",
    image3: IMAGES_PLACEHOLDERS.collection_1,
    alt3: "Hero Image 3",
    enableOverlay: true,
    overlayOpacity: 30,
    children: [
      {
        type: "subheading",
        content: "Welcome to our store",
        color: "#ffffff",
      },
      {
        type: "heading",
        content: "Beautiful Hero Carousel",
        as: "h1",
        color: "#ffffff",
        size: "large",
      },
      {
        type: "paragraph",
        content: "Experience smooth transitions between stunning hero images with touch and swipe support.",
        color: "#ffffff",
      },
      {
        type: "button",
        content: "Shop Now",
        variant: "primary",
        to: "/collections",
      },
    ],
  },
});