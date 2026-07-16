import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TimeSeriesPoint } from "../types";

export type EngagementChartProps = {
  data: TimeSeriesPoint[];
};

const CHART_HEIGHT = 240;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 32;
const PADDING_LEFT = 40;
const PADDING_RIGHT = 8;

export function EngagementChart({ data }: EngagementChartProps) {
  const { t } = useTranslation("analytics");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { maxValue, barWidth, plotHeight, labelStep } = useMemo(() => {
    const max = Math.max(...data.map((d) => d.value), 1);
    const pWidth = 100; // percentage-based since we use viewBox
    const plotW = pWidth - PADDING_LEFT - PADDING_RIGHT;
    const plotH = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    const bWidth = data.length > 0 ? plotW / data.length : 0;
    // Show every Nth label to avoid crowding (target ~6-8 labels)
    const step = Math.max(1, Math.ceil(data.length / 7));
    return { maxValue: max, barWidth: bWidth, plotHeight: plotH, labelStep: step };
  }, [data]);

  if (data.length === 0) return null;

  // Use a viewBox for responsive SVG (100 units wide = percentage-like)
  const viewBoxWidth = 100;
  const viewBoxHeight = CHART_HEIGHT;

  return (
    <div className="relative w-full" style={{ height: `${CHART_HEIGHT}px` }}>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        role="img"
        aria-label={t("engagement.title")}
      >
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const y = PADDING_TOP + plotHeight * (1 - fraction);
          const label = Math.round(maxValue * fraction);
          return (
            <g key={fraction}>
              <line
                x1={PADDING_LEFT}
                x2={viewBoxWidth - PADDING_RIGHT}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.1}
                strokeWidth={0.2}
              />
              <text
                x={PADDING_LEFT - 2}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-muted-foreground"
                fontSize={3.5}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((point, i) => {
          const barH = (point.value / maxValue) * plotHeight;
          const x = PADDING_LEFT + i * barWidth;
          const y = PADDING_TOP + plotHeight - barH;
          const isHovered = hoveredIndex === i;

          return (
            <g key={point.date}>
              <rect
                x={x + barWidth * 0.1}
                y={y}
                width={barWidth * 0.8}
                height={barH}
                rx={barWidth * 0.1}
                className={isHovered ? "fill-primary" : "fill-primary/70"}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              {/* X-axis label for every Nth item */}
              {i % labelStep === 0 && (
                <text
                  x={x + barWidth / 2}
                  y={PADDING_TOP + plotHeight + 10}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize={3}
                >
                  {formatDateLabel(point.date)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip (desktop only) */}
      {hoveredIndex !== null && (
        <div
          className="pointer-events-none absolute hidden rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md md:block"
          style={{
            left: `${((PADDING_LEFT + hoveredIndex * barWidth + barWidth / 2) / viewBoxWidth) * 100}%`,
            top: `${((PADDING_TOP + plotHeight - (data[hoveredIndex].value / maxValue) * plotHeight - 12) / viewBoxHeight) * 100}%`,
            transform: "translateX(-50%)",
          }}
        >
          <span className="font-medium">{data[hoveredIndex].value.toLocaleString()}</span>
          <span className="ml-1 text-muted-foreground">{formatDateLabel(data[hoveredIndex].date)}</span>
        </div>
      )}
    </div>
  );
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
