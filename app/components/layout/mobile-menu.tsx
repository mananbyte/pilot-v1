import { CaretRightIcon, ListIcon, XIcon } from "@phosphor-icons/react";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as Dialog from "@radix-ui/react-dialog";
import React from "react";
import { useRouteLoaderData } from "react-router";
import Link from "~/components/link";
import { ScrollArea } from "~/components/scroll-area";
import { useShopMenu } from "~/hooks/use-shop-menu";
import type { SingleMenuItem } from "~/types/menu";
import type { RootLoader } from "~/root";
import { cn } from "~/utils/cn";
import { type CategoryConfig } from "~/utils/navigation-config";

export function MobileMenu() {
  const { headerMenu } = useShopMenu();

  // Get dynamic navigation data from root loader
  const rootData = useRouteLoaderData<RootLoader>("root");
  const navigationData = rootData?.navigation;

  // Convert dynamic navigation to mobile-friendly format
  const brandNavigation = React.useMemo(() => {
    if (!navigationData?.categories) {
      // Fallback navigation when data is unavailable
      return [
        { id: "new", title: "NEW", to: "/collections/new", badge: "NEW" },
        { id: "sale", title: "SALE", to: "/collections/sale", badge: "SALE", color: "text-red-500" },
        { id: "men", title: "MEN'S", to: "/collections/mens", subcategories: [] },
        { id: "women", title: "WOMEN'S", to: "/collections/womens", subcategories: [] },
        { id: "accessories", title: "ACCESSORIES", to: "/collections/accessories", subcategories: [] },
        { id: "collections", title: "ALL COLLECTIONS", to: "/collections" }
      ];
    }

    const navigation: any[] = [
      { id: "new", title: "NEW", to: "/collections/new", badge: "NEW" },
      { id: "sale", title: "SALE", to: "/collections/sale", badge: "SALE", color: "text-red-500" }
    ];

    // Convert each available category for mobile
    Object.entries(navigationData.categories).forEach(([key, category]) => {
      const typedCategory = category as CategoryConfig;
      if (!typedCategory.available) return;

      const subcategories: any[] = [];

      // Add New Arrivals with fire emoji
      const newItems = typedCategory.subcategories.newArrivals?.filter(item => item.available !== false) || [];
      newItems.forEach(item => {
        subcategories.push({
          title: `🔥 ${item.title}`,
          to: item.to,
          badge: item.badge
        });
      });

      if (newItems.length > 0 && (typedCategory.subcategories.allProducts?.length || typedCategory.subcategories.seasonal?.length)) {
        subcategories.push({ title: "---", to: "#", divider: true });
      }

      // Add All Products
      const allItems = typedCategory.subcategories.allProducts?.filter(item => item.available !== false) || [];
      allItems.forEach(item => {
        subcategories.push({
          title: item.badge === 'FEATURED' ? `🌟 ${item.title}` : item.title,
          to: item.to,
          badge: item.badge,
          featured: item.badge === 'FEATURED'
        });
      });

      // Add seasonal divider if we have seasonal items
      const seasonalItems = typedCategory.subcategories.seasonal?.filter(item => item.available !== false) || [];
      if (seasonalItems.length > 0) {
        subcategories.push({ title: "---", to: "#", divider: true, dividerText: "Seasonal Collections" });
        
        seasonalItems.forEach(item => {
          subcategories.push({
            title: item.title, // Already has emoji from config
            to: item.to,
            badge: item.badge
          });
        });
      }

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
    <Dialog.Root>
      <Dialog.Trigger
        asChild
        className="relative flex h-8 w-8 items-center justify-center focus-visible:outline-hidden lg:hidden"
      >
        <MenuTrigger />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-fade-in"
          style={{ "--fade-in-duration": "100ms" } as React.CSSProperties}
        />
        <Dialog.Content
          className={cn([
            "fixed inset-0 z-50 h-screen-no-topbar bg-white pt-4 pb-2",
            "-translate-x-full left-0 data-[state=open]:translate-x-0 data-[state=open]:animate-enter-from-left",
            "focus-visible:outline-hidden",
            "uppercase",
          ])}
          style={
            { "--enter-from-left-duration": "200ms" } as React.CSSProperties
          }
          aria-describedby={undefined}
        >
          <Dialog.Title asChild>
            <div className="px-4 text-lg font-bold text-gray-900">Menu</div>
          </Dialog.Title>
          <Dialog.Close asChild>
            <XIcon className="fixed top-4 right-4 h-6 w-6 text-gray-900 hover:text-red-500 transition-colors" />
          </Dialog.Close>
          <div className="mt-4 border-gray-200 border-t" />
          <div className="py-2">
            <ScrollArea className="h-[calc(100vh-5rem)]">
              <div className="space-y-1 px-4">
                {brandNavigation.map((item) => (
                  <MobileMenuItem key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MobileMenuItem({ item }: { item: any }) {
  const { title, to, badge, subcategories } = item;

  if (!subcategories) {
    return (
      <Dialog.Close asChild>
        <Link 
          to={to} 
          className={cn(
            "flex items-center justify-between py-4 text-base font-medium transition-colors border-b border-gray-100",
            "hover:text-blue-600 text-gray-900"
          )}
        >
          <span className="flex items-center gap-2">
            {title}
            {badge && (
              <span className={cn(
                "px-2 py-1 text-xs font-bold rounded",
                badge === "NEW" 
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              )}>
                {badge}
              </span>
            )}
          </span>
          <CaretRightIcon className="h-4 w-4 text-gray-400" />
        </Link>
      </Dialog.Close>
    );
  }

  return (
    <Collapsible.Root>
      <Collapsible.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between py-4 text-base font-medium transition-colors border-b border-gray-100",
            "hover:text-blue-600 text-gray-900",
            'data-[state="open"]:[&>svg]:rotate-90'
          )}
        >
          <span className="flex items-center gap-2">
            {title}
            {badge && (
              <span className={cn(
                "px-2 py-1 text-xs font-bold rounded",
                badge === "NEW" 
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              )}>
                {badge}
              </span>
            )}
          </span>
          <CaretRightIcon className="h-4 w-4 text-gray-400 transition-transform duration-200" />
        </button>
      </Collapsible.Trigger>
      <Collapsible.Content className="border-l-2 border-gray-200 ml-4 pl-4 space-y-1 pb-2">
        {subcategories.map((subItem: any, index: number) => {
          // Handle divider items
          if (subItem.divider) {
            return (
              <div key={index} className="border-t border-gray-200 my-2 pt-2">
                <span className="text-xs text-gray-400 uppercase tracking-wider">
                  {subItem.dividerText || "All Products"}
                </span>
              </div>
            );
          }

          return (
            <Dialog.Close key={subItem.to} asChild>
              <Link 
                to={subItem.to} 
                className={cn(
                  "block py-2 text-sm transition-colors flex items-center gap-2",
                  subItem.featured 
                    ? "text-blue-600 font-semibold hover:text-blue-800" 
                    : "text-gray-600 hover:text-blue-600"
                )}
              >
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
              </Link>
            </Dialog.Close>
          );
        })}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function CollapsibleMenuItem({ item }: { item: SingleMenuItem }) {
  const { title, to, items } = item;

  if (!items?.length) {
    return (
      <Dialog.Close asChild>
        <Link to={to} className="py-3">
          {title}
        </Link>
      </Dialog.Close>
    );
  }

  return (
    <Collapsible.Root>
      <Collapsible.Trigger asChild>
        <button
          type="button"
          className='flex w-full items-center justify-between gap-4 py-3 data-[state="open"]:[&>svg]:rotate-90'
        >
          <span className="uppercase">{title}</span>
          <CaretRightIcon className="h-4 w-4" />
        </button>
      </Collapsible.Trigger>
      <Collapsible.Content className="border-gray-300 border-l pl-4">
        {items.map((childItem) => (
          <CollapsibleMenuItem key={childItem.id} item={childItem} />
        ))}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function MenuTrigger(
  props: Dialog.DialogTriggerProps & { ref?: React.Ref<HTMLButtonElement> },
) {
  const { ref, ...rest } = props;
  return (
    <button ref={ref} type="button" {...rest}>
      <ListIcon className="h-5 w-5" />
    </button>
  );
}
