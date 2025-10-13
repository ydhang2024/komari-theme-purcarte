import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NodeData } from "@/types/node";
import { memo, useMemo, type ReactNode } from "react";
import { formatBytes, formatUptime, formatTrafficLimit } from "@/utils";
import { CircleProgress } from "@/components/ui/progress-circle";
import { useNodeCommons } from "@/hooks/useNodeCommons";
import { useLiveData } from "@/contexts/LiveDataContext";

interface InfoItemProps {
  label: string;
  value: ReactNode;
  className?: string;
}

const InfoItem = ({ label, value, className }: InfoItemProps) => (
  <div className={className}>
    <p className="text-secondary-foreground">{label}</p>
    {typeof value === "string" ? <p>{value}</p> : value}
  </div>
);

interface InstanceProps {
  node: NodeData;
}

const Instance = memo(({ node }: InstanceProps) => {
  const { liveData } = useLiveData();
  const nodeWithStats = useMemo(
    () => ({
      ...node,
      stats: liveData?.[node.uuid],
    }),
    [node, liveData]
  );

  const { stats, isOnline, trafficPercentage } = useNodeCommons(nodeWithStats);

  const swapValue = useMemo(() => {
    if (node.swap_total === 0) return "OFF";
    if (stats && isOnline) {
      return `${formatBytes(stats.swap)} / ${formatBytes(node.swap_total)}`;
    }
    return `N/A / ${formatBytes(node.swap_total)}`;
  }, [node.swap_total, stats, isOnline]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>详细信息</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <InfoItem
          className="md:col-span-2"
          label="CPU"
          value={`${node.cpu_name} (x${node.cpu_cores})`}
        />
        <InfoItem label="架构" value={node.arch} />
        <InfoItem label="虚拟化" value={node.virtualization} />
        <InfoItem label="GPU" value={node.gpu_name || "N/A"} />
        <InfoItem label="操作系统" value={node.os} />
        <InfoItem
          label="内存"
          value={
            stats && isOnline
              ? `${formatBytes(stats.ram)} / ${formatBytes(node.mem_total)}`
              : `N/A / ${formatBytes(node.mem_total)}`
          }
        />
        <InfoItem label="交换内存" value={swapValue} />
        <InfoItem
          label="磁盘"
          value={
            stats && isOnline
              ? `${formatBytes(stats.disk)} / ${formatBytes(node.disk_total)}`
              : `N/A / ${formatBytes(node.disk_total)}`
          }
        />
        <InfoItem label="运行时间" value={formatUptime(stats?.uptime || 0)} />
        <InfoItem
          label="实时网络"
          value={
            stats && isOnline
              ? `↑ ${formatBytes(stats.net_out, true)} ↓ ${formatBytes(
                  stats.net_in,
                  true
                )}`
              : "N/A"
          }
        />
        <InfoItem
          label="总流量"
          value={
            <div className="flex items-center gap-2">
              {node.traffic_limit !== 0 && isOnline && stats && (
                <CircleProgress
                  value={trafficPercentage}
                  maxValue={100}
                  size={32}
                  strokeWidth={4}
                  showPercentage={true}
                />
              )}
              <div>
                <p>
                  {stats && isOnline
                    ? `↑ ${formatBytes(stats.net_total_up)} ↓ ${formatBytes(
                        stats.net_total_down
                      )}`
                    : "N/A"}
                </p>
                <p>
                  {formatTrafficLimit(
                    node.traffic_limit,
                    node.traffic_limit_type
                  )}
                </p>
              </div>
            </div>
          }
        />
        <InfoItem
          label="负载"
          value={
            stats && isOnline
              ? `${stats.load.toFixed(2)} | ${stats.load5.toFixed(
                  2
                )} | ${stats.load15.toFixed(2)}`
              : "N/A"
          }
        />
        <InfoItem
          label="最后上报"
          value={
            stats && isOnline ? new Date(stats.time).toLocaleString() : "N/A"
          }
        />
      </CardContent>
    </Card>
  );
});

export default Instance;
