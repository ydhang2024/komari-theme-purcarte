import { useEffect, useMemo, useState } from "react";
import { cn, formatBytes } from "@/utils";
import { useAppConfig } from "@/config";
import { useIsMobile } from "@/hooks/useMobile";
import { CurrentTimeChip, StatChip } from "./StatChips";
import { GroupSelector } from "./GroupSelector";
import { SortToggleMenu } from "./SortToggleMenu";
import { StatsToggleMenu } from "./StatsToggleMenu";
import type { StatsBarProps, SortKey } from "./types";
export type { StatsBarProps };

interface StatEntry {
  key: string;
  label: string;
  lines: string[];
  isLabelVertical?: boolean;
  textLeft?: boolean;
}

export const StatsBar = (props: StatsBarProps) => {
  const {
    displayOptions,
    setDisplayOptions,
    stats,
    loading,
    groups,
    selectedGroup,
    onSelectGroup,
    onSort: onSortProp,
    sortKey: sortKeyProp,
    sortDirection: sortDirectionProp,
  } = props;

  const [sortState, setSortState] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  }>({
    key: sortKeyProp ?? null,
    direction: sortDirectionProp ?? "desc",
  });

  useEffect(() => {
    setSortState({
      key: sortKeyProp ?? null,
      direction: sortDirectionProp ?? "desc",
    });
  }, [sortKeyProp, sortDirectionProp]);

  const { key: sortKey, direction: sortDirection } = sortState;

  const handleSort = (key: SortKey) => {
    let newDirection: "asc" | "desc" = "desc";
    if (key !== null && key === sortKey) {
      newDirection = sortDirection === "desc" ? "asc" : "desc";
    }
    setSortState({ key, direction: newDirection });
    if (onSortProp) {
      onSortProp(key, newDirection);
    }
  };

  const { isShowStatsInHeader, mergeGroupsWithStats, enableGroupedBar } =
    useAppConfig();
  const isMobile = useIsMobile();

  const resolvedStats = useMemo<StatEntry[]>(() => {
    const getLabel = (compactLabel: string, fullLabel: string) =>
      isShowStatsInHeader ? (isMobile ? fullLabel : compactLabel) : fullLabel;

    const entries: StatEntry[] = [];
    if (displayOptions.currentOnline) {
      entries.push({
        key: "currentOnline",
        label: getLabel("当前在线", "当前在线"),
        lines: [loading ? "..." : `${stats.onlineCount} / ${stats.totalCount}`],
      });
    }
    if (displayOptions.regionOverview) {
      entries.push({
        key: "regionOverview",
        label: getLabel("点亮地区", "点亮地区"),
        lines: [loading ? "..." : String(stats.uniqueRegions)],
      });
    }
    if (displayOptions.trafficOverview) {
      entries.push({
        key: "trafficOverview",
        label: getLabel("流量", "流量概览"),
        lines: loading
          ? ["..."]
          : [
              `↑ ${formatBytes(stats.totalTrafficUp)}`,
              `↓ ${formatBytes(stats.totalTrafficDown)}`,
            ],
        isLabelVertical: !isMobile && isShowStatsInHeader,
        textLeft: true,
      });
    }
    if (displayOptions.networkSpeed) {
      entries.push({
        key: "networkSpeed",
        label: getLabel("网速", "网络速率"),
        lines: loading
          ? ["..."]
          : [
              `↑ ${formatBytes(stats.currentSpeedUp)}/s`,
              `↓ ${formatBytes(stats.currentSpeedDown)}/s`,
            ],
        isLabelVertical: !isMobile && isShowStatsInHeader,
        textLeft: true,
      });
    }
    return entries;
  }, [displayOptions, loading, stats, isMobile, isShowStatsInHeader]);

  const hasVisibleStats = Object.values(displayOptions).some(Boolean);

  if (isShowStatsInHeader && !isMobile) {
    return (
      <div className="flex items-center gap-2">
        {enableGroupedBar && mergeGroupsWithStats && (
          <GroupSelector
            groups={groups}
            selectedGroup={selectedGroup}
            onSelectGroup={onSelectGroup}
          />
        )}
        <div className="flex items-center gap-1.5">
          {displayOptions.currentTime && (
            <CurrentTimeChip isInHeader={true} isMobile={isMobile} />
          )}
          {resolvedStats.map(({ key, ...rest }) => (
            <StatChip
              key={key}
              {...rest}
              isInHeader={true}
              isMobile={isMobile}
            />
          ))}
          <StatsToggleMenu
            displayOptions={displayOptions}
            setDisplayOptions={setDisplayOptions}
          />
          <SortToggleMenu
            onSort={handleSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
          />
        </div>
      </div>
    );
  }

  const getGridTemplateColumns = () => {
    if (!isMobile) {
      return "repeat(auto-fit, minmax(100px, 1fr))";
    }
    const visibleCount =
      resolvedStats.length +
      (displayOptions.currentTime ? 1 : 0) +
      (enableGroupedBar && mergeGroupsWithStats ? 1 : 0);

    return visibleCount >= 5 ? "repeat(3, 1fr)" : "repeat(2, 1fr)";
  };

  return (
    <div
      className={cn(
        "purcarte-blur theme-card-style relative flex items-center text-primary my-4",
        isMobile ? "text-xs p-2" : "text-sm px-4 min-w-[300px] min-h-[5rem]"
      )}>
      <div
        className="grid w-full gap-2 text-center items-center py-3"
        style={{
          gridTemplateColumns: getGridTemplateColumns(),
          gridAutoRows: "min-content",
        }}>
        {enableGroupedBar && mergeGroupsWithStats && (
          <div className="flex flex-col items-center">
            <GroupSelector
              groups={groups}
              selectedGroup={selectedGroup}
              onSelectGroup={onSelectGroup}
            />
          </div>
        )}

        {hasVisibleStats ? (
          <>
            {displayOptions.currentTime && (
              <CurrentTimeChip isMobile={isMobile} />
            )}
            {resolvedStats.map(({ key, ...rest }) => (
              <StatChip key={key} {...rest} isMobile={isMobile} />
            ))}
          </>
        ) : (
          <span className="text-xs text-secondary-foreground">
            统计信息已隐藏
          </span>
        )}
      </div>
      <div className="absolute right-2 top-2">
        <StatsToggleMenu
          displayOptions={displayOptions}
          setDisplayOptions={setDisplayOptions}
        />
      </div>
      <div className="absolute right-2">
        <SortToggleMenu
          onSort={handleSort}
          sortKey={sortKey}
          sortDirection={sortDirection}
        />
      </div>
    </div>
  );
};
