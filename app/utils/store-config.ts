/**
 * Admin-Friendly Configuration System
 * 
 * Simple JSON-based configuration that non-technical users can easily update.
 * This file acts as a centralized control panel for your e-commerce navigation.
 */

/**
 * 🎯 EASY CONFIGURATION PANEL
 * 
 * Update these settings to customize your store without touching code!
 * 
 * HOW TO USE:
 * 1. Set `enabled: true/false` to show/hide categories
 * 2. Update `displayName` to change what customers see
 * 3. Add/remove items from subcategories
 * 4. Change badges to highlight promotions
 * 5. Update seasonal collections based on your inventory
 */

export const STORE_CONFIG = {
  // 🏪 STORE SETTINGS
  store: {
    name: "Your Brand Name",
    tagline: "Premium Fashion & Lifestyle",
    currency: "PKR",
    locale: "en-US",
    timezone: "Asia/Karachi"
  },

  // 📱 NAVIGATION SETTINGS  
  navigation: {
    // Show announcement bar at top
    showAnnouncement: true,
    
    // Auto-hide empty categories (no products)
    hideEmptyCategories: true,
    
    // Maximum items to show in dropdowns
    maxDropdownItems: 8,
    
    // Enable seasonal collections
    enableSeasonalCollections: true,
  },

  // 🛍️ CATEGORY CONFIGURATION
  categories: {
    mens: {
      enabled: true,
      displayName: "MEN'S",
      description: "Discover premium men's fashion and traditional wear",
      featured: true,
      subcategories: {
        newArrivals: {
          enabled: true,
          title: "NEW ARRIVALS",
          maxItems: 4,
          items: [
            {
              name: "Latest Kurtas",
              shopifyHandle: "mens-new-kurtas",
              badge: "NEW",
              priority: 1
            },
            {
              name: "Fresh Shalwar Kameez", 
              shopifyHandle: "mens-new-shalwar-kameez",
              badge: "NEW",
              priority: 2
            }
          ]
        },
        
        allProducts: {
          enabled: true,
          title: "ALL PRODUCTS", 
          maxItems: 6,
          items: [
            {
              name: "All Kurtas",
              shopifyHandle: "mens-kurtas", 
              featured: true,
              priority: 1
            },
            {
              name: "All Shalwar Kameez",
              shopifyHandle: "mens-shalwar-kameez",
              priority: 2
            },
            {
              name: "All Men's Collection",
              shopifyHandle: "mens",
              badge: "FEATURED",
              featured: true,
              priority: 3
            }
          ]
        },

        categories: {
          enabled: true,
          title: "CATEGORIES",
          items: [
            {
              name: "Traditional Wear",
              shopifyHandle: "mens-traditional",
              priority: 1
            },
            {
              name: "Formal Wear", 
              shopifyHandle: "mens-formal",
              priority: 2,
              enabled: false // Hide until you have inventory
            }
          ]
        },

        seasonal: {
          enabled: true,
          title: "SEASONAL",
          items: [
            {
              name: "Summer Collection",
              shopifyHandle: "mens-summer",
              badge: "HOT",
              icon: "🌞",
              priority: 1,
              availableMonths: [3, 4, 5, 6, 7, 8] // March to August
            },
            {
              name: "Winter Collection", 
              shopifyHandle: "mens-winter",
              icon: "❄️",
              priority: 2,
              availableMonths: [11, 12, 1, 2], // Nov to Feb
              enabled: false // Enable when winter stock arrives
            }
          ]
        }
      }
    },

    womens: {
      enabled: true,
      displayName: "WOMEN'S",
      description: "Elegant women's fashion and traditional attire",
      featured: true,
      subcategories: {
        newArrivals: {
          enabled: true,
          title: "NEW ARRIVALS",
          maxItems: 4,
          items: [
            {
              name: "Latest Kurtis",
              shopifyHandle: "womens-new-kurtis",
              badge: "NEW",
              priority: 1
            },
            {
              name: "New Lawn Collection",
              shopifyHandle: "womens-new-lawn", 
              badge: "NEW",
              priority: 2
            }
          ]
        },

        allProducts: {
          enabled: true,
          title: "ALL PRODUCTS",
          maxItems: 6, 
          items: [
            {
              name: "All Kurtis",
              shopifyHandle: "womens-kurtis",
              featured: true,
              priority: 1
            },
            {
              name: "All Lawn Suits",
              shopifyHandle: "womens-lawn", 
              priority: 2
            },
            {
              name: "All Women's Collection",
              shopifyHandle: "womens",
              badge: "FEATURED",
              featured: true,
              priority: 3
            }
          ]
        },

        categories: {
          enabled: true,
          title: "CATEGORIES",
          items: [
            {
              name: "Formal Wear",
              shopifyHandle: "womens-formal",
              priority: 1
            },
            {
              name: "Casual Wear",
              shopifyHandle: "womens-casual", 
              priority: 2,
              enabled: false
            }
          ]
        },

        seasonal: {
          enabled: true,
          title: "SEASONAL",
          items: [
            {
              name: "Summer Lawn",
              shopifyHandle: "womens-summer-lawn",
              badge: "HOT", 
              icon: "🌞",
              priority: 1,
              availableMonths: [3, 4, 5, 6, 7, 8]
            },
            {
              name: "Winter Collection",
              shopifyHandle: "womens-winter",
              icon: "❄️",
              priority: 2,
              availableMonths: [11, 12, 1, 2],
              enabled: false
            }
          ]
        }
      }
    },

    kids: {
      enabled: false, // Set to true when you have kids inventory
      displayName: "KIDS",
      description: "Adorable children's clothing and accessories",
      featured: false,
      subcategories: {
        // ... Similar structure to mens/womens
        // Will be populated when you're ready to launch kids section
      }
    },

    accessories: {
      enabled: true,
      displayName: "ACCESSORIES", 
      description: "Complete your look with our accessories",
      featured: false,
      subcategories: {
        allProducts: {
          enabled: true,
          title: "ALL ACCESSORIES",
          items: [
            {
              name: "All Accessories",
              shopifyHandle: "accessories",
              priority: 1
            }
          ]
        }
      }
    }
  },

  // 🏷️ BADGE CONFIGURATION
  badges: {
    // Enable/disable badge types
    enableNewBadges: true,
    enableSaleBadges: true, 
    enableSeasonalBadges: true,
    enableCustomBadges: true,

    // New arrival detection
    newArrivalDays: 30, // Products published within 30 days show "NEW"
    
    // Custom badge colors (CSS classes)
    colors: {
      new: "bg-green-500 text-white",
      hot: "bg-orange-500 text-white",
      sale: "bg-red-500 text-white", 
      featured: "bg-blue-500 text-white",
      school: "bg-indigo-500 text-white"
    }
  },

  // 📢 ANNOUNCEMENT BAR
  announcements: [
    {
      text: "🎉 Grand Opening Sale - Up to 50% Off!",
      enabled: true,
      priority: 1,
      link: "/collections/sale"
    },
    {
      text: "✨ Free Delivery on Orders Above PKR 3000",
      enabled: true, 
      priority: 2
    },
    {
      text: "🌟 New Summer Collection Now Available",
      enabled: true,
      priority: 3,
      link: "/collections/summer"
    }
  ],

  // 🎨 THEME SETTINGS
  theme: {
    // Header transparency (true = transparent until hover)
    transparentHeader: true,
    
    // Navigation hover delay (milliseconds)
    hoverDelay: 150,
    
    // Animation speed
    animationSpeed: 300,
    
    // Colors (CSS custom properties)
    colors: {
      primary: "#000000",
      secondary: "#666666", 
      accent: "#ff4444",
      background: "#ffffff"
    }
  },

  // 🔧 TECHNICAL SETTINGS (Advanced)
  advanced: {
    // Auto-sync with Shopify collections
    autoSyncCollections: true,
    
    // Sync frequency (hours)
    syncFrequency: 1,
    
    // Fallback behavior when collections don't exist
    enableFallbacks: true,
    
    // Debug mode (shows extra info in console)
    debugMode: false,
    
    // Cache navigation for performance
    cacheNavigation: true,
    
    // Cache duration (minutes)  
    cacheDuration: 60
  }
};

/**
 * 🚀 HELPER FUNCTIONS FOR EASY ACCESS
 */

export class StoreConfiguration {
  private config = STORE_CONFIG;

  // 📊 Get store info
  getStoreInfo() {
    return this.config.store;
  }

  // 🧭 Get navigation settings
  getNavigationSettings() {
    return this.config.navigation;
  }

  // 🏷️ Get enabled categories
  getEnabledCategories() {
    return Object.entries(this.config.categories)
      .filter(([_, category]) => category.enabled)
      .reduce((acc, [key, category]) => {
        acc[key] = category;
        return acc;
      }, {} as any);
  }

  // 🎯 Get category configuration
  getCategoryConfig(categoryKey: string) {
    return this.config.categories[categoryKey as keyof typeof this.config.categories];
  }

  // 🏷️ Check if badge type is enabled
  isBadgeEnabled(badgeType: string): boolean {
    switch (badgeType) {
      case 'new': return this.config.badges.enableNewBadges;
      case 'sale': return this.config.badges.enableSaleBadges;
      case 'seasonal': return this.config.badges.enableSeasonalBadges;
      default: return this.config.badges.enableCustomBadges;
    }
  }

  // 📢 Get enabled announcements
  getEnabledAnnouncements() {
    return this.config.announcements
      .filter(ann => ann.enabled)
      .sort((a, b) => a.priority - b.priority);
  }

  // 🎨 Get theme settings
  getThemeSettings() {
    return this.config.theme;
  }

  // 🔧 Get technical settings
  getAdvancedSettings() {
    return this.config.advanced;
  }

  // 📅 Check if seasonal item should be shown
  isSeasonalItemAvailable(item: any): boolean {
    if (!item.availableMonths) return true;
    
    const currentMonth = new Date().getMonth() + 1; // 1-12
    return item.availableMonths.includes(currentMonth);
  }

  // 🔄 Update configuration (for dynamic changes)
  updateConfig(path: string, value: any) {
    const keys = path.split('.');
    let current = this.config as any;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  // 💾 Export configuration for backup
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  // 📥 Import configuration from backup
  importConfig(configJson: string) {
    try {
      const importedConfig = JSON.parse(configJson) as Partial<typeof STORE_CONFIG>;
      this.config = { ...this.config, ...importedConfig };
      return true;
    } catch (error) {
      console.error('Invalid configuration JSON:', error);
      return false;
    }
  }
}

// 🌟 EASY-TO-USE INSTANCE
export const storeConfig = new StoreConfiguration();

/**
 * 📚 CONFIGURATION GUIDE
 * 
 * QUICK SETUP EXAMPLES:
 * 
 * 1. ENABLE/DISABLE CATEGORIES:
 * ```typescript
 * STORE_CONFIG.categories.kids.enabled = true; // Show kids section
 * ```
 * 
 * 2. ADD NEW PRODUCT CATEGORY:
 * ```typescript
 * STORE_CONFIG.categories.mens.subcategories.allProducts.items.push({
 *   name: "New Product Type",
 *   shopifyHandle: "mens-new-product-type",
 *   priority: 4
 * });
 * ```
 * 
 * 3. UPDATE SEASONAL AVAILABILITY:
 * ```typescript  
 * STORE_CONFIG.categories.mens.subcategories.seasonal.items[1].enabled = true;
 * ```
 * 
 * 4. CHANGE ANNOUNCEMENT:
 * ```typescript
 * STORE_CONFIG.announcements[0].text = "New Sale Message!";
 * ```
 * 
 * 5. UPDATE BADGE COLORS:
 * ```typescript
 * STORE_CONFIG.badges.colors.new = "bg-purple-500 text-white";
 * ```
 */