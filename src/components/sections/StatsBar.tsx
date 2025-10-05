import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Layers, Settings2 } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn, formatBytes } from "@/utils";
import { useAppConfig } from "@/config";
import { useIsMobile } from "@/hooks/useMobile";

// --- 类型定义 ---
type DisplayOptions = {
  currentTime: boolean;
  currentOnline: boolean;
  regionOverview: boolean;
  trafficOverview: boolean;
  networkSpeed: boolean;
};

type StatsSnapshot = {
  onlineCount: number;
  totalCount: number;
  uniqueRegions: number;
  totalTrafficUp: number;
  totalTrafficDown: number;
  currentSpeedUp: number;
  currentSpeedDown: number;
};

export interface StatsBarProps {
  displayOptions: DisplayOptions;
  setDisplayOptions: (options: Partial<DisplayOptions>) => void;
  stats: StatsSnapshot;
  loading: boolean;
  enableGroupedBar?: boolean;
  groups?: string[];
  selectedGroup?: string;
  onSelectGroup?: (group: string) => void;
  isShowStatsInHeader?: boolean;
}

interface StatEntry {
  key: string;
  label: string;
  lines: string[];
  isLabelVertical?: boolean;
}

// --- 内部组件 ---

const StatChip = memo(
  ({
    label,
    lines,
    isLabelVertical,
    isInHeader,
    isMobile,
  }: {
    label: string;
    lines: string[];
    isLabelVertical?: boolean;
    isInHeader?: boolean;
    isMobile: boolean;
  }) => {
    if (isMobile || isInHeader) {
      return (
        <div
          className={cn(
            "flex shrink-0 bg-transition px-1.5 py-0.5 text-center",
            isLabelVertical ? "" : "flex-col"
          )}>
          <div
            className={cn(
              "text-xs font-semibold text-secondary-foreground",
              isMobile ? "" : "tracking-widest "
            )}
            style={
              !isMobile && isLabelVertical ? { writingMode: "vertical-rl" } : {}
            }>
            {label}
          </div>
          <div className="text-xs font-semibold text-secondary-foreground leading-tight">
            {lines.map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="w-full py-1">
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-secondary-foreground">
            {label}
          </label>
          <div className="font-medium -mt-2">
            {lines.length > 1 ? (
              <div className="flex flex-col items-center">
                {lines.map((line, index) => (
                  <span key={index}>{line}</span>
                ))}
              </div>
            ) : (
              lines[0]
            )}
          </div>
        </div>
      </div>
    );
  }
);

const CurrentTimeChip = memo(
  ({ isInHeader, isMobile }: { isInHeader?: boolean; isMobile: boolean }) => {
    const [time, setTime] = useState(() => new Date());

    useEffect(() => {
      const timer = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(timer);
    }, []);

    return (
      <StatChip
        key="currentTime"
        label={"当前时间"}
        lines={[time.toLocaleTimeString()]}
        isInHeader={isInHeader}
        isMobile={isMobile}
      />
    );
  }
);

const StatsToggleMenu = memo(
  ({
    displayOptions,
    setDisplayOptions,
    isMobile,
  }: Pick<StatsBarProps, "displayOptions" | "setDisplayOptions"> & {
    isMobile: boolean;
  }) => (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={
            isMobile ? "h-8 w-8 shrink-0 rounded-full" : "cursor-pointer"
          }>
          <Settings2 className={isMobile ? "h-4 w-4" : ""} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>状态显示设置</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(displayOptions) as Array<keyof DisplayOptions>).map(
          (key) => (
            <DropdownMenuItem
              key={key}
              className="flex items-center justify-between cursor-pointer">
              <span>
                {
                  {
                    currentTime: "当前时间",
                    currentOnline: "当前在线",
                    regionOverview: "点亮地区",
                    trafficOverview: "流量概览",
                    networkSpeed: "网络速率",
                  }[key]
                }
              </span>
              <Switch
                checked={displayOptions[key]}
                onCheckedChange={(checked) =>
                  setDisplayOptions({ [key]: checked })
                }
              />
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
);

const GroupSelector = memo(
  ({
    groups,
    selectedGroup,
    onSelectGroup,
  }: Pick<StatsBarProps, "groups" | "selectedGroup" | "onSelectGroup">) => {
    if (!groups?.length || !onSelectGroup) return null;

    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 shrink-0 rounded-full px-2 text-xs font-semibold text-secondary-foreground">
            <Layers className="mr-1.5 h-3.5 w-3.5" />
            {selectedGroup}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuLabel>选择分组</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {groups.map((group) => (
            <DropdownMenuItem
              key={group}
              className={cn(
                "cursor-pointer text-sm",
                selectedGroup === group && "bg-secondary/30 font-semibold"
              )}
              onSelect={() => onSelectGroup(group)}>
              {group}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);

// --- 主组件 ---

export const StatsBar = (props: StatsBarProps) => {
  const {
    displayOptions,
    setDisplayOptions,
    stats,
    loading,
    groups,
    selectedGroup,
    onSelectGroup,
  } = props;
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
      });
    }
    return entries;
  }, [displayOptions, loading, stats, isMobile, isShowStatsInHeader]);

  const hasVisibleStats = Object.values(displayOptions).some(Boolean);

  // 紧凑模式 - 桌面端
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
            isMobile={isMobile}
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

  // 默认卡片模式
  return (
    <>
      <div
        className={`purcarte-blur theme-card-style relative flex items-center text-secondary-foreground my-4 ${
          isMobile ? "text-xs p-2" : "text-sm px-4 min-w-[300px] min-h-[5rem]"
        }`}>
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
            <span className="text-xs text-secondary-foreground/60">
              统计信息已隐藏
            </span>
          )}
        </div>
        <div className="absolute right-2 top-2">
          <StatsToggleMenu
            displayOptions={displayOptions}
            setDisplayOptions={setDisplayOptions}
            isMobile={isMobile}
          />
        </div>
      </div>
    </>
  );
};
