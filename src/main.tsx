import { StrictMode, useEffect, useRef, useState, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "./index.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Header } from "@/components/sections/Header";
import { ConfigProvider, useAppConfig } from "@/config";
import { DynamicContent } from "@/components/DynamicContent";
import { useThemeManager, useTheme } from "@/hooks/useTheme";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NodeDataProvider } from "@/contexts/NodeDataContext";
import { LiveDataProvider } from "@/contexts/LiveDataContext";
import Footer from "@/components/sections/Footer";
import Loading from "./components/loading";
import type { StatsBarProps } from "./components/sections/StatsBar";
import { useNodeListCommons } from "@/hooks/useNodeCommons";
const HomePage = lazy(() => import("@/pages/Home"));
const InstancePage = lazy(() => import("@/pages/instance"));
const NotFoundPage = lazy(() => import("@/pages/NotFound"));
const PrivatePage = lazy(() => import("@/pages/Private"));

const homeScrollState = {
  position: 0,
};

// 内部应用组件，在 ConfigProvider 内部使用配置
export const AppContent = () => {
  const { siteStatus } = useAppConfig();
  const { appearance, color, statusCardsVisibility, setStatusCardsVisibility } =
    useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const {
    loading,
    groups,
    filteredNodes,
    stats,
    selectedGroup,
    setSelectedGroup,
  } = useNodeListCommons(searchTerm);
  const { enableGroupedBar } = useAppConfig();

  const statsBarProps: StatsBarProps = {
    displayOptions: statusCardsVisibility,
    setDisplayOptions: setStatusCardsVisibility,
    stats,
    loading,
    enableGroupedBar,
    groups,
    selectedGroup,
    onSelectGroup: setSelectedGroup,
  };
  const homeViewportRef = useRef<HTMLDivElement | null>(null);
  const instanceViewportRef = useRef<HTMLDivElement | null>(null);

  const handleHomeScroll = () => {
    const viewport = homeViewportRef.current;
    if (!viewport) return;
    homeScrollState.position = viewport.scrollTop;
  };

  useEffect(() => {
    if (location.pathname !== "/") return;
    const viewport = homeViewportRef.current;
    if (viewport) {
      viewport.scrollTop = homeScrollState.position;
      return;
    }

    const frame = requestAnimationFrame(() => {
      const nextViewport = homeViewportRef.current;
      if (nextViewport) {
        nextViewport.scrollTop = homeScrollState.position;
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);

  useEffect(() => {
    if (!location.pathname.startsWith("/instance")) return;

    const frame = requestAnimationFrame(() => {
      instanceViewportRef.current?.scrollTo({ top: 0 });
    });

    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);

  return (
    <Theme
      appearance={appearance}
      accentColor={color}
      scaling="110%"
      style={{ backgroundColor: "transparent" }}>
      <DynamicContent>
        <div className="flex flex-col text-sm h-dvh">
          <Header
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            {...statsBarProps}
          />
          <div className="flex-1 min-h-0">
            <Suspense fallback={<Loading />}>
              {siteStatus === "private-unauthenticated" ? (
                <PrivatePage />
              ) : (
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ScrollArea
                        className="h-full"
                        viewportRef={homeViewportRef}
                        viewportProps={{ onScroll: handleHomeScroll }}>
                        <main className="w-(--main-width) max-w-screen-2xl h-full mx-auto flex-1">
                          <HomePage
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            filteredNodes={filteredNodes}
                            selectedGroup={selectedGroup}
                            setSelectedGroup={setSelectedGroup}
                            stats={stats}
                            groups={groups}
                          />
                        </main>
                      </ScrollArea>
                    }
                  />
                  <Route
                    path="/instance/:uuid"
                    element={
                      <ScrollArea
                        className="h-full"
                        viewportRef={instanceViewportRef}>
                        <main className="w-(--main-width) max-w-screen-2xl h-full mx-auto flex-1">
                          <InstancePage />
                        </main>
                      </ScrollArea>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <ScrollArea className="h-full">
                        <main className="w-(--main-width) max-w-screen-2xl h-full mx-auto flex-1">
                          <NotFoundPage />
                        </main>
                      </ScrollArea>
                    }
                  />
                </Routes>
              )}
            </Suspense>
          </div>
          <Footer />
        </div>
      </DynamicContent>
    </Theme>
  );
};

const AppProviders = ({
  siteStatus,
  children,
}: {
  siteStatus: "public" | "private-unauthenticated" | "private-authenticated";
  children: React.ReactNode;
}) => {
  if (siteStatus === "private-unauthenticated") {
    return <>{children}</>;
  }
  return (
    <NodeDataProvider>
      <LiveDataProvider>{children}</LiveDataProvider>
    </NodeDataProvider>
  );
};

const App = () => {
  const themeManager = useThemeManager();
  const { siteStatus } = useAppConfig();

  return (
    <ThemeProvider value={themeManager}>
      <AppProviders siteStatus={siteStatus}>
        <AppContent />
      </AppProviders>
    </ThemeProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider>
      <Router>
        <App />
      </Router>
    </ConfigProvider>
  </StrictMode>
);
