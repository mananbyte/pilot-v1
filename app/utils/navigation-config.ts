/**
 * Dynamic Navigation Configuration System
 * 
 * This file allows you to easily update navigation categories without code changes.
 * The system will automatically adapt to whatever collections you have in Shopify.
 */

export interface NavigationItem {
  title: string;
  to: string;
  badge?: 'NEW' | 'HOT' | 'SALE' | 'FEATURED' | 'SCHOOL';
  icon?: string;
  description?: string;
  available?: boolean; // Set to false to hide temporarily
}

export interface CategoryConfig {
  available: boolean;
  displayName: string;
  subcategories: {
    newArrivals: NavigationItem[];
    allProducts: NavigationItem[];
    categories: NavigationItem[];
    seasonal: NavigationItem[];
  };
}

// 🎯 TEMPLATE CONFIGURATION - This serves as fallback when Shopify data is unavailable
// The NavigationManager will merge this with real Shopify collections
export const navigationTemplate: Record<string, CategoryConfig> = {
  mens: {
    available: true, // Set to false to hide entire Men's section
    displayName: "MEN'S",
    subcategories: {
      newArrivals: [
        // Add only what you actually have as new arrivals
        { title: "Latest Kurtas", to: "/collections/mens/new/kurtas", badge: "NEW" },
        { title: "New Shalwar Kameez", to: "/collections/mens/new/shalwar-kameez", badge: "NEW" },
        // Add more as your inventory grows
      ],
      allProducts: [
        // Add only the categories you have products for
        { title: "All Kurtas", to: "/collections/mens/kurtas" },
        { title: "All Shalwar Kameez", to: "/collections/mens/shalwar-kameez" },
        { title: "All Men's Collection", to: "/collections/mens", badge: "FEATURED" },
      ],
      categories: [
        // Customize based on your actual product types
        { title: "Traditional Wear", to: "/collections/mens/traditional" },
        { title: "Casual Wear", to: "/collections/mens/casual", available: false }, // Hide until you have stock
      ],
      seasonal: [
        // Add only seasons you have products for
        { title: "Summer Collection", to: "/collections/mens/summer", badge: "HOT", icon: "🌞" },
        { title: "Winter Collection", to: "/collections/mens/winter", icon: "❄️", available: false }, // Hide until winter stock
      ],
    },
  },

  womens: {
    available: true, // Set to false to hide entire Women's section
    displayName: "WOMEN'S", 
    subcategories: {
      newArrivals: [
        { title: "Latest Kurtis", to: "/collections/womens/new/kurtis", badge: "NEW" },
        { title: "New Lawn Collection", to: "/collections/womens/new/lawn", badge: "NEW" },
      ],
      allProducts: [
        { title: "All Kurtis", to: "/collections/womens/kurtis" },
        { title: "All Lawn Suits", to: "/collections/womens/lawn" },
        { title: "All Women's Collection", to: "/collections/womens", badge: "FEATURED" },
      ],
      categories: [
        { title: "Formal Wear", to: "/collections/womens/formal" },
        { title: "Casual Wear", to: "/collections/womens/casual", available: false },
      ],
      seasonal: [
        { title: "Summer Lawn", to: "/collections/womens/summer", badge: "HOT", icon: "🌞" },
        { title: "Winter Collection", to: "/collections/womens/winter", icon: "❄️", available: false },
      ],
    },
  },

  kids: {
    available: false, // Set to true when you have kids' inventory
    displayName: "KIDS",
    subcategories: {
      newArrivals: [
        { title: "New Boys Wear", to: "/collections/kids/new/boys", badge: "NEW", available: false },
        { title: "New Girls Collection", to: "/collections/kids/new/girls", badge: "NEW", available: false },
      ],
      allProducts: [
        { title: "All Boys Wear", to: "/collections/kids/boys", available: false },
        { title: "All Girls Wear", to: "/collections/kids/girls", available: false },
      ],
      categories: [
        { title: "School Uniforms", to: "/collections/kids/uniforms", badge: "SCHOOL", available: false },
      ],
      seasonal: [
        { title: "Summer Fun", to: "/collections/kids/summer", icon: "🌞", available: false },
      ],
    },
  },

  accessories: {
    available: true, // You might have some accessories
    displayName: "ACCESSORIES",
    subcategories: {
      newArrivals: [
        { title: "New Accessories", to: "/collections/accessories/new", badge: "NEW" },
      ],
      allProducts: [
        { title: "All Accessories", to: "/collections/accessories" },
      ],
      categories: [
        { title: "Bags", to: "/collections/accessories/bags", available: false },
        { title: "Jewelry", to: "/collections/accessories/jewelry", available: false },
      ],
      seasonal: [],
    },
  },
};

// 🔧 UTILITY FUNCTIONS

// Export template for external use
export const navigationConfig = navigationTemplate;

/**
 * Get only available categories for navigation
 */
export function getAvailableCategories(config = navigationTemplate): Record<string, CategoryConfig> {
  return Object.fromEntries(
    Object.entries(config).filter(([_, category]) => category.available)
  );
}

/**
 * Get available items from a subcategory, filtering out unavailable ones
 */
export function getAvailableItems(items: NavigationItem[]): NavigationItem[] {
  return items.filter(item => item.available !== false);
}

/**
 * Get navigation structure for a specific category
 */
export function getCategoryNavigation(categoryKey: string, config = navigationTemplate): CategoryConfig | null {
  const category = config[categoryKey];
  return category?.available ? category : null;
}

/**
 * Generate breadcrumbs for collection pages
 */
export function generateBreadcrumbs(path: string): Array<{title: string, to: string}> {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs = [{ title: 'Home', to: '/' }];
  
  // Add category breadcrumb
  if (segments.includes('collections')) {
    const categoryIndex = segments.indexOf('collections') + 1;
    const category = segments[categoryIndex];
    
    const config = getCategoryNavigation(category);
    if (config) {
      breadcrumbs.push({
        title: config.displayName,
        to: `/collections/${category}`
      });
    }
  }
  
  return breadcrumbs;
}

// 🎨 CUSTOMIZATION HELPERS

/**
 * Easy way to temporarily hide categories during inventory changes
 */
export function toggleCategory(categoryKey: string, available: boolean, config = navigationTemplate) {
  if (config[categoryKey]) {
    config[categoryKey].available = available;
  }
}

/**
 * Add new subcategory to existing category
 */
export function addSubcategory(
  categoryKey: string, 
  subcategoryType: keyof CategoryConfig['subcategories'],
  item: NavigationItem,
  config = navigationTemplate
) {
  if (config[categoryKey]) {
    config[categoryKey].subcategories[subcategoryType].push(item);
  }
}

/**
 * Remove subcategory from existing category
 */
export function removeSubcategory(
  categoryKey: string,
  subcategoryType: keyof CategoryConfig['subcategories'],
  itemTitle: string,
  config = navigationTemplate
) {
  if (config[categoryKey]) {
    const subcategory = config[categoryKey].subcategories[subcategoryType];
    const index = subcategory.findIndex(item => item.title === itemTitle);
    if (index > -1) {
      subcategory.splice(index, 1);
    }
  }
}