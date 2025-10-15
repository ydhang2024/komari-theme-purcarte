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
import { Layers } from "lucide-react";
import { cn } from "@/utils";
import type { StatsBarProps } from "./types";

export const GroupSelector = memo(
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
            variant="default"
            size="sm"
            className="h-7 shrink-0 rounded-full px-2 text-xs font-semibold">
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
