import { Image } from "@shopify/hydrogen";
import { useThemeSettings } from "@weaverse/hydrogen";
import clsx from "clsx";
import { Link } from "~/components/link";
import { useShopMenu } from "~/hooks/use-shop-menu";

interface LogoProps {
  isTransparent?: boolean;
}

export function Logo({ isTransparent = false }: LogoProps) {
  const { shopName } = useShopMenu();
  const { logoData, transparentLogoData, logoWidth } = useThemeSettings();

  return (
    <Link
      to="/"
      prefetch="intent"
      className="z-30 flex h-full w-full items-center justify-center lg:h-fit lg:w-fit"
    >
      <div
        className="relative h-full"
        style={{ width: logoData ? logoWidth : "auto" }}
      >
        {logoData ? (
          <>
            {/* Main Logo (Dark) - Shows when header is solid/not transparent */}
            <Image
              data={logoData}
              sizes="auto"
              className={clsx(
                "main-logo",
                "mx-auto h-full max-w-full object-contain",
                "transition-opacity duration-300 ease-in",
                isTransparent ? "opacity-0" : "opacity-100",
              )}
              width={500}
              style={{ width: "auto" }}
            />
            {transparentLogoData && (
              /* Transparent Logo (Light/White) - Shows when header is transparent */
              <Image
                data={transparentLogoData}
                sizes="auto"
                className={clsx(
                  "transparent-logo",
                  "absolute top-0 left-0 mx-auto h-full max-w-full object-contain",
                  "transition-opacity duration-300 ease-in",
                  isTransparent ? "opacity-100" : "opacity-0",
                )}
                width={500}
                style={{ width: "auto" }}
              />
            )}
          </>
        ) : (
          <div 
            className={clsx(
              "line-clamp-1 font-medium text-lg sm:text-2xl transition-colors duration-300",
              isTransparent ? "text-white" : "text-gray-900"
            )}
          >
            {shopName}
          </div>
        )}
      </div>
    </Link>
  );
}
