import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { type RefObject, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";
import Link from "~/components/link";
import { usePredictiveSearch } from "~/hooks/use-predictive-search";
import { cn } from "~/utils/cn";
import { PopularKeywords } from "./popular-keywords";
import { PredictiveSearchResult } from "./predictive-search-result";
import { PredictiveSearchForm } from "./search-form";

export function PredictiveSearchButton() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const params = useParams();

  // biome-ignore lint/correctness/useExhaustiveDependencies: close the dialog when the location changes, aka when the user navigates to a search result page
  useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        asChild
        className="flex h-8 w-8 items-center justify-center focus-visible:outline-hidden hover:bg-gray-100 rounded-full transition-colors"
        title="Search"
      >
        <button type="button" aria-label="Open search">
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-10 bg-black/50 data-[state=open]:animate-fade-in"
          style={{ "--fade-in-duration": "100ms" } as React.CSSProperties}
        />
        <Dialog.Content
          className={cn([
            "fixed inset-x-0 top-0 z-10 bg-(--color-header-bg)",
            "-translate-y-full data-[state=open]:translate-y-0",
            "data-[state=open]:animate-enter-from-top",
            "focus-visible:outline-hidden",
          ])}
          style={
            { "--enter-from-top-duration": "200ms" } as React.CSSProperties
          }
          aria-describedby={undefined}
        >
          <VisuallyHidden.Root asChild>
            <Dialog.Title>Predictive search</Dialog.Title>
          </VisuallyHidden.Root>
          <div className="relative pt-(--topbar-height)">
            <PredictiveSearchForm>
              {({ fetchResults, inputRef }) => (
                <div className="mx-auto w-[560px] max-w-[90vw] py-6 space-y-4">
                  {/* Search Input Field */}
                  <div className="flex items-center gap-3 border border-line-subtle px-3 bg-white rounded-md shadow-sm">
                    <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-gray-500" />
                    <input
                      name="q"
                      type="search"
                      onChange={(e) => fetchResults(e.target.value)}
                      onFocus={(e) => fetchResults(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const query = e.currentTarget.value.trim();
                          if (query) {
                            const locale = params.locale
                              ? `/${params.locale}`
                              : "";
                            window.location.href = `${locale}/search?q=${encodeURIComponent(query)}`;
                          }
                        }
                      }}
                      placeholder="Search products, brands, categories..."
                      ref={inputRef}
                      autoComplete="off"
                      className="h-full w-full py-4 text-gray-900 placeholder-gray-500 bg-transparent focus-visible:outline-hidden"
                    />
                    <button
                      type="submit"
                      className="shrink-0 px-3 py-2 text-white bg-black rounded hover:bg-gray-800 transition-colors"
                      onClick={() => {
                        if (inputRef.current) {
                          const query = inputRef.current.value.trim();
                          if (query) {
                            const locale = params.locale
                              ? `/${params.locale}`
                              : "";
                            window.location.href = `${locale}/search?q=${encodeURIComponent(query)}`;
                          }
                        }
                      }}
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      className="shrink-0 p-1 text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        if (inputRef.current) {
                          inputRef.current.value = "";
                          fetchResults("");
                        }
                      }}
                    >
                      <XIcon className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Popular Keywords Section */}
                  <div className="pt-2 border-t border-line-subtle">
                    <PopularKeywords
                      onKeywordClick={(keyword) => {
                        if (inputRef.current) {
                          inputRef.current.value = keyword;
                          fetchResults(keyword);
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </PredictiveSearchForm>
            <PredictiveSearchResults />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PredictiveSearchResults() {
  const { results, totalResults, searchTerm } = usePredictiveSearch();
  const queries = results?.find(({ type }) => type === "queries");
  const articles = results?.find(({ type }) => type === "articles");
  const products = results?.find(({ type }) => type === "products");

  if (!totalResults) {
    return (
      <div className="absolute top-full z-10 flex w-full items-center justify-center">
        <NoResults searchTerm={searchTerm} />
      </div>
    );
  }
  return (
    <div className="-translate-x-1/2 absolute top-full left-1/2 z-10 flex w-fit items-center justify-center">
      <div className="grid max-h-[80vh] w-screen min-w-[430px] max-w-[720px] grid-cols-1 gap-6 overflow-y-auto bg-(--color-header-bg) p-6 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-8">
          <div className="flex flex-col gap-4 divide-y divide-line">
            <PredictiveSearchResult type="queries" items={queries?.items} />
          </div>
          <div className="flex flex-col gap-4">
            <PredictiveSearchResult type="articles" items={articles?.items} />
          </div>
        </div>
        <div className="space-y-6">
          <PredictiveSearchResult
            type="products"
            items={products?.items?.slice(0, 5)}
          />
          {searchTerm.current && (
            <div>
              <Link
                to={`/search?q=${searchTerm.current}`}
                variant="underline"
                className="flex w-fit items-center gap-2"
              >
                <span>View all results</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NoResults({ searchTerm }: { searchTerm: RefObject<string> }) {
  if (!searchTerm.current) {
    return null;
  }
  return (
    <p className="w-[640px] bg-background p-6 shadow-header">
      No results found for <q>{searchTerm.current}</q>
    </p>
  );
}
