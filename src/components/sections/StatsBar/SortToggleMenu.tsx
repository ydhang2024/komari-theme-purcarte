import { memo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowDownUp } from "lucide-react";
import { cn } from "@/utils";
import type { StatsBarProps } from "./types";

export const SortToggleMenu = memo(
  ({
    onSort,
    sortKey,
    sortDirection,
  }: Pick<StatsBarProps, "onSort" | "sortKey" | "sortDirection">) => {
    const sortOptions: {
      key: "trafficUp" | "trafficDown" | "speedUp" | "speedDown";
      label: string;
    }[] = [
      { key: "trafficUp", label: "按上传流量" },
      { key: "trafficDown", label: "按下载流量" },
      { key: "speedUp", label: "按上传速率" },
      { key: "speedDown", label: "按下载速率" },
    ];

    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 rounded-full cursor-pointer">
            <ArrowDownUp className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>排序方式</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sortOptions.map(({ key, label }) => (
            <DropdownMenuItem
              key={key}
              className="flex items-center justify-between cursor-pointer"
              onSelect={() => onSort?.(key, "desc")}>
              <span
                className={cn(sortKey === key && "text-primary font-semibold")}>
                {label}
              </span>
              {sortKey === key &&
                (sortDirection === "desc" ? (
                  <ArrowDown className="h-4 w-4" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                ))}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center justify-between cursor-pointer"
            onSelect={() => onSort?.(null, "desc")}>
            重置排序
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);
