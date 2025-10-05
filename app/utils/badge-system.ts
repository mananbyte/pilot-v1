/**
 * Enhanced Flexible Badge System
 * 
 * Automatically detects and displays product badges based on:
 * - Product tags
 * - Product metafields  
 * - Product properties (date, inventory, etc.)
 * - Custom business rules
 * 
 * Works with any tag/metafield structure you create in Shopify!
 */

import type { Product } from '@shopify/hydrogen/storefront-api-types';

export interface BadgeConfig {
  id: string;
  label: string;
  color: string;
  textColor: string;
  priority: number; // Higher = shows first when multiple badges
  icon?: string;
  conditions: BadgeCondition[];
}

export interface BadgeCondition {
  type: 'tag' | 'metafield' | 'date' | 'inventory' | 'price' | 'custom';
  field?: string; // For metafields: "custom.badge", for tags: tag name
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'exists' | 'not_exists';
  value?: string | number | boolean;
  customCheck?: (product: any) => boolean; // For complex logic
}

/**
 * 🎯 Flexible Badge Configuration
 * Easy to customize for your business needs!
 */
export const BADGE_CONFIGS: BadgeConfig[] = [
  // NEW ARRIVAL BADGES
  {
    id: 'new',
    label: 'NEW',
    color: 'bg-green-500',
    textColor: 'text-white',
    priority: 10,
    icon: '✨',
    conditions: [
      { type: 'date', operator: 'greater', value: 30 }, // Published within 30 days
      { type: 'tag', field: 'new', operator: 'exists' }, // OR has "new" tag
      { type: 'metafield', field: 'custom.badge', operator: 'equals', value: 'new' }
    ]
  },

  // HOT/TRENDING BADGES
  {
    id: 'hot',
    label: 'HOT',
    color: 'bg-orange-500',
    textColor: 'text-white', 
    priority: 9,
    icon: '🔥',
    conditions: [
      { type: 'tag', field: 'hot', operator: 'exists' },
      { type: 'tag', field: 'trending', operator: 'exists' },
      { type: 'metafield', field: 'custom.badge', operator: 'equals', value: 'hot' },
      { type: 'metafield', field: 'custom.trending', operator: 'equals', value: 'true' }
    ]
  },

  // SALE BADGES
  {
    id: 'sale',
    label: 'SALE',
    color: 'bg-red-500',
    textColor: 'text-white',
    priority: 8,
    icon: '💥',
    conditions: [
      { type: 'tag', field: 'sale', operator: 'exists' },
      { type: 'tag', field: 'discount', operator: 'exists' },
      { type: 'tag', field: 'clearance', operator: 'exists' },
      { type: 'metafield', field: 'custom.sale', operator: 'equals', value: 'true' },
      { type: 'price', operator: 'less', value: 1 } // Compare price < compareAt price
    ]
  },

  // BEST SELLER BADGES
  {
    id: 'bestseller',
    label: 'BEST SELLER',
    color: 'bg-purple-500',
    textColor: 'text-white',
    priority: 7,
    icon: '⭐',
    conditions: [
      { type: 'tag', field: 'bestseller', operator: 'exists' },
      { type: 'tag', field: 'best-seller', operator: 'exists' },
      { type: 'tag', field: 'popular', operator: 'exists' },
      { type: 'metafield', field: 'custom.best_seller', operator: 'equals', value: 'true' }
    ]
  },

  // FEATURED BADGES
  {
    id: 'featured',
    label: 'FEATURED',
    color: 'bg-blue-500',
    textColor: 'text-white',
    priority: 6,
    icon: '🌟',
    conditions: [
      { type: 'tag', field: 'featured', operator: 'exists' },
      { type: 'metafield', field: 'custom.featured', operator: 'equals', value: 'true' }
    ]
  },

  // LIMITED EDITION BADGES
  {
    id: 'limited',
    label: 'LIMITED',
    color: 'bg-yellow-500',
    textColor: 'text-black',
    priority: 5,
    icon: '⚡',
    conditions: [
      { type: 'tag', field: 'limited', operator: 'exists' },
      { type: 'tag', field: 'limited-edition', operator: 'exists' },
      { type: 'metafield', field: 'custom.limited', operator: 'equals', value: 'true' },
      { type: 'inventory', operator: 'less', value: 10 } // Low stock
    ]
  },

  // SEASONAL BADGES  
  {
    id: 'summer',
    label: 'SUMMER',
    color: 'bg-yellow-400',
    textColor: 'text-black',
    priority: 4,
    icon: '🌞',
    conditions: [
      { type: 'tag', field: 'summer', operator: 'exists' },
      { type: 'metafield', field: 'custom.season', operator: 'equals', value: 'summer' }
    ]
  },

  {
    id: 'winter',
    label: 'WINTER',
    color: 'bg-blue-600',
    textColor: 'text-white',
    priority: 4,
    icon: '❄️',
    conditions: [
      { type: 'tag', field: 'winter', operator: 'exists' },
      { type: 'metafield', field: 'custom.season', operator: 'equals', value: 'winter' }
    ]
  },

  // SCHOOL/KIDS BADGES
  {
    id: 'school',
    label: 'SCHOOL',
    color: 'bg-indigo-500',
    textColor: 'text-white',
    priority: 4,
    icon: '🎒',
    conditions: [
      { type: 'tag', field: 'school', operator: 'exists' },
      { type: 'tag', field: 'uniform', operator: 'exists' },
      { type: 'metafield', field: 'custom.category', operator: 'equals', value: 'school' }
    ]
  },

  // SOLD OUT BADGE
  {
    id: 'soldout',
    label: 'SOLD OUT',
    color: 'bg-gray-500',
    textColor: 'text-white',
    priority: 1,
    conditions: [
      { type: 'inventory', operator: 'equals', value: 0 }
    ]
  },

  // CUSTOM BUSINESS RULE BADGES
  {
    id: 'premium',
    label: 'PREMIUM',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    textColor: 'text-white',
    priority: 3,
    icon: '💎',
    conditions: [
      { type: 'tag', field: 'premium', operator: 'exists' },
      { type: 'price', operator: 'greater', value: 5000 }, // Price > 5000 PKR
      { type: 'metafield', field: 'custom.quality', operator: 'equals', value: 'premium' }
    ]
  }
];

/**
 * 🎯 Badge Detection Engine
 */
export class BadgeDetector {
  private configs: BadgeConfig[];

  constructor(customConfigs: BadgeConfig[] = []) {
    // Merge custom configs with defaults
    this.configs = [...BADGE_CONFIGS, ...customConfigs].sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get all applicable badges for a product
   */
  detectBadges(product: any): BadgeConfig[] {
    const applicableBadges: BadgeConfig[] = [];

    for (const config of this.configs) {
      if (this.matchesConditions(product, config.conditions)) {
        applicableBadges.push(config);
      }
    }

    return applicableBadges;
  }

  /**
   * Get the highest priority badge for a product
   */
  getPrimaryBadge(product: any): BadgeConfig | null {
    const badges = this.detectBadges(product);
    return badges.length > 0 ? badges[0] : null;
  }

  /**
   * Check if product matches all conditions (OR logic between conditions, AND within arrays)
   */
  private matchesConditions(product: any, conditions: BadgeCondition[]): boolean {
    return conditions.some(condition => this.matchesCondition(product, condition));
  }

  /**
   * Check if product matches a single condition
   */
  private matchesCondition(product: any, condition: BadgeCondition): boolean {
    switch (condition.type) {
      case 'tag':
        return this.checkTagCondition(product, condition);
      
      case 'metafield':
        return this.checkMetafieldCondition(product, condition);
      
      case 'date':
        return this.checkDateCondition(product, condition);
      
      case 'inventory':
        return this.checkInventoryCondition(product, condition);
      
      case 'price':
        return this.checkPriceCondition(product, condition);
      
      case 'custom':
        return condition.customCheck ? condition.customCheck(product) : false;
      
      default:
        return false;
    }
  }

  private checkTagCondition(product: any, condition: BadgeCondition): boolean {
    const tags = product.tags || [];
    const tagString = Array.isArray(tags) ? tags.join(' ').toLowerCase() : tags.toLowerCase();
    
    switch (condition.operator) {
      case 'exists':
        return tagString.includes(condition.field?.toLowerCase() || '');
      case 'equals':
        return tags.includes(condition.value);
      case 'contains':
        return tagString.includes(String(condition.value).toLowerCase());
      default:
        return false;
    }
  }

  private checkMetafieldCondition(product: any, condition: BadgeCondition): boolean {
    if (!condition.field) return false;
    
    const [namespace, key] = condition.field.split('.');
    const metafields = product.metafields || [];
    const metafield = metafields.find((m: any) => 
      m.namespace === namespace && m.key === key
    );

    if (!metafield) {
      return condition.operator === 'not_exists';
    }

    switch (condition.operator) {
      case 'exists':
        return true;
      case 'equals':
        return metafield.value === String(condition.value);
      case 'contains':
        return String(metafield.value).toLowerCase().includes(String(condition.value).toLowerCase());
      default:
        return false;
    }
  }

  private checkDateCondition(product: any, condition: BadgeCondition): boolean {
    const publishedAt = new Date(product.publishedAt || product.createdAt);
    const daysAgo = Math.floor((Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (condition.operator) {
      case 'less':
        return daysAgo < (condition.value as number);
      case 'greater':
        return daysAgo < (condition.value as number); // "greater than X days ago" = "less than X days old"
      default:
        return false;
    }
  }

  private checkInventoryCondition(product: any, condition: BadgeCondition): boolean {
    // Check total available inventory across all variants
    const totalInventory = product.variants?.nodes?.reduce((total: number, variant: any) => {
      return total + (variant.quantityAvailable || 0);
    }, 0) || 0;

    switch (condition.operator) {
      case 'equals':
        return totalInventory === condition.value;
      case 'less':
        return totalInventory < (condition.value as number);
      case 'greater':
        return totalInventory > (condition.value as number);
      default:
        return false;
    }
  }

  private checkPriceCondition(product: any, condition: BadgeCondition): boolean {
    const variant = product.variants?.nodes?.[0];
    if (!variant) return false;

    const price = parseFloat(variant.price?.amount || '0');
    const comparePrice = parseFloat(variant.compareAtPrice?.amount || '0');

    switch (condition.operator) {
      case 'less':
        // For sale detection: compare price exists and is higher than current price
        return comparePrice > 0 && price < comparePrice;
      case 'greater':
        return price > (condition.value as number);
      default:
        return false;
    }
  }

  /**
   * Add custom badge configuration
   */
  addCustomBadge(config: BadgeConfig): void {
    this.configs.push(config);
    this.configs.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Update existing badge configuration
   */
  updateBadge(id: string, updates: Partial<BadgeConfig>): void {
    const index = this.configs.findIndex(c => c.id === id);
    if (index >= 0) {
      this.configs[index] = { ...this.configs[index], ...updates };
    }
  }
}

/**
 * 🎨 Badge Rendering Utilities
 */
export function renderBadge(badge: BadgeConfig, className: string = ''): string {
  return `
    <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${badge.color} ${badge.textColor} ${className}">
      ${badge.icon ? badge.icon + ' ' : ''}${badge.label}
    </span>
  `;
}

/**
 * 🚀 Easy-to-use helper functions
 */
export const BadgeSystem = {
  // Create detector with default configs
  create: (customConfigs: BadgeConfig[] = []) => new BadgeDetector(customConfigs),

  // Quick badge detection for single product
  detect: (product: any) => new BadgeDetector().detectBadges(product),

  // Get primary badge only
  primary: (product: any) => new BadgeDetector().getPrimaryBadge(product),

  // Render badge HTML
  render: renderBadge,

  // Quick check for specific badge types
  isNew: (product: any) => new BadgeDetector().detectBadges(product).some(b => b.id === 'new'),
  isOnSale: (product: any) => new BadgeDetector().detectBadges(product).some(b => b.id === 'sale'),
  isBestSeller: (product: any) => new BadgeDetector().detectBadges(product).some(b => b.id === 'bestseller'),

  // Create custom badge configs easily
  createBadge: (id: string, label: string, color: string, conditions: BadgeCondition[]): BadgeConfig => ({
    id,
    label,
    color,
    textColor: 'text-white',
    priority: 5,
    conditions
  })
};