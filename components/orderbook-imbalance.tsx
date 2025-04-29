
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

// Define the shape of each data point in imbalanceSeries
interface ImbalanceDataPoint {
  timestamp: number;
  imbalance: number;
}

// Define prop types for the component
interface OrderbookImbalanceProps {
  data: ImbalanceDataPoint[];
}

// Formatter to convert timestamp to HH:mm:ss
const formatTime = (timestamp: number | string): string => {
  const timeValue =
    typeof timestamp === "string" ? Number(timestamp) : timestamp;
  const date = new Date(timeValue);
  return (
    date.getMinutes().toString().padStart(2, "0") +
    ":" +
    date.getSeconds().toString().padStart(2, "0")
  );
};

const OrderbookImbalance: React.FC<OrderbookImbalanceProps> = ({ data }) => {
  const chartData = useMemo(
    () =>
      data.map((date) => ({
        ...date,
        timeLabel: formatTime(date.timestamp),
      })),
    [data]
  );

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading spread data...
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />

          <XAxis
            dataKey="time"
            type="category"
            tickCount={60}  
            tickFormatter={formatTime}
            tick={{ fontSize: 12 }}
            stroke="hsl(var(--muted-foreground))"
            label={{
              value: "Time (mm:ss)",
              position: "insideBottom",
              offset: -3,
              textAnchor: "middle",
              fontSize: 12,
            }}
          />  
          <YAxis
            domain={[-1, 1]}
            tick={{ fontSize: 12 }}
            stroke="hsl(var(--muted-foreground))"
            label={{
              value: "Imbalance",
              angle: -90,
              textAnchor: "middle",
              fontSize: 12,
              position: "insideLeft",
              offset: 20,
            }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              color: "hsl(var(--foreground))",
            }}
            labelFormatter={(label) => `Time: ${formatTime(label as number)}`}
            formatter={(value: any) => value.toFixed(2)}
          />
          {/* Bar with dynamic colors */}
          <Bar 
          dataKey="imbalance" 
          fill="green"
          isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.imbalance >= 0 ? "green" : "red"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OrderbookImbalance;
