/**
 * Shopify Collection Auto-Detection System
 * 
 * This utility automatically detects what collections exist in your Shopify store
 * and updates the navigation accordingly. No manual updates needed!
 */

import type { Storefront } from '@shopify/hydrogen';
import { navigationConfig, type NavigationItem, type CategoryConfig } from './navigation-config';

// GraphQL query to get all available collections
const COLLECTIONS_QUERY = `#graphql
  query GetAllCollections($first: Int!) {
    collections(first: $first) {
      nodes {
        id
        handle
        title
        description
        updatedAt
        productsCount
        metafields(identifiers: [
          {namespace: "custom", key: "category"},
          {namespace: "custom", key: "season"},
          {namespace: "custom", key: "badge"},
          {namespace: "custom", key: "featured"},
          {namespace: "custom", key: "available"}
        ]) {
          key
          value
        }
      }
    }
  }
`;

interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  updatedAt: string;
  productsCount: number;
  metafields: Array<{
    key: string;
    value: string;
  }>;
}

interface CollectionAnalysis {
  availableCategories: string[];
  availableSeasons: string[];
  availableProductTypes: Record<string, string[]>;
  newCollections: string[];
  featuredCollections: string[];
}

export class NavigationManager {
  private storefront: Storefront;
  private collectionsCache: ShopifyCollection[] = [];
  private lastSync: Date | null = null;

  constructor(storefront: Storefront) {
    this.storefront = storefront;
  }

  /**
   * 🔍 Automatically detect available collections from Shopify
   */
  async syncWithShopify(): Promise<CollectionAnalysis> {
    try {
      const { collections } = await this.storefront.query(COLLECTIONS_QUERY, {
        variables: { first: 100 }
      });

      this.collectionsCache = collections.nodes;
      this.lastSync = new Date();

      return this.analyzeCollections();
    } catch (error) {
      console.error('Failed to sync collections with Shopify:', error);
      return this.getDefaultAnalysis();
    }
  }

  /**
   * 📊 Analyze collections to understand what's available
   */
  private analyzeCollections(): CollectionAnalysis {
    const analysis: CollectionAnalysis = {
      availableCategories: [],
      availableSeasons: [],
      availableProductTypes: {},
      newCollections: [],
      featuredCollections: [],
    };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const collection of this.collectionsCache) {
      // Skip empty collections
      if (collection.productsCount === 0) continue;

      // Detect main categories (mens, womens, kids, accessories)
      if (this.isMainCategory(collection.handle)) {
        analysis.availableCategories.push(this.extractCategory(collection.handle));
      }

      // Detect seasons
      const season = this.extractSeason(collection.handle);
      if (season && !analysis.availableSeasons.includes(season)) {
        analysis.availableSeasons.push(season);
      }

      // Detect product types
      const { category, productType } = this.parseCollectionHandle(collection.handle);
      if (category && productType) {
        if (!analysis.availableProductTypes[category]) {
          analysis.availableProductTypes[category] = [];
        }
        if (!analysis.availableProductTypes[category].includes(productType)) {
          analysis.availableProductTypes[category].push(productType);
        }
      }

      // Detect new collections (updated in last 30 days or marked as new)
      const isNew = new Date(collection.updatedAt) > thirtyDaysAgo || 
                   this.hasMetafield(collection, 'badge', 'new');
      if (isNew) {
        analysis.newCollections.push(collection.handle);
      }

      // Detect featured collections
      const isFeatured = this.hasMetafield(collection, 'featured', 'true');
      if (isFeatured) {
        analysis.featuredCollections.push(collection.handle);
      }
    }

    return analysis;
  }

  /**
   * 🔄 Update navigation config based on Shopify analysis
   */
  async updateNavigationFromShopify(): Promise<void> {
    const analysis = await this.syncWithShopify();

    // Update each category's availability
    Object.keys(navigationConfig).forEach(categoryKey => {
      const isAvailable = analysis.availableCategories.includes(categoryKey) ||
                         this.hasProductsInCategory(categoryKey);
      
      navigationConfig[categoryKey].available = isAvailable;

      if (isAvailable) {
        this.updateCategorySubcategories(categoryKey, analysis);
      }
    });
  }

  /**
   * 🎯 Update subcategories for a specific category
   */
  private updateCategorySubcategories(categoryKey: string, analysis: CollectionAnalysis): void {
    const config = navigationConfig[categoryKey];
    const productTypes = analysis.availableProductTypes[categoryKey] || [];

    // Update New Arrivals
    config.subcategories.newArrivals = config.subcategories.newArrivals.map(item => ({
      ...item,
      available: this.isCollectionAvailable(item.to, analysis.newCollections)
    }));

    // Update All Products
    config.subcategories.allProducts = config.subcategories.allProducts.map(item => ({
      ...item,
      available: this.isCollectionAvailable(item.to, this.collectionsCache.map(c => c.handle))
    }));

    // Update Seasonal
    config.subcategories.seasonal = config.subcategories.seasonal.map(item => {
      const season = this.extractSeasonFromUrl(item.to);
      return {
        ...item,
        available: analysis.availableSeasons.includes(season)
      };
    });
  }

  /**
   * 🛠️ Helper Methods
   */
  private isMainCategory(handle: string): boolean {
    return ['mens', 'womens', 'kids', 'accessories'].some(cat => 
      handle.includes(cat) && !handle.includes('-')
    );
  }

  private extractCategory(handle: string): string {
    if (handle.includes('mens')) return 'mens';
    if (handle.includes('womens')) return 'womens';
    if (handle.includes('kids')) return 'kids';
    if (handle.includes('accessories')) return 'accessories';
    return '';
  }

  private extractSeason(handle: string): string {
    if (handle.includes('summer')) return 'summer';
    if (handle.includes('winter')) return 'winter';
    if (handle.includes('spring')) return 'spring';
    if (handle.includes('autumn') || handle.includes('fall')) return 'autumn';
    return '';
  }

  private parseCollectionHandle(handle: string): { category: string; productType: string } {
    // Parse handles like: "mens-kurtas", "womens-summer-lawn", "kids-boys-shirts"
    const parts = handle.split('-');
    const category = parts[0];
    const productType = parts.filter(part => 
      !['new', 'summer', 'winter', 'spring', 'autumn', 'fall'].includes(part)
    ).slice(1).join('-');

    return { category, productType };
  }

  private hasMetafield(collection: ShopifyCollection, key: string, value?: string): boolean {
    const metafield = collection.metafields.find(m => m.key === key);
    return value ? metafield?.value === value : !!metafield;
  }

  private isCollectionAvailable(url: string, availableHandles: string[]): boolean {
    const handle = url.split('/').pop() || '';
    return availableHandles.includes(handle);
  }

  private extractSeasonFromUrl(url: string): string {
    if (url.includes('/summer')) return 'summer';
    if (url.includes('/winter')) return 'winter';
    if (url.includes('/spring')) return 'spring';
    if (url.includes('/autumn')) return 'autumn';
    return '';
  }

  private hasProductsInCategory(category: string): boolean {
    return this.collectionsCache.some(c => 
      c.handle.includes(category) && c.productsCount > 0
    );
  }

  private getDefaultAnalysis(): CollectionAnalysis {
    // Fallback when Shopify sync fails
    return {
      availableCategories: ['mens', 'womens'], // Safe defaults
      availableSeasons: ['summer'],
      availableProductTypes: {
        mens: ['kurtas'],
        womens: ['kurtis']
      },
      newCollections: [],
      featuredCollections: [],
    };
  }

  /**
   * 🎮 Public API Methods
   */

  /**
   * Check if navigation should be updated (call this in loaders)
   */
  shouldUpdateNavigation(): boolean {
    if (!this.lastSync) return true;
    
    const hoursSinceSync = (Date.now() - this.lastSync.getTime()) / (1000 * 60 * 60);
    return hoursSinceSync > 1; // Update every hour
  }

  /**
   * Get current collection statistics
   */
  getCollectionStats(): { total: number; withProducts: number; lastSync: Date | null } {
    return {
      total: this.collectionsCache.length,
      withProducts: this.collectionsCache.filter(c => c.productsCount > 0).length,
      lastSync: this.lastSync,
    };
  }

  /**
   * Get collections by category for debugging
   */
  getCollectionsByCategory(category: string): ShopifyCollection[] {
    return this.collectionsCache.filter(c => c.handle.includes(category));
  }
}

/**
 * 🚀 Easy-to-use helper for route loaders
 */
export async function getUpdatedNavigation(storefront: Storefront) {
  const manager = new NavigationManager(storefront);
  
  if (manager.shouldUpdateNavigation()) {
    await manager.updateNavigationFromShopify();
  }

  return {
    navigationConfig,
    stats: manager.getCollectionStats(),
  };
}