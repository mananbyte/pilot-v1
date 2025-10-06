/**
 * Smart Fallback Collection Route
 * 
 * This route handles ANY collection URL pattern and automatically:
 * 1. Tries to find the exact Shopify collection
 * 2. Falls back to filtered results if collection doesn't exist
 * 3. Provides intelligent redirects and suggestions
 * 4. Works with your dynamic navigation system
 */

import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { useLoaderData } from "react-router";
import type { Storefront } from "@shopify/hydrogen";
import { navigationConfig, getCategoryNavigation, getAvailableItems } from "~/utils/navigation-config";

// Enhanced collection query with fallback support
const SMART_COLLECTION_QUERY = `#graphql
  query SmartCollection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      seo {
        description
        title
      }
      image {
        id
        url
        altText
        width
        height
      }
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        nodes {
          ...ProductCard
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
`;

// Fallback query when specific collection doesn't exist
const FILTERED_PRODUCTS_QUERY = `#graphql
  query FilteredProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $filters: [ProductFilter!]
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first,
      filters: $filters,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        endCursor
        startCursor
      }
    }
  }
`;

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const { storefront } = context;
  const url = new URL(request.url);
  
  // Parse the collection path
  const collectionPath = parseCollectionPath(params);
  const searchParams = parseSearchParams(url);

  try {
    // First, try to get the exact collection
    const collection = await tryExactCollection(storefront, collectionPath.handle, searchParams);
    
    if (collection?.collection) {
      return {
        collection: collection.collection,
        analytics: {
          pageType: 'collection',
          collectionHandle: collectionPath.handle,
          resourceId: collection.collection.id,
        },
        appliedFilters: searchParams.filters,
        fallbackUsed: false,
      };
    }

    // If collection doesn't exist, use intelligent fallback
    const fallbackResult = await createIntelligentFallback(
      storefront, 
      collectionPath, 
      searchParams
    );

    return {
      collection: fallbackResult.collection,
      analytics: fallbackResult.analytics,
      appliedFilters: fallbackResult.filters,
      fallbackUsed: true,
      fallbackMessage: fallbackResult.message,
      suggestedCollections: fallbackResult.suggestions,
    };

  } catch (error) {
    console.error('Collection loader error:', error);
    throw new Response('Collection not found', { status: 404 });
  }
}

/**
 * Parse collection path from URL params
 */
function parseCollectionPath(params: any): {
  handle: string;
  category?: string;
  season?: string;
  productType?: string;
  isNew?: boolean;
} {
  // Handle different URL patterns:
  // /collections/category/season/product
  // /collections/category/new/product  
  // /collections/category/product
  // /collections/category

  const segments = Object.values(params).filter(Boolean) as string[];
  
  if (segments.length === 1) {
    // Simple collection: /collections/category
    return { handle: segments[0], category: segments[0] };
  }

  if (segments.length === 2) {
    const [category, second] = segments;
    
    if (second === 'new') {
      // New arrivals: /collections/category/new  
      return { 
        handle: `${category}-new`,
        category,
        isNew: true
      };
    }
    
    // Category + product type: /collections/category/product
    return {
      handle: `${category}-${second}`,
      category,
      productType: second
    };
  }

  if (segments.length === 3) {
    const [category, second, third] = segments;
    
    if (second === 'new') {
      // New product type: /collections/category/new/product
      return {
        handle: `${category}-new-${third}`,
        category,
        productType: third,
        isNew: true
      };
    }
    
    // Category + season + product: /collections/category/season/product
    return {
      handle: `${category}-${second}-${third}`,
      category,
      season: second,
      productType: third
    };
  }

  // Default fallback
  return { handle: segments.join('-') };
}

/**
 * Parse search parameters for filtering and sorting
 */
function parseSearchParams(url: URL) {
  const sortKey = url.searchParams.get('sort_by') || 'COLLECTION_DEFAULT';
  const reverse = sortKey === 'PRICE_DESC' || sortKey === 'CREATED_DESC';
  
  const filters: any[] = [];
  
  // Parse filter parameters
  url.searchParams.forEach((value, key) => {
    if (key.startsWith('filter.')) {
      const filterType = key.replace('filter.', '');
      filters.push({
        [filterType]: value.split(',')
      });
    }
  });

  return {
    sortKey: sortKey.replace('_DESC', '').replace('_ASC', ''),
    reverse,
    filters,
    page: parseInt(url.searchParams.get('page') || '1'),
  };
}

/**
 * Try to get exact collection from Shopify
 */
async function tryExactCollection(
  storefront: Storefront, 
  handle: string, 
  searchParams: any
) {
  try {
    return await storefront.query(SMART_COLLECTION_QUERY, {
      variables: {
        handle,
        first: 20,
        sortKey: searchParams.sortKey,
        reverse: searchParams.reverse,
      },
    });
  } catch {
    return null;
  }
}

/**
 * Create intelligent fallback when collection doesn't exist
 */
async function createIntelligentFallback(
  storefront: Storefront,
  collectionPath: any,
  searchParams: any
) {
  const { category, season, productType, isNew } = collectionPath;
  
  // Build smart filters based on the requested path
  const smartFilters: any[] = [...searchParams.filters];
  
  if (category) {
    smartFilters.push({ tag: category });
  }
  
  if (season) {
    smartFilters.push({ tag: season });
  }
  
  if (productType) {
    smartFilters.push({ product_type: productType });
  }
  
  if (isNew) {
    // Show products from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    smartFilters.push({ 
      created_at: `>=${thirtyDaysAgo.toISOString()}` 
    });
  }

  // Get filtered products
  const result = await storefront.query(FILTERED_PRODUCTS_QUERY, {
    variables: {
      first: 20,
      filters: smartFilters,
      sortKey: searchParams.sortKey || 'CREATED',
      reverse: isNew ? true : searchParams.reverse,
    },
  });

  // Create virtual collection object
  const virtualCollection = {
    id: `virtual-${collectionPath.handle}`,
    handle: collectionPath.handle,
    title: generateCollectionTitle(collectionPath),
    description: generateCollectionDescription(collectionPath),
    products: result.products,
    seo: {
      title: generateCollectionTitle(collectionPath),
      description: generateCollectionDescription(collectionPath),
    },
  };

  return {
    collection: virtualCollection,
    analytics: {
      pageType: 'collection',
      collectionHandle: collectionPath.handle,
      resourceId: virtualCollection.id,
    },
    filters: smartFilters,
    message: generateFallbackMessage(collectionPath),
    suggestions: generateSuggestions(category),
  };
}

/**
 * Generate user-friendly collection title
 */
function generateCollectionTitle(path: any): string {
  const { category, season, productType, isNew } = path;
  
  let title = '';
  
  if (category) {
    const config = getCategoryNavigation(category);
    title += config?.displayName || category.toUpperCase();
  }
  
  if (isNew) {
    title += ' New Arrivals';
  }
  
  if (season) {
    title += ` ${season.charAt(0).toUpperCase() + season.slice(1)}`;
  }
  
  if (productType) {
    title += ` ${productType.charAt(0).toUpperCase() + productType.slice(1)}`;
  }
  
  return title || 'Products';
}

/**
 * Generate collection description
 */
function generateCollectionDescription(path: any): string {
  const { category, season, productType, isNew } = path;
  
  let desc = `Discover our collection of `;
  
  if (isNew) desc += 'latest ';
  if (season) desc += `${season} `;
  if (productType) desc += `${productType} `;
  if (category) desc += `for ${category}`;
  
  return desc;
}

/**
 * Generate fallback message for users
 */
function generateFallbackMessage(path: any): string {
  return `We're showing you ${path.isNew ? 'new' : 'all'} products matching your search. 
          Our collections are being updated regularly with new arrivals!`;
}

/**
 * Generate collection suggestions
 */
function generateSuggestions(category?: string) {
  if (!category) return [];
  
  const config = getCategoryNavigation(category);
  if (!config) return [];
  
  return getAvailableItems(config.subcategories.allProducts)
    .slice(0, 3)
    .map(item => ({
      title: item.title,
      to: item.to,
      badge: item.badge,
    }));
}