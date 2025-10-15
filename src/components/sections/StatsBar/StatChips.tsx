import { memo, useEffect, useState } from "react";
import { cn } from "@/utils";

export const StatChip = memo(
  ({
    label,
    lines,
    isLabelVertical,
    isInHeader,
    isMobile,
    textLeft,
  }: {
    label: string;
    lines: string[];
    isLabelVertical?: boolean;
    isInHeader?: boolean;
    isMobile: boolean;
    textLeft?: boolean;
  }) => {
    if (isMobile || isInHeader) {
      return (
        <div
          className={cn(
            "flex shrink-0 bg-transition px-1.5 py-0.5 text-center items-center",
            isLabelVertical ? "" : "flex-col"
          )}>
          <div
            className={cn(
              "text-xs font-semibold",
              isMobile ? "" : "tracking-widest"
            )}
            style={
              !isMobile && isLabelVertical ? { writingMode: "vertical-rl" } : {}
            }>
            {label}
          </div>
          <div
            className={`text-xs font-semibold leading-tight ${
              textLeft ? "text-left" : ""
            }`}>
            {lines.map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="w-full py-1">
        <div className="flex flex-col gap-2 items-center">
          <label>{label}</label>
          <div className={`font-medium -mt-2 ${textLeft ? "text-left" : ""}`}>
            {lines.map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

export const CurrentTimeChip = memo(
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
