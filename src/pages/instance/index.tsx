import { useState, useEffect, lazy, Suspense, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNodeData } from "@/contexts/NodeDataContext";
import { useLiveData } from "@/contexts/LiveDataContext";
import type { NodeData } from "@/types/node";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Instance from "./Instance";
const LoadCharts = lazy(() => import("./LoadCharts"));
const PingChart = lazy(() => import("./PingChart"));
import Loading from "@/components/loading";
import Flag from "@/components/sections/Flag";
import { useAppConfig } from "@/config";
import { useIsMobile } from "@/hooks/useMobile";

const InstancePage = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { nodes: staticNodes, loading: nodesLoading } = useNodeData();
  const { liveData } = useLiveData();
  useNodeData();
  const [staticNode, setStaticNode] = useState<NodeData | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [chartType, setChartType] = useState<"load" | "ping">("load");
  const [displayedChartType, setDisplayedChartType] = useState<"load" | "ping">(
    "load"
  );
  const [chartAnimationState, setChartAnimationState] = useState<
    "idle" | "fading-out" | "fading-in"
  >("fading-in");
  const [loadHours, setLoadHours] = useState<number>(0);
  const [pingHours, setPingHours] = useState<number>(1); // 默认1小时
  const { enableInstanceDetail, enablePingChart, publicSettings } =
    useAppConfig();
  const isMobile = useIsMobile();

  const maxRecordPreserveTime = publicSettings?.record_preserve_time || 0; // 默认0表示关闭
  const maxPingRecordPreserveTime =
    publicSettings?.ping_record_preserve_time || 24; // 默认1天

  const timeRanges = useMemo(() => {
    return [
      { label: "实时", hours: 0 },
      { label: "1小时", hours: 1 },
      { label: "4小时", hours: 4 },
      { label: "1天", hours: 24 },
      { label: "7天", hours: 168 },
      { label: "30天", hours: 720 },
    ];
  }, []);

  const pingTimeRanges = useMemo(() => {
    const filtered = timeRanges.filter(
      (range) => range.hours !== 0 && range.hours <= maxPingRecordPreserveTime
    );

    if (maxPingRecordPreserveTime > 720) {
      filtered.push({
        label: `${maxPingRecordPreserveTime}小时`,
        hours: maxPingRecordPreserveTime,
      });
    }

    return filtered;
  }, [timeRanges, maxPingRecordPreserveTime]);

  const loadTimeRanges = useMemo(() => {
    const filtered = timeRanges.filter(
      (range) => range.hours <= maxRecordPreserveTime
    );
    if (maxRecordPreserveTime > 720) {
      filtered.push({
        label: `${maxRecordPreserveTime}小时`,
        hours: maxRecordPreserveTime,
      });
    }

    return filtered;
  }, [timeRanges, maxRecordPreserveTime]);

  useEffect(() => {
    if (Array.isArray(staticNodes)) {
      const foundNode = staticNodes.find((n: NodeData) => n.uuid === uuid);
      setStaticNode(foundNode || null);
    }
  }, [staticNodes, uuid]);

  useEffect(() => {
    setIsReady(false);
  }, [uuid]);

  const stats = useMemo(() => {
    if (!staticNode || !liveData) return undefined;
    return liveData[staticNode.uuid];
  }, [staticNode, liveData]);

  const node = staticNode;
  const isOnline = stats?.online ?? false;

  useEffect(() => {
    if (nodesLoading) {
      setIsReady(false);
      return;
    }

    if (!node) {
      return;
    }

    const timer = setTimeout(() => setIsReady(true), 300);

    return () => clearTimeout(timer);
  }, [node, nodesLoading]);

  useEffect(() => {
    if (chartType === displayedChartType) {
      if (chartAnimationState === "fading-in") {
        const timer = setTimeout(() => setChartAnimationState("idle"), 300);
        return () => clearTimeout(timer);
      }
      return;
    }

    setChartAnimationState("fading-out");

    const outTimer = setTimeout(() => {
      setDisplayedChartType(chartType);
      setChartAnimationState("fading-in");
    }, 200);

    return () => clearTimeout(outTimer);
  }, [chartType, displayedChartType, chartAnimationState]);

  const handleChartTypeChange = (nextType: "load" | "ping") => {
    if (nextType === chartType || chartAnimationState === "fading-out") {
      return;
    }
    setChartType(nextType);
  };

  if (!node || !staticNode) {
    if (nodesLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loading text="正在获取节点信息..." />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center h-full">
        未找到该节点
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading
          text="正在进入节点详情..."
          className={!nodesLoading ? "fade-out" : ""}
        />
      </div>
    );
  }

  return (
    <div className="text-card-foreground space-y-4 my-4 fade-in @container">
      <div className="flex items-center justify-between purcarte-blur theme-card-style p-4 mb-4 text-primary">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            className="flex-shrink-0"
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <Flag flag={node.region}></Flag>
            <span className="text-xl md:text-2xl font-bold">{node.name}</span>
          </div>
          <span className="text-sm text-secondary-foreground flex-shrink-0">
            {isOnline ? "在线" : "离线"}
          </span>
        </div>
      </div>

      {enableInstanceDetail && node && <Instance node={node} />}

      <div className="flex flex-col items-center w-full space-y-4">
        <div className="purcarte-blur theme-card-style p-2">
          <div className="flex justify-center space-x-2">
            <Button
              variant={chartType === "load" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleChartTypeChange("load")}>
              负载
            </Button>
            {enablePingChart && (
              <Button
                variant={chartType === "ping" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleChartTypeChange("ping")}>
                延迟
              </Button>
            )}
          </div>
        </div>
        <div
          className={`purcarte-blur theme-card-style justify-center p-2 ${
            isMobile ? "w-full" : ""
          }`}>
          {chartType === "load" ? (
            <div className="flex space-x-2 overflow-x-auto whitespace-nowrap">
              {loadTimeRanges.map((range) => (
                <Button
                  key={range.label}
                  variant={loadHours === range.hours ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLoadHours(range.hours)}>
                  {range.label}
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex space-x-2 overflow-x-auto whitespace-nowrap">
              {pingTimeRanges.map((range) => (
                <Button
                  key={range.label}
                  variant={pingHours === range.hours ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPingHours(range.hours)}>
                  {range.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className={
          chartAnimationState === "fading-out"
            ? "fade-out"
            : chartAnimationState === "fading-in"
            ? "fade-in"
            : undefined
        }>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-96">
              <Loading text="正在加载图表..." />
            </div>
          }>
          {displayedChartType === "load" && staticNode ? (
            <LoadCharts
              node={staticNode}
              hours={loadHours}
              liveData={stats}
              isOnline={isOnline}
            />
          ) : displayedChartType === "ping" && staticNode ? (
            <PingChart node={staticNode} hours={pingHours} />
          ) : null}
        </Suspense>
      </div>
    </div>
  );
};

export default InstancePage;
