"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface MarketDepthProps {
  data: {
    price: string
    bidVolume: number
    askVolume: number
    bidTotal: number
    askTotal: number
  }[]
}

export default function MarketDepth({ data }: MarketDepthProps) {
  if (!data.length) {
    return <div className="flex items-center justify-center h-full">Loading market depth data...</div>
  }

  // Sort data based on price (lowest to highest)
  const sortedData = [...data].sort((a, b) => parseFloat(a.price) - parseFloat(b.price))

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sortedData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBids" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorAsks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="price"
            tickFormatter={(value) => Number.parseFloat(value).toFixed(1)}
            tick={{ fontSize: 12 }}
            stroke="hsl(var(--muted-foreground))"
            label={{ value: "Prices", position: "insideBottom", offset: 0, textAnchor: "middle",fontSize: 12 }}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 12 }}
            stroke="hsl(var(--muted-foreground))"
            tickFormatter={(value) => value.toFixed(0)}
            label={{ value: "Total Volume", angle: -90, fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              color: "hsl(var(--foreground))",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(value: any, name: string) => {
              if (name === "bidTotal") return [value.toFixed(5), "Bid Total"]
              if (name === "askTotal") return [value.toFixed(5), "Ask Total"]
              if (name === "bidVolume") return [value.toFixed(5), "Bid Volume"]
              if (name === "askVolume") return [value.toFixed(5), "Ask Volume"]
              return [value, name]
            }}
            labelFormatter={(label) => `Price: $${Number.parseFloat(label).toFixed(2)}`}
          />
          <Area
            type="monotone"
            dataKey="bidTotal"
            stroke="hsl(142, 76%, 36%)"
            fillOpacity={1}
            fill="url(#colorBids)"
            activeDot={{ r: 6, fill: "hsl(142, 76%, 36%)" }}
          />
          <Area
            type="monotone"
            dataKey="askTotal"
            stroke="hsl(0, 84%, 60%)"
            fillOpacity={1}
            fill="url(#colorAsks)"
            activeDot={{ r: 6, fill: "hsl(0, 84%, 60%)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
