import { MagnifyingGlassIcon, UserIcon } from "@phosphor-icons/react";
import { useThemeSettings } from "@weaverse/hydrogen";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import React, { Suspense, useState, useRef, useCallback } from "react";
import {
  Await,
  useLocation,
  useRouteError,
  useRouteLoaderData,
} from "react-router";
import useWindowScroll from "react-use/esm/useWindowScroll";
import Link from "~/components/link";
import { Logo } from "~/components/logo";
import type { RootLoader } from "~/root";
import { cn } from "~/utils/cn";
import { DEFAULT_LOCALE } from "~/utils/const";
import { useShopMenu } from "~/hooks/use-shop-menu";
import { type UnifiedNavigationResult } from "~/utils/unified-navigation";
import { type CategoryConfig } from "~/utils/navigation-config";
import { CartDrawer } from "./cart-drawer";
import { DesktopMenu } from "./desktop-menu";
import { MobileMenu } from "./mobile-menu";
import { PredictiveSearchButton } from "./predictive-search";
import { EnhancedScrollingAnnouncement } from "./enhanced-scrolling-announcement";

// Types for our navigation structure
interface SubMenuItem {
  title: string;
  to: string;
  badge?: string;
  featured?: boolean;
}

interface NavigationItem {
  id: string;
  title: string;
  to: string;
  badge?: string;
  color?: string;
  subcategories?: Record<string, SubMenuItem[]>;
}

const variants = cva("", {
  variants: {
    width: {
      full: "h-full w-full",
      stretch: "h-full w-full",
      fixed: "mx-auto h-full w-full max-w-(--page-width)",
    },
    padding: {
      full: "",
      stretch: "px-3 md:px-10 lg:px-16",
      fixed: "mx-auto px-3 md:px-4 lg:px-6",
    },
  },
});

function useIsHomeCheck() {
  const { pathname } = useLocation();
  const rootData = useRouteLoaderData<RootLoader>("root");
  const selectedLocale = rootData?.selectedLocale ?? DEFAULT_LOCALE;
  return pathname.replace(selectedLocale.pathPrefix, "") === "/";
}

export function Header() {
  const { enableTransparentHeader, headerWidth } = useThemeSettings();
  const isHome = useIsHomeCheck();
  const { y } = useWindowScroll();
  const routeError = useRouteError();
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  const scrolled = y >= 50;
  const enableTransparent = enableTransparentHeader && isHome && !routeError;
  const isTransparent = enableTransparent && !scrolled && !isHeaderHovered;

  return (
    <>
      <EnhancedScrollingAnnouncement />
      <header
        className={cn(
          "z-40 w-full relative",
          "transition-all duration-500 ease-in-out",
          variants({ padding: headerWidth }),
          scrolled ? "shadow-lg" : "shadow-none",
          enableTransparent
            ? [
                "fixed w-screen",
                "top-(--topbar-height,var(--initial-topbar-height))",
              ]
            : "sticky top-0",
          isTransparent
            ? [
                "bg-transparent backdrop-blur-none",
                "text-white",
                "border-transparent",
                "[&_.cart-count]:text-white",
                "[&_.cart-count]:bg-black/20",
                "[&_.cart-count]:backdrop-blur-sm",
              ]
            : [
                "bg-white/95 backdrop-blur-md",
                "text-gray-900",
                "border-b border-gray-200/50",
                "[&_.cart-count]:text-white",
                "[&_.cart-count]:bg-gray-900",
              ],
        )}
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        <div
          className={cn(
            "flex h-16 lg:h-20 items-center justify-between gap-4",
            variants({ width: headerWidth }),
          )}
        >
          <MobileMenu />
          
          {/* Logo */}
          <div className="flex items-center">
            <Logo isTransparent={isTransparent} />
          </div>

          {/* Desktop Navigation */}
          <EnhancedDesktopMenu isTransparent={isTransparent} />

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <PredictiveSearchButton />
            <AccountLink className="relative flex h-8 w-8 items-center justify-center" />
            <CartDrawer />
          </div>
        </div>
      </header>
    </>
  );
}

// Enhanced Desktop Menu Component
function EnhancedDesktopMenu({ isTransparent }: { isTransparent: boolean }) {
  const { headerMenu } = useShopMenu();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback((itemId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setHoveredItem(itemId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 150);
  }, []);

  // Get dynamic navigation data from root loader
  const rootData = useRouteLoaderData<RootLoader>("root");
  const navigationData = rootData?.navigation;

  // Convert dynamic navigation to the format expected by our header
  const brandNavigation: NavigationItem[] = React.useMemo(() => {
    if (!navigationData?.categories || Object.keys(navigationData.categories).length === 0) {
      // Pure Shopify mode - show minimal navigation when no collections exist
      return [
        { id: "sale", title: "SALE", to: "/collections/sale", badge: "SALE", color: "text-red-500" },
        { id: "collections", title: "COLLECTIONS", to: "/collections" }
      ];
    }

    const navigation: NavigationItem[] = [
      { id: "new", title: "NEW", to: "/collections/new", badge: "NEW" },
      { id: "sale", title: "SALE", to: "/collections/sale", badge: "SALE", color: "text-red-500" }
    ];

    // Convert each available category
    Object.entries(navigationData.categories).forEach(([key, category]) => {
      const typedCategory = category as CategoryConfig;
      if (!typedCategory.available) return;

      const subcategories: Record<string, SubMenuItem[]> = {};

      // Convert subcategories
      Object.entries(typedCategory.subcategories).forEach(([subKey, subItems]) => {
        const sectionTitle = subKey === 'newArrivals' ? 'NEW ARRIVALS' :
                           subKey === 'allProducts' ? 'ALL PRODUCTS' :
                           subKey === 'categories' ? 'CATEGORIES' :
                           subKey === 'seasonal' ? 'SEASONAL' : subKey.toUpperCase();

        subcategories[sectionTitle] = subItems
          .filter(item => item.available !== false)
          .map(item => ({
            title: item.title,
            to: item.to,
            badge: item.badge,
            featured: item.badge === 'FEATURED'
          }));
      });

      navigation.push({
        id: key,
        title: typedCategory.displayName,
        to: `/collections/${key}`,
        subcategories
      });
    });

    navigation.push({ id: "collections", title: "ALL COLLECTIONS", to: "/collections" });

    return navigation;
  }, [navigationData]);

  return (
    <nav className="hidden lg:flex items-center justify-center flex-1 max-w-5xl mx-auto relative">
      <div className="flex items-center space-x-8">
        {brandNavigation.map((item) => (
          <div
            key={item.id}
            className="relative group"
            onMouseEnter={() => handleMouseEnter(item.id)}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              to={item.to}
              className={cn(
                "relative flex items-center gap-1.5 py-2 px-1 text-sm font-medium tracking-wider uppercase transition-all duration-300",
                isTransparent 
                  ? "text-white hover:text-yellow-300" 
                  : "text-gray-900 hover:text-blue-600",
                item.color && !isTransparent ? item.color : ""
              )}
            >
              {item.title}
              {item.badge && (
                <span className={cn(
                  "ml-1 px-1.5 py-0.5 text-xs font-bold rounded",
                  item.badge === "NEW" 
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                )}>
                  {item.badge}
                </span>
              )}
              
              {/* Hover underline effect */}
              <span 
                className={cn(
                  "absolute bottom-0 left-0 h-0.5 bg-current transition-all duration-300",
                  hoveredItem === item.id ? "w-full" : "w-0"
                )}
              />
            </Link>

            {/* Mega Menu Dropdown */}
            {item.subcategories && (
              <div 
                className={cn(
                  "absolute top-full left-1/2 transform -translate-x-1/2 mt-2",
                  "w-screen max-w-4xl",
                  "bg-white shadow-2xl border border-gray-100 rounded-lg",
                  "transition-all duration-300 ease-out",
                  "z-50 p-8",
                  hoveredItem === item.id 
                    ? "opacity-100 translate-y-0 pointer-events-auto" 
                    : "opacity-0 translate-y-2 pointer-events-none"
                )}
              >
                <div className="grid grid-cols-4 gap-6">
                  {Object.entries(item.subcategories).map(([category, items]) => (
                    <div key={category} className="space-y-4">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">
                        {category}
                      </h3>
                      <ul className="space-y-2">
                        {items.map((subItem) => (
                          <li key={subItem.to}>
                            <Link
                              to={subItem.to}
                              className={cn(
                                "text-sm transition-colors duration-200 block py-1 hover:translate-x-1 flex items-center justify-between group",
                                subItem.featured 
                                  ? "text-blue-600 font-semibold hover:text-blue-800" 
                                  : "text-gray-600 hover:text-blue-600"
                              )}
                            >
                              <span className="flex items-center gap-2">
                                {subItem.title}
                                {subItem.badge && (
                                  <span className={cn(
                                    "px-1.5 py-0.5 text-xs font-bold rounded",
                                    subItem.badge === "NEW" 
                                      ? "bg-green-500 text-white"
                                      : subItem.badge === "HOT"
                                      ? "bg-orange-500 text-white"
                                      : subItem.badge === "SCHOOL"
                                      ? "bg-blue-500 text-white"
                                      : "bg-red-500 text-white"
                                  )}>
                                    {subItem.badge}
                                  </span>
                                )}
                                {subItem.featured && (
                                  <span className="text-xs text-blue-500">★</span>
                                )}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                
                {/* Arrow pointing up */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45"></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}

function AccountLink({ className }: { className?: string }) {
  const rootData = useRouteLoaderData<RootLoader>("root");
  const isLoggedIn = rootData?.isLoggedIn;

  return (
    <Link to="/account" className={clsx("transition-all duration-300 hover:scale-110", className)}>
      <Suspense fallback={<UserIcon className="h-5 w-5" />}>
        <Await
          resolve={isLoggedIn}
          errorElement={<UserIcon className="h-5 w-5" />}
        >
          {(loggedIn) =>
            loggedIn ? (
              <UserIcon className="h-5 w-5" />
            ) : (
              <UserIcon className="h-5 w-5" />
            )
          }
        </Await>
      </Suspense>
    </Link>
  );
}
