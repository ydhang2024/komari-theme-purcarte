import { type ReactNode, useEffect, useMemo, useState } from "react";
import type { PublicInfo } from "@/types/node.d";
import { ConfigContext } from "./ConfigContext";
import { DEFAULT_CONFIG, type ConfigOptions } from "./default";
import { apiService, getWsService } from "@/services/api";
import Loading from "@/components/loading";

// 配置提供者属性类型
interface ConfigProviderProps {
  children: ReactNode;
}

/**
 * 配置提供者组件，用于将配置传递给子组件
 */
export function ConfigProvider({ children }: ConfigProviderProps) {
  const [publicSettings, setPublicSettings] = useState<PublicInfo | null>(null);
  const [config, setConfig] = useState<ConfigOptions | null>(null);
  const [siteStatus, setSiteStatus] = useState<
    "public" | "private-unauthenticated" | "private-authenticated"
  >("public");
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const { status, publicInfo } = await apiService.checkSiteStatus();
        setSiteStatus(status);
        setPublicSettings(publicInfo);

        let mergedConfig: ConfigOptions;
        if (publicInfo) {
          const themeSettings =
            (publicInfo.theme_settings as ConfigOptions) || {};
          mergedConfig = {
            ...DEFAULT_CONFIG,
            ...themeSettings,
            titleText:
              themeSettings.titleText ||
              publicInfo.sitename ||
              DEFAULT_CONFIG.titleText,
          };
        } else {
          mergedConfig = DEFAULT_CONFIG;
        }
        setConfig(mergedConfig);

        // Initialize RPC
        if (mergedConfig.enableJsonRPC2Api) {
          const versionInfo = await apiService.getVersion();
          if (versionInfo && versionInfo.version) {
            const match = versionInfo.version.match(/(\d+)\.(\d+)\.(\d+)/);
            if (match) {
              const [, major, minor, patch] = match.map(Number);
              if (
                major > 1 ||
                (major === 1 && minor > 0) ||
                (major === 1 && minor === 0 && patch >= 7)
              ) {
                apiService.useRpc = true;
                getWsService().useRpc = true;
                console.log("RPC has been enabled for API and WebSocket.");
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to initialize site:", error);
        setConfig(DEFAULT_CONFIG);
        setSiteStatus("private-unauthenticated");
      } finally {
        setLoading(false);
        setTimeout(() => setIsLoaded(true), 300);
      }
    };

    initialize();
  }, []);

  const dynamicStyles = useMemo(() => {
    if (!config) return "";

    const { backgroundImage, blurValue, blurBackgroundColor } = config;
    const styles: string[] = [];

    if (backgroundImage) {
      styles.push(`--body-background-url: url(${backgroundImage});`);
    }

    if (blurValue) {
      styles.push(`--purcarte-blur: ${blurValue}px;`);
    }

    if (blurBackgroundColor) {
      const colors = blurBackgroundColor
        .split("|")
        .map((color) => color.trim());
      if (colors.length >= 2) {
        styles.push(`--card-light: ${colors[0]};`);
        styles.push(`--card-dark: ${colors[1]};`);
      } else if (colors.length === 1) {
        styles.push(`--card-light: ${colors[0]};`);
        styles.push(`--card-dark: ${colors[0]};`);
      }
    }

    return `:root { ${styles.join(" ")} }`;
  }, [config]);

  if (!isLoaded || !config) {
    return (
      <Loading text="加载配置中..." className={!loading ? "fade-out" : ""} />
    );
  }

  return (
    <ConfigContext.Provider value={{ ...config, publicSettings, siteStatus }}>
      <style>{dynamicStyles}</style>
      <div className="fade-in">{children}</div>
    </ConfigContext.Provider>
  );
}
