import { useThemeSettings } from "@weaverse/hydrogen";

export function PopularKeywords({
  onKeywordClick,
}: {
  onKeywordClick: (keyword: string) => void;
}) {
  const { popularSearchKeywords } = useThemeSettings();
  if (!popularSearchKeywords?.length) {
    return null;
  }

  const popularKeywords: string[] = popularSearchKeywords
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  return (
    <div className="space-y-2">
      <span className="text-sm text-gray-600">Popular searches:</span>
      <div className="flex flex-wrap gap-2">
        {popularKeywords.map((keyword) => (
          <button
            key={keyword}
            type="button"
            onClick={() => onKeywordClick(keyword)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors focus-visible:outline-hidden"
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  );
}
