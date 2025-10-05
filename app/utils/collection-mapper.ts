/**
 * Collection Mapping Utility
 * 
 * Automatically maps any Shopify collection structure to navigation categories.
 * This handles the most common e-commerce collection naming patterns.
 */

interface CollectionMapping {
  pattern: RegExp;
  category: string;
  subcategory: 'newArrivals' | 'allProducts' | 'categories' | 'seasonal';
  metadata: {
    title: string;
    season?: string;
    productType?: string;
    isNew?: boolean;
    badge?: string;
  };
}

interface ParsedCollectionHandle {
  category: string;
  subcategory: 'newArrivals' | 'allProducts' | 'categories' | 'seasonal';
  season?: string;
  productType?: string;
  isNew?: boolean;
  title: string;
  badge?: string;
  originalHandle: string;
}

/**
 * 🎯 Smart Collection Patterns
 * These patterns automatically detect collection types from Shopify handles
 */
export const COLLECTION_PATTERNS: CollectionMapping[] = [
  // NEW ARRIVALS PATTERNS
  {
    pattern: /^(mens|women|womens|kids|children)-new$/,
    category: 'auto',
    subcategory: 'newArrivals',
    metadata: { title: 'Latest Arrivals', isNew: true, badge: 'NEW' }
  },
  {
    pattern: /^(mens|women|womens|kids|children)-new-(.+)$/,
    category: 'auto', 
    subcategory: 'newArrivals',
    metadata: { title: 'Latest {productType}', isNew: true, badge: 'NEW' }
  },
  {
    pattern: /^new-(mens|women|womens|kids|children)$/,
    category: 'auto',
    subcategory: 'newArrivals', 
    metadata: { title: 'New Arrivals', isNew: true, badge: 'NEW' }
  },

  // SEASONAL PATTERNS  
  {
    pattern: /^(mens|women|womens|kids|children)-(summer|winter|spring|autumn|fall)$/,
    category: 'auto',
    subcategory: 'seasonal',
    metadata: { title: '{season} Collection', badge: 'HOT' }
  },
  {
    pattern: /^(summer|winter|spring|autumn|fall)-(mens|women|womens|kids|children)$/,
    category: 'auto',
    subcategory: 'seasonal',
    metadata: { title: '{season} Collection', badge: 'HOT' }
  },
  {
    pattern: /^(mens|women|womens|kids|children)-(summer|winter|spring|autumn|fall)-(.+)$/,
    category: 'auto',
    subcategory: 'seasonal',
    metadata: { title: '{season} {productType}' }
  },

  // PRODUCT TYPE PATTERNS
  {
    pattern: /^(mens|women|womens)-(kurtas?|kurtis?|shirts?|pants?|jeans?|dresses?|suits?|shalwar-kameez|lawn)$/,
    category: 'auto',
    subcategory: 'allProducts',
    metadata: { title: 'All {productType}' }
  },
  {
    pattern: /^(kids|children)-(boys?|girls?|uniforms?|school)$/,
    category: 'auto',
    subcategory: 'allProducts', 
    metadata: { title: 'All {productType}' }
  },

  // CATEGORY PATTERNS
  {
    pattern: /^(mens|women|womens)-(formal|casual|traditional|ethnic|western)$/,
    category: 'auto',
    subcategory: 'categories',
    metadata: { title: '{productType} Wear' }
  },
  {
    pattern: /^(kids|children)-(formal|casual|party|school)$/,
    category: 'auto',
    subcategory: 'categories',
    metadata: { title: '{productType} Wear' }
  },

  // ACCESSORIES PATTERNS
  {
    pattern: /^(bags?|jewelry|jewellery|scarves?|accessories?)$/,
    category: 'accessories',
    subcategory: 'allProducts',
    metadata: { title: '{productType}' }
  },
  {
    pattern: /^accessories-(bags?|jewelry|jewellery|scarves?)$/,
    category: 'accessories',
    subcategory: 'allProducts',
    metadata: { title: '{productType}' }
  },

  // MAIN CATEGORY PATTERNS
  {
    pattern: /^(mens?|men)$/,
    category: 'mens',
    subcategory: 'allProducts',
    metadata: { title: 'All Men\'s Collection', badge: 'FEATURED' }
  },
  {
    pattern: /^(womens?|women|ladies)$/,
    category: 'womens',
    subcategory: 'allProducts', 
    metadata: { title: 'All Women\'s Collection', badge: 'FEATURED' }
  },
  {
    pattern: /^(kids?|children)$/,
    category: 'kids',
    subcategory: 'allProducts',
    metadata: { title: 'All Kids Collection', badge: 'FEATURED' }
  },

  // SPECIAL COLLECTIONS
  {
    pattern: /^(sale|clearance|discount)$/,
    category: 'auto',
    subcategory: 'categories',
    metadata: { title: 'Sale Items', badge: 'SALE' }
  },
  {
    pattern: /^(featured|bestseller|best-seller|popular)$/,
    category: 'auto',
    subcategory: 'categories',
    metadata: { title: 'Featured Products', badge: 'FEATURED' }
  }
];

/**
 * 🔍 Auto-detect category from collection handle
 */
function detectCategory(handle: string): string {
  if (handle.includes('men') && !handle.includes('women')) return 'mens';
  if (handle.includes('women') || handle.includes('ladies')) return 'womens';  
  if (handle.includes('kid') || handle.includes('children')) return 'kids';
  if (handle.includes('accessory') || handle.includes('bag') || handle.includes('jewelry')) return 'accessories';
  return 'mens'; // Default fallback
}

/**
 * 🎨 Parse collection handle into components
 */
export function parseCollectionHandle(handle: string): ParsedCollectionHandle {
  for (const pattern of COLLECTION_PATTERNS) {
    const match = handle.match(pattern.pattern);
    if (match) {
      const category = pattern.category === 'auto' ? detectCategory(handle) : pattern.category;
      
      // Extract components from regex groups
      const components = {
        category,
        subcategory: pattern.subcategory,
        season: match.find(m => ['summer', 'winter', 'spring', 'autumn', 'fall'].includes(m)),
        productType: match.find(m => 
          !['mens', 'women', 'womens', 'kids', 'children', 'new', 'summer', 'winter', 'spring', 'autumn', 'fall'].includes(m)
        ),
        isNew: handle.includes('new') || pattern.metadata.isNew,
      };

      // Generate title with component replacement
      let title = pattern.metadata.title;
      if (components.season) {
        title = title.replace('{season}', components.season.charAt(0).toUpperCase() + components.season.slice(1));
      }
      if (components.productType) {
        title = title.replace('{productType}', 
          components.productType.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
        );
      }

      return {
        ...components,
        title,
        badge: pattern.metadata.badge,
        originalHandle: handle,
      };
    }
  }

  // Fallback for unmatched patterns
  return {
    category: detectCategory(handle),
    subcategory: 'allProducts' as const,
    title: handle.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' '),
    originalHandle: handle,
    season: undefined,
    productType: undefined,
    isNew: false,
    badge: undefined,
  };
}

/**
 * 🚀 Auto-generate navigation from Shopify collections
 */
export function generateNavigationFromCollections(collections: Array<{
  handle: string;
  title: string;
  productsCount: number;
  updatedAt: string;
}>) {
  const generatedNav: Record<string, any> = {
    mens: { available: false, subcategories: { newArrivals: [], allProducts: [], categories: [], seasonal: [] }},
    womens: { available: false, subcategories: { newArrivals: [], allProducts: [], categories: [], seasonal: [] }},
    kids: { available: false, subcategories: { newArrivals: [], allProducts: [], categories: [], seasonal: [] }},
    accessories: { available: false, subcategories: { newArrivals: [], allProducts: [], categories: [], seasonal: [] }},
  };

  // Process each collection
  for (const collection of collections) {
    // Skip empty collections
    if (collection.productsCount === 0) continue;

    const parsed = parseCollectionHandle(collection.handle);
    const category = generatedNav[parsed.category];
    
    if (!category) continue;

    // Mark category as available
    category.available = true;

    // Add to appropriate subcategory
    const navItem: {
      title: string;
      to: string;
      badge?: string;
      available: boolean;
      icon?: string;
    } = {
      title: parsed.title || collection.title,
      to: `/collections/${collection.handle}`,
      badge: parsed.badge,
      available: true,
    };

    // Add season icon for seasonal items
    if (parsed.subcategory === 'seasonal' && parsed.season) {
      const seasonIcons = {
        summer: '🌞',
        winter: '❄️', 
        spring: '🌸',
        autumn: '🍂',
        fall: '🍂'
      };
      navItem.icon = seasonIcons[parsed.season as keyof typeof seasonIcons];
    }

    category.subcategories[parsed.subcategory].push(navItem);
  }

  // Sort items within each subcategory
  Object.values(generatedNav).forEach((category: any) => {
    if (category.available) {
      Object.keys(category.subcategories).forEach(subcat => {
        category.subcategories[subcat].sort((a: any, b: any) => a.title.localeCompare(b.title));
      });
    }
  });

  return generatedNav;
}

/**
 * 🔧 Merge generated navigation with manual config
 */
export function mergeNavigationConfigs(
  manualConfig: Record<string, any>,
  generatedConfig: Record<string, any>
): Record<string, any> {
  const merged = { ...manualConfig };

  Object.keys(generatedConfig).forEach(categoryKey => {
    const generated = generatedConfig[categoryKey];
    const manual = merged[categoryKey];

    if (!manual) {
      // Use generated if no manual config exists
      merged[categoryKey] = generated;
      return;
    }

    // Merge availability (true if either is true)
    manual.available = manual.available || generated.available;

    // Merge subcategories
    Object.keys(generated.subcategories).forEach(subcatKey => {
      const generatedItems = generated.subcategories[subcatKey];
      const manualItems = manual.subcategories[subcatKey] || [];

      // Combine items, preferring manual config for duplicates
      const combinedItems = [...manualItems];
      
      generatedItems.forEach((genItem: any) => {
        const exists = combinedItems.find(item => 
          item.to === genItem.to || item.title === genItem.title
        );
        if (!exists) {
          combinedItems.push(genItem);
        }
      });

      manual.subcategories[subcatKey] = combinedItems;
    });
  });

  return merged;
}

/**
 * 🎯 Easy-to-use helper functions
 */
export const CollectionMapper = {
  /**
   * Parse a single collection handle
   */
  parse: parseCollectionHandle,

  /**
   * Generate navigation from collection list
   */
  generateNavigation: generateNavigationFromCollections,

  /**
   * Merge with existing config
   */
  mergeWithConfig: mergeNavigationConfigs,

  /**
   * Get URL for collection based on components
   */
  buildUrl: (category: string, options: {
    season?: string;
    productType?: string;
    isNew?: boolean;
  } = {}) => {
    let path = `/collections/${category}`;
    
    if (options.isNew) path += '/new';
    if (options.season) path += `/${options.season}`;
    if (options.productType) path += `/${options.productType}`;
    
    return path;
  },

  /**
   * Validate collection structure
   */
  validateCollection: (handle: string): boolean => {
    const parsed = parseCollectionHandle(handle);
    return !!(parsed.category && parsed.title);
  }
};