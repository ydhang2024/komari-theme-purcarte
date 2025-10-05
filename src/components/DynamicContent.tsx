import { type ReactNode, useCallback, useMemo } from "react";
import { useAppConfig } from "@/config/hooks";
import { useIsMobile } from "@/hooks/useMobile";
import { useTheme } from "@/hooks/useTheme";

export function DynamicContent({ children }: { children: ReactNode }) {
  const config = useAppConfig();
  const isMobile = useIsMobile();
  const { appearance } = useTheme();

  const getUrlFromConfig = useCallback(
    (urls: string) => {
      if (!urls) return "";
      const urlList = urls.split("|").map((u) => u.trim());
      if (urlList.length > 1) {
        return appearance === "dark" ? urlList[1] : urlList[0];
      }
      return urlList[0];
    },
    [appearance]
  );

  const imageUrl = useMemo(() => {
    if (!config) return "";
    const { backgroundImage, backgroundImageMobile } = config;
    return isMobile && backgroundImageMobile
      ? getUrlFromConfig(backgroundImageMobile)
      : getUrlFromConfig(backgroundImage);
  }, [config, isMobile, getUrlFromConfig]);

  const videoUrl = useMemo(() => {
    if (!config || !config.enableVideoBackground) return "";
    const { videoBackgroundUrl, videoBackgroundUrlMobile } = config;
    return isMobile && videoBackgroundUrlMobile
      ? getUrlFromConfig(videoBackgroundUrlMobile)
      : getUrlFromConfig(videoBackgroundUrl);
  }, [config, isMobile, getUrlFromConfig]);

  const dynamicStyles = useMemo(() => {
    if (!config) return "";
    const { mainWidth, blurValue, blurBackgroundColor } = config;
    const styles: string[] = [];

    styles.push(`--main-width: ${mainWidth}vw;`);
    styles.push(`--body-background-url: url(${imageUrl});`);
    styles.push(`--purcarte-blur: ${blurValue}px;`);

    const colors = blurBackgroundColor.split("|").map((color) => color.trim());
    if (colors.length >= 2) {
      styles.push(`--card-light: ${colors[0]};`);
      styles.push(`--card-dark: ${colors[1]};`);
    } else if (colors.length === 1) {
      styles.push(`--card-light: ${colors[0]};`);
      styles.push(`--card-dark: ${colors[0]};`);
    }

    return `:root { ${styles.join(" ")} }`;
  }, [config, imageUrl]);

  return (
    <>
      <style>{dynamicStyles}</style>
      {config.enableVideoBackground && videoUrl && (
        <video
          key={videoUrl}
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="fixed right-0 bottom-0 min-w-full min-h-full w-auto h-auto -z-1 object-cover"
        />
      )}
      <div className="fade-in">{children}</div>
    </>
  );
}
