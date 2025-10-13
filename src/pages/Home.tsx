import {} from "react";
import { Button } from "@/components/ui/button";
import { StatsBar } from "@/components/sections/StatsBar";
import { NodeGridContainer } from "@/components/sections/NodeGrid";
import { NodeTable } from "@/components/sections/NodeTable";
import Loading from "@/components/loading";
import type { NodeData } from "@/types/node";
import { useNodeData } from "@/contexts/NodeDataContext";
import { useAppConfig } from "@/config";
import { useTheme } from "@/hooks/useTheme";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useIsMobile } from "@/hooks/useMobile";

interface HomePageProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredNodes: (NodeData & { stats?: any })[];
  selectedGroup: string;
  setSelectedGroup: (group: string) => void;
  stats: any;
  groups: string[];
}

const HomePage: React.FC<HomePageProps> = ({
  searchTerm,
  setSearchTerm,
  filteredNodes,
  selectedGroup,
  setSelectedGroup,
  stats,
  groups,
}) => {
  const { viewMode, statusCardsVisibility, setStatusCardsVisibility } =
    useTheme();
  const { loading, error, refreshNodes } = useNodeData();
  const {
    enableGroupedBar,
    enableStatsBar,
    enableSwap,
    enableListItemProgressBar,
    selectTrafficProgressStyle,
    isShowStatsInHeader,
    mergeGroupsWithStats,
  } = useAppConfig();

  const isMobile = useIsMobile();

  const hasSearchTerm = searchTerm.trim().length > 0;

  if (loading) {
    return <Loading text="正在努力获取数据中..." />;
  }

  return (
    <div className="fade-in">
      {enableStatsBar && (!isShowStatsInHeader || isMobile) && (
        <StatsBar
          displayOptions={statusCardsVisibility}
          setDisplayOptions={setStatusCardsVisibility}
          stats={stats}
          loading={loading}
          isShowStatsInHeader={isShowStatsInHeader}
          enableGroupedBar={enableGroupedBar}
          groups={groups}
          selectedGroup={selectedGroup}
          onSelectGroup={setSelectedGroup}
        />
      )}

      {enableGroupedBar && !mergeGroupsWithStats && (
        <div className="flex purcarte-blur theme-card-style overflow-auto whitespace-nowrap overflow-x-auto items-center min-w-[300px] text-primary space-x-4 px-4 my-4">
          <span>分组</span>
          {groups?.map((group: string) => (
            <Button
              key={group}
              variant={selectedGroup === group ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedGroup?.(group)}>
              {group}
            </Button>
          ))}
        </div>
      )}

      <div className="space-y-4 my-4">
        {filteredNodes.length > 0 ? (
          viewMode === "grid" ? (
            <NodeGridContainer
              nodes={filteredNodes}
              enableSwap={enableSwap}
              selectTrafficProgressStyle={selectTrafficProgressStyle}
            />
          ) : (
            <ScrollArea
              className="purcarte-blur theme-card-style w-full"
              viewportProps={{ className: "p-2" }}
              showHorizontalScrollbar>
              <div className="min-w-[1080px]">
                {viewMode === "table" && (
                  <NodeTable
                    nodes={filteredNodes}
                    enableSwap={enableSwap}
                    enableListItemProgressBar={enableListItemProgressBar}
                    selectTrafficProgressStyle={selectTrafficProgressStyle}
                  />
                )}
              </div>
            </ScrollArea>
          )
        ) : (
          <div className="flex flex-grow items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  {hasSearchTerm
                    ? "Not Found"
                    : error
                    ? "获取节点数据失败"
                    : "暂无节点数据"}
                </CardTitle>
                <CardDescription>
                  {hasSearchTerm
                    ? "请尝试更改筛选条件"
                    : error
                    ? "获取节点数据失败，请重试"
                    : "请先通过管理端添加节点"}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                {hasSearchTerm ? (
                  <Button onClick={() => setSearchTerm("")} className="w-full">
                    清空搜索
                  </Button>
                ) : error ? (
                  <Button
                    onClick={() => void refreshNodes()}
                    className="w-full">
                    重试
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      window.open("/admin", "_blank", "noopener,noreferrer")
                    }
                    className="w-full">
                    添加节点
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
