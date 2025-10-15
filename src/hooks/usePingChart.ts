import { useState, useEffect } from "react";
import { useNodeData } from "@/contexts/NodeDataContext";
import type { PingHistoryResponse, NodeData } from "@/types/node";

const cache = new Map<string, PingHistoryResponse>();

export const usePingChart = (node: NodeData | null, hours: number) => {
  const { getPingHistory } = useNodeData();
  const [pingHistory, setPingHistory] = useState<PingHistoryResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!node?.uuid) {
      setPingHistory(null);
      setLoading(false);
      return;
    }

    const cacheKey = `${node.uuid}-${hours}`;

    if (cache.has(cacheKey)) {
      setPingHistory(cache.get(cacheKey)!);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchHistory = async () => {
      try {
        const data = await getPingHistory(node.uuid, hours);
        if (data) {
          cache.set(cacheKey, data);
        }
        setPingHistory(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch history data");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [node?.uuid, hours, getPingHistory]);

  return {
    loading,
    error,
    pingHistory,
  };
};
