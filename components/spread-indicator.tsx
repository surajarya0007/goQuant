
"use client"

import React, { memo, useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface SpreadPoint {
  timestamp: number
  spread: number
  spreadPercentage: number
}

interface SpreadIndicatorProps {
  data: SpreadPoint[]
}

const formatTime = (ms: number) => {
  const d = new Date(ms)
  return (
    d.getMinutes().toString().padStart(2, "0") +
    ":" +
    d.getSeconds().toString().padStart(2, "0")
  )
}

const SpreadIndicator = memo(function SpreadIndicator({ data }: SpreadIndicatorProps) {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        timeLabel: formatTime(d.timestamp),
      })),
    [data]
  )

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading spread data...
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorSpread" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />

          <XAxis
            dataKey="timestamp"
            type="category"
            tickCount={60}
            tickFormatter={(timestamp) => formatTime(timestamp)}
            tick={{ fontSize: 12 }}
            stroke="hsl(var(--muted-foreground))"
            label={{ value: "Time (mm:ss)", position: "insideBottom", offset: 0, textAnchor: "middle",fontSize: 12 }}
          />

          <YAxis
            domain={["auto", "auto"]}
            tickFormatter={(value) => `$${value.toFixed(3)}`}
            tick={{ fontSize: 12 }}
            stroke="hsl(var(--muted-foreground))"
            // label={{ value: "Spread ($)", angle: -90, position: "insideCenterLeft",  offset: 2, fontSize: 12 }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              color: "hsl(var(--foreground))",
            }}
            labelFormatter={(label) => `Time: ${formatTime(label as number)}`}
            formatter={(value: any) => value.toFixed(20)}
          />

          <Area
            type="monotone"
            dataKey="spread"
            stroke="hsl(142, 76%, 36%)"
            fill="url(#colorSpread)"
            fillOpacity={1}
            activeDot={{ r: 6, fill: "hsl(142, 76%, 36%)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
})

export default SpreadIndicator
