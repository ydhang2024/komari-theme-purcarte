import { formatBytes, formatTrafficLimit, formatUptime } from "@/utils";
import type { NodeData } from "@/types/node";
import { Link } from "react-router-dom";
import { CpuIcon, MemoryStickIcon, HardDriveIcon } from "lucide-react";
import Flag from "./Flag";
import { Tag } from "../ui/tag";
import { useNodeCommons } from "@/hooks/useNodeCommons";
import { CircleProgress } from "../ui/progress-circle";
import { ProgressBar } from "../ui/progress-bar";

interface NodeTableProps {
  nodes: NodeData[];
  enableSwap: boolean;
  enableListItemProgressBar: boolean;
  selectTrafficProgressStyle: "circular" | "linear";
}

export const NodeTable = ({
  nodes,
  enableSwap,
  enableListItemProgressBar,
  selectTrafficProgressStyle,
}: NodeTableProps) => {
  const gridCols = enableSwap ? "grid-cols-9" : "grid-cols-8";

  return (
    <div className="space-y-2">
      <div
        className={`text-primary font-bold grid ${gridCols} text-center shadow-sm shadow-(color:--accent-4)/50 gap-4 p-2 items-center rounded-lg bg-card transition-colors duration-200`}>
        <div className="col-span-2">节点名称</div>
        <div className="col-span-1">CPU</div>
        <div className="col-span-1">内存</div>
        {enableSwap && <div className="col-span-1">SWAP</div>}
        <div className="col-span-1">硬盘</div>
        <div className="col-span-1">网络</div>
        <div className="col-span-1">流量</div>
        <div className="col-span-1">负载</div>
      </div>
      {nodes.map((node) => (
        <NodeTableRow
          key={node.uuid}
          node={node}
          enableSwap={enableSwap}
          enableListItemProgressBar={enableListItemProgressBar}
          selectTrafficProgressStyle={selectTrafficProgressStyle}
        />
      ))}
    </div>
  );
};

interface NodeTableRowProps {
  node: NodeData;
  enableSwap: boolean;
  enableListItemProgressBar: boolean;
  selectTrafficProgressStyle: "circular" | "linear";
}

const NodeTableRow = ({
  node,
  enableSwap,
  enableListItemProgressBar,
  selectTrafficProgressStyle,
}: NodeTableRowProps) => {
  const {
    stats,
    isOnline,
    tagList,
    cpuUsage,
    memUsage,
    swapUsage,
    diskUsage,
    load,
    expired_at,
    trafficPercentage,
  } = useNodeCommons(node);
  const gridCols = enableSwap ? "grid-cols-9" : "grid-cols-8";

  return (
    <div
      className={`grid ${gridCols} text-center shadow-sm shadow-(color:--accent-4)/50 gap-4 p-2 text-nowrap items-center rounded-lg ${
        isOnline
          ? ""
          : "striped-bg-red-translucent-diagonal ring-2 ring-red-500/50"
      } text-secondary-foreground transition-colors duration-200`}>
      <div className="col-span-2 flex items-center text-left">
        <Flag flag={node.region} />
        <div className="ml-2 w-[85%] space-y-1">
          <Link to={`/instance/${node.uuid}`}>
            <div className="text-base font-bold">{node.name}</div>
          </Link>
          <Tag className="text-xs" tags={tagList} />
          <div className="flex text-xs">
            <span className="text-secondary-foreground">
              {isOnline && stats
                ? `${expired_at} | ${formatUptime(stats.uptime)}`
                : "离线"}
            </span>
          </div>
        </div>
      </div>
      <div className="col-span-1 flex items-center text-left">
        <CpuIcon className="inline-block size-5 flex-shrink-0 text-blue-600" />
        <div className="ml-1 w-full items-center justify-center">
          <div>{node.cpu_cores} Cores</div>
          {enableListItemProgressBar ? (
            <div className="flex items-center gap-1">
              <ProgressBar value={cpuUsage} h="h-2" />
              <span className="w-10 text-right text-xs">
                {isOnline ? `${cpuUsage.toFixed(0)}%` : "N/A"}
              </span>
            </div>
          ) : (
            <div>{isOnline ? `${cpuUsage.toFixed(0)}%` : "N/A"}</div>
          )}
        </div>
      </div>
      <div className="col-span-1 flex items-center text-left">
        <MemoryStickIcon className="inline-block size-5 flex-shrink-0 text-green-600" />
        <div className="ml-1 w-full items-center justify-center">
          <div>{formatBytes(node.mem_total)}</div>
          {enableListItemProgressBar ? (
            <div className="flex items-center gap-1">
              <ProgressBar value={memUsage} h="h-2" />
              <span className="w-10 text-right text-xs">
                {isOnline ? `${memUsage.toFixed(0)}%` : "N/A"}
              </span>
            </div>
          ) : (
            <div>{isOnline ? `${memUsage.toFixed(0)}%` : "N/A"}</div>
          )}
        </div>
      </div>
      {enableSwap && (
        <div className="col-span-1 flex items-center text-left">
          <MemoryStickIcon className="inline-block size-5 flex-shrink-0 text-purple-600" />
          {node.swap_total > 0 ? (
            <div className="ml-1 w-full items-center justify-center">
              <div>{formatBytes(node.swap_total)}</div>
              {enableListItemProgressBar ? (
                <div className="flex items-center gap-1">
                  <ProgressBar value={swapUsage} h="h-2" />
                  <span className="w-10 text-right text-xs">
                    {isOnline ? `${swapUsage.toFixed(0)}%` : "N/A"}
                  </span>
                </div>
              ) : (
                <div>{isOnline ? `${swapUsage.toFixed(0)}%` : "N/A"}</div>
              )}
            </div>
          ) : (
            <div className="ml-1 w-full item-center justify-center">OFF</div>
          )}
        </div>
      )}
      <div className="col-span-1 flex items-center text-left">
        <HardDriveIcon className="inline-block size-5 flex-shrink-0 text-red-600" />
        <div className="ml-1 w-full items-center justify-center">
          <div>{formatBytes(node.disk_total)}</div>
          {enableListItemProgressBar ? (
            <div className="flex items-center gap-1">
              <ProgressBar value={diskUsage} h="h-2" />
              <span className="w-10 text-right text-xs">
                {isOnline ? `${diskUsage.toFixed(0)}%` : "N/A"}
              </span>
            </div>
          ) : (
            <div>{isOnline ? `${diskUsage.toFixed(0)}%` : "N/A"}</div>
          )}
        </div>
      </div>
      <div className="col-span-1 text-left">
        <div>↑ {stats ? formatBytes(stats.net_out, true) : "N/A"}</div>
        <div>↓ {stats ? formatBytes(stats.net_in, true) : "N/A"}</div>
      </div>
      <div className="col-span-1 text-left">
        {selectTrafficProgressStyle === "linear" && isOnline && stats ? (
          <div className="flex flex-col">
            <div>
              <div>↑ {stats ? formatBytes(stats.net_total_up) : "N/A"}</div>
              <div>↓ {stats ? formatBytes(stats.net_total_down) : "N/A"}</div>
            </div>
            {node.traffic_limit !== 0 && isOnline && stats && (
              <>
                <div className="w-[80%] flex items-center gap-1">
                  <ProgressBar value={trafficPercentage} h="h-2" />
                  <span className="text-right text-xs">
                    {node.traffic_limit !== 0
                      ? `${trafficPercentage.toFixed(0)}%`
                      : ""}
                  </span>
                </div>
                <div className="text-xs text-secondary-foreground">
                  {formatTrafficLimit(
                    node.traffic_limit,
                    node.traffic_limit_type
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <div>
                <div>↑ {stats ? formatBytes(stats.net_total_up) : "N/A"}</div>
                <div>↓ {stats ? formatBytes(stats.net_total_down) : "N/A"}</div>
              </div>
              {node.traffic_limit !== 0 && isOnline && stats && (
                <div>
                  {formatTrafficLimit(
                    node.traffic_limit,
                    node.traffic_limit_type
                  )}
                </div>
              )}
            </div>
            {node.traffic_limit !== 0 && isOnline && stats && (
              <div>
                <CircleProgress
                  value={trafficPercentage}
                  maxValue={100}
                  size={32}
                  strokeWidth={4}
                  showPercentage={true}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="col-span-1">
        {load.split("|").map((item, index) => (
          <div key={index}>{item.trim()}</div>
        ))}
      </div>
    </div>
  );
};
