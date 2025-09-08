import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { StatsBar } from "@/components/sections/StatsBar";
import { NodeCard } from "@/components/sections/NodeCard";
import { NodeListHeader } from "@/components/sections/NodeListHeader";
import { NodeListItem } from "@/components/sections/NodeListItem";
import Loading from "@/components/loading";
import type { NodeWithStatus } from "@/types/node";
import { useNodeData } from "@/contexts/NodeDataContext";
import { useLiveData } from "@/contexts/LiveDataContext";
import { useAppConfig } from "@/config";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface HomePageProps {
  viewMode: "grid" | "table";
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const homeStateCache = {
  selectedGroup: "所有",
  scrollPosition: 0,
};

const HomePage: React.FC<HomePageProps> = ({
  viewMode,
  searchTerm,
  setSearchTerm,
}) => {
  const { nodes: staticNodes, loading, getGroups } = useNodeData();
  const { liveData } = useLiveData();
  const [selectedGroup, setSelectedGroup] = useState(
    homeStateCache.selectedGroup
  );
  const {
    enableGroupedBar,
    enableStatsBar,
    enableSwap,
    enableListItemProgressBar,
  } = useAppConfig();
  const [displayOptions, setDisplayOptions] = useState({
    time: true,
    online: true,
    regions: true,
    traffic: true,
    speed: true,
  });

  const combinedNodes = useMemo<NodeWithStatus[]>(() => {
    if (!staticNodes) return [];
    return staticNodes.map((node) => {
      const isOnline = liveData?.online.includes(node.uuid) ?? false;
      const stats = isOnline ? liveData?.data[node.uuid] : undefined;

      return {
        ...node,
        status: isOnline ? "online" : "offline",
        stats: stats,
      };
    });
  }, [staticNodes, liveData]);

  const groups = useMemo(() => ["所有", ...getGroups()], [getGroups]);

  const filteredNodes = useMemo(() => {
    return combinedNodes
      .filter(
        (node: NodeWithStatus) =>
          selectedGroup === "所有" || node.group === selectedGroup
      )
      .filter((node: NodeWithStatus) =>
        node.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [combinedNodes, selectedGroup, searchTerm]);

  const stats = useMemo(() => {
    return {
      onlineCount: filteredNodes.filter((n) => n.status === "online").length,
      totalCount: filteredNodes.length,
      uniqueRegions: new Set(filteredNodes.map((n) => n.region)).size,
      totalTrafficUp: filteredNodes.reduce(
        (acc, node) => acc + (node.stats?.network.totalUp || 0),
        0
      ),
      totalTrafficDown: filteredNodes.reduce(
        (acc, node) => acc + (node.stats?.network.totalDown || 0),
        0
      ),
      currentSpeedUp: filteredNodes.reduce(
        (acc, node) => acc + (node.stats?.network.up || 0),
        0
      ),
      currentSpeedDown: filteredNodes.reduce(
        (acc, node) => acc + (node.stats?.network.down || 0),
        0
      ),
    };
  }, [filteredNodes]);

  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef.current) {
        homeStateCache.scrollPosition = mainContentRef.current.scrollTop;
      }
    };

    const mainContentElement = mainContentRef.current;
    mainContentElement?.addEventListener("scroll", handleScroll);

    return () => {
      mainContentElement?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = homeStateCache.scrollPosition;
    }
  }, [loading]);

  useEffect(() => {
    homeStateCache.selectedGroup = selectedGroup;
  }, [selectedGroup]);

  return (
    <div
      ref={mainContentRef}
      className="w-[90%] max-w-screen-2xl mx-auto flex-1 flex flex-col pb-10 overflow-y-auto">
      {enableStatsBar && (
        <StatsBar
          displayOptions={displayOptions}
          setDisplayOptions={setDisplayOptions}
          stats={stats}
          loading={loading}
        />
      )}

      <main className="flex-1 px-4 pb-4">
        {enableGroupedBar && (
          <div className="flex purcarte-blur theme-card-style overflow-auto whitespace-nowrap overflow-x-auto items-center min-w-[300px] text-secondary-foreground space-x-4 px-4 mb-4">
            <span>分组</span>
            {groups.map((group: string) => (
              <Button
                key={group}
                variant={selectedGroup === group ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedGroup(group)}>
                {group}
              </Button>
            ))}
          </div>
        )}

        <div className="space-y-4 mt-4">
          {loading ? (
            <Loading text="正在努力获取数据中..." />
          ) : filteredNodes.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? ""
                  : "space-y-2 overflow-auto purcarte-blur theme-card-style p-2"
              }>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4"
                    : "min-w-[1080px]"
                }>
                {viewMode === "table" && (
                  <NodeListHeader enableSwap={enableSwap} />
                )}
                {filteredNodes.map((node: NodeWithStatus) =>
                  viewMode === "grid" ? (
                    <NodeCard
                      key={node.uuid}
                      node={node}
                      enableSwap={enableSwap}
                    />
                  ) : (
                    <NodeListItem
                      key={node.uuid}
                      node={node}
                      enableSwap={enableSwap}
                      enableListItemProgressBar={enableListItemProgressBar}
                    />
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-grow items-center justify-center">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    Not Found
                  </CardTitle>
                  <CardDescription>请尝试更改筛选条件</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={() => setSearchTerm("")} className="w-full">
                    清空搜索
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
