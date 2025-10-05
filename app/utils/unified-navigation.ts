/**
 * Unified Navigation System
 * 
 * This resolves the conflict between static config and dynamic detection by:
 * 1. Using navigation-config as a template/fallback
 * 2. Using navigation-manager to get real Shopify data  
 * 3. Merging both intelligently for the best user experience
 */

import type { Storefront } from '@shopify/hydrogen';
import { navigationTemplate, type CategoryConfig, type NavigationItem } from './navigation-config';
import { NavigationManager } from './navigation-manager';
import { CollectionMapper, generateNavigationFromCollections } from './collection-mapper';

export interface UnifiedNavigationResult {
  categories: Record<string, CategoryConfig>;
  stats: {
    totalCollections: number;
    withProducts: number;
    lastSync: Date | null;
    source: 'shopify' | 'template' | 'merged';
  };
  debug?: {
    shopifyCollections: string[];
    templateCategories: string[];
    conflicts: string[];
  };
}

export class UnifiedNavigationSystem {
  private navigationManager: NavigationManager;
  private lastResult: UnifiedNavigationResult | null = null;
  private cacheExpiry: Date | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(storefront: Storefront) {
    this.navigationManager = new NavigationManager(storefront);
  }

  /**
   * 🎯 Get unified navigation data (main entry point)
   */
  async getNavigation(options: {
    forceRefresh?: boolean;
    debugMode?: boolean;
  } = {}): Promise<UnifiedNavigationResult> {
    
    // Return cached result if still valid
    if (!options.forceRefresh && this.isCacheValid()) {
      return this.lastResult!;
    }

    try {
      // Get Shopify data
      const shopifyAnalysis = await this.navigationManager.syncWithShopify();
      const shopifyStats = this.navigationManager.getCollectionStats();

      // Merge with template
      const mergedNavigation = this.mergeNavigationSources(shopifyAnalysis);

      const result: UnifiedNavigationResult = {
        categories: mergedNavigation.categories as Record<string, CategoryConfig>,
        stats: {
          totalCollections: shopifyStats.total,
          withProducts: shopifyStats.withProducts,
          lastSync: shopifyStats.lastSync,
          source: mergedNavigation.source
        },
        ...(options.debugMode && {
          debug: mergedNavigation.debug
        })
      };

      // Cache the result
      this.lastResult = result;
      this.cacheExpiry = new Date(Date.now() + this.CACHE_DURATION);

      return result;

    } catch (error) {
      console.error('Failed to get unified navigation:', error);
      
      // Fallback to template only
      return this.getTemplateNavigation();
    }
  }

  /**
   * 🔄 Pure Shopify Mode - Only show real collections, no template fallbacks
   * Perfect for development - see exactly what your store offers!
   */
  private mergeNavigationSources(shopifyAnalysis: any) {
    const debug = {
      shopifyCollections: shopifyAnalysis.availableCategories,
      templateCategories: Object.keys(navigationTemplate).filter(key => navigationTemplate[key].available),
      conflicts: [] as string[]
    };

    // Start with empty categories - Pure Shopify mode
    const mergedCategories: Record<string, CategoryConfig> = {};

    // Build navigation ONLY from real Shopify data
    shopifyAnalysis.availableCategories.forEach((categoryKey: string) => {
      const templateCategory = navigationTemplate[categoryKey];
      const shopifyProductTypes = shopifyAnalysis.availableProductTypes[categoryKey] || [];

      // Only create category if it exists in Shopify
      mergedCategories[categoryKey] = {
        available: true,
        displayName: templateCategory?.displayName || categoryKey.toUpperCase(),
        subcategories: {
          newArrivals: [],
          allProducts: [],
          categories: [],
          seasonal: []
        }
      };

      const category = mergedCategories[categoryKey];

      // Add main category link
      category.subcategories.allProducts.push({
        title: `All ${category.displayName}`,
        to: `/collections/${categoryKey}`,
        badge: "FEATURED",
        available: true
      });

      // Add detected product types from Shopify
      shopifyProductTypes.forEach((productType: string) => {
        category.subcategories.allProducts.push({
          title: `All ${this.formatProductType(productType)}`,
          to: `/collections/${categoryKey}/${productType}`,
          available: true
        });
      });

      // Add new arrivals if detected
      if (shopifyAnalysis.newCollections.some((handle: string) => handle.startsWith(categoryKey))) {
        category.subcategories.newArrivals.push({
          title: `New ${category.displayName}`,
          to: `/collections/${categoryKey}/new`,
          badge: "NEW",
          available: true
        });

        // Add new product types
        shopifyProductTypes.forEach((productType: string) => {
          category.subcategories.newArrivals.push({
            title: `New ${this.formatProductType(productType)}`,
            to: `/collections/${categoryKey}/new/${productType}`,
            badge: "NEW",
            available: true
          });
        });
      }

      // Add seasonal collections if detected
      shopifyAnalysis.availableSeasons.forEach((season: string) => {
        const seasonEmoji = season === 'summer' ? '🌞' : season === 'winter' ? '❄️' : '🌸';
        category.subcategories.seasonal.push({
          title: `${season.charAt(0).toUpperCase() + season.slice(1)} Collection`,
          to: `/collections/${categoryKey}/${season}`,
          icon: seasonEmoji,
          available: true
        });
      });
    });

    // Determine source - Pure Shopify mode
    const source: 'shopify' | 'template' | 'merged' = 
      shopifyAnalysis.availableCategories.length > 0 ? 'shopify' : 'template';

    return {
      categories: mergedCategories,
      source,
      debug
    };
  }

  /**
   * 📋 Get empty navigation when no Shopify collections exist (Pure mode)
   * Shows helpful message to add collections instead of fake template data
   */
  private getTemplateNavigation(): UnifiedNavigationResult {
    return {
      categories: {}, // Empty - no fake data shown
      stats: {
        totalCollections: 0,
        withProducts: 0,
        lastSync: null,
        source: 'template'
      }
    };
  }

  /**
   * ⚡ Quick methods for common use cases
   */

  /**
   * Get navigation for header component
   */
  async getHeaderNavigation(): Promise<Record<string, CategoryConfig>> {
    const result = await this.getNavigation();
    return Object.fromEntries(
      Object.entries(result.categories).filter(([_, category]) => category.available)
    );
  }

  /**
   * Get navigation with debug info
   */
  async getDebugNavigation(): Promise<UnifiedNavigationResult> {
    return this.getNavigation({ debugMode: true, forceRefresh: true });
  }

  /**
   * Force refresh navigation data
   */
  async refreshNavigation(): Promise<UnifiedNavigationResult> {
    return this.getNavigation({ forceRefresh: true });
  }

  /**
   * Check if specific category should be shown
   */
  async isCategoryAvailable(categoryKey: string): Promise<boolean> {
    const navigation = await this.getNavigation();
    return navigation.categories[categoryKey]?.available || false;
  }

  /**
   * Get subcategories for specific category
   */
  async getCategorySubcategories(categoryKey: string): Promise<CategoryConfig['subcategories'] | null> {
    const navigation = await this.getNavigation();
    const category = navigation.categories[categoryKey];
    return category?.available ? category.subcategories : null;
  }

  /**
   * 🛠️ Helper methods
   */
  private isCacheValid(): boolean {
    return this.lastResult !== null && 
           this.cacheExpiry !== null && 
           new Date() < this.cacheExpiry;
  }

  private formatProductType(productType: string): string {
    return productType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private extractSeasonFromUrl(url: string): string {
    const seasons = ['summer', 'winter', 'spring', 'autumn', 'fall'];
    return seasons.find(season => url.includes(season)) || '';
  }

  /**
   * 📊 Get system status
   */
  async getSystemStatus(): Promise<{
    healthy: boolean;
    shopifyConnected: boolean;
    templateLoaded: boolean;
    cacheValid: boolean;
    lastUpdate: Date | null;
  }> {
    try {
      const stats = this.navigationManager.getCollectionStats();
      
      return {
        healthy: true,
        shopifyConnected: stats.total > 0,
        templateLoaded: Object.keys(navigationTemplate).length > 0,
        cacheValid: this.isCacheValid(),
        lastUpdate: stats.lastSync
      };
    } catch {
      return {
        healthy: false,
        shopifyConnected: false,
        templateLoaded: Object.keys(navigationTemplate).length > 0,
        cacheValid: false,
        lastUpdate: null
      };
    }
  }
}

/**
 * 🚀 Easy-to-use factory function
 */
export async function createUnifiedNavigation(storefront: Storefront): Promise<UnifiedNavigationSystem> {
  return new UnifiedNavigationSystem(storefront);
}

/**
 * 🎯 Simple helper for route loaders
 */
export async function getNavigationForRoute(
  storefront: Storefront, 
  options: { debugMode?: boolean } = {}
): Promise<UnifiedNavigationResult> {
  const system = new UnifiedNavigationSystem(storefront);
  return system.getNavigation(options);
}