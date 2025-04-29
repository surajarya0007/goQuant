
"use client"

import { useEffect, useState, useRef } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

// Hook to get the previous value without causing re-renders
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}

interface OrderbookData {
  bids: [string, string][]
  asks: [string, string][]
  lastUpdateId?: number
}

interface OrderbookProps {
  data: OrderbookData
}

export default function Orderbook({ data }: OrderbookProps) {
  // Flash states
  const [flashBids, setFlashBids] = useState<Record<string, "increase" | "decrease">>({})
  const [flashAsks, setFlashAsks] = useState<Record<string, "increase" | "decrease">>({})

  // Previous data ref
  const prevData = usePrevious<OrderbookData>(data)

  // Effect to compute flash states on data change only
  useEffect(() => {
    if (!prevData) return

    const bidsFlash: Record<string, "increase" | "decrease"> = {}
    data.bids.forEach(([price, amount]) => {
      const prevAmt = prevData.bids.find(([p]) => p === price)?.[1]
      if (prevAmt) {
        const curr = parseFloat(amount)
        const prev = parseFloat(prevAmt)
        if (curr > prev) bidsFlash[price] = "increase"
        else if (curr < prev) bidsFlash[price] = "decrease"
      }
    })
    const asksFlash: Record<string, "increase" | "decrease"> = {}
    data.asks.forEach(([price, amount]) => {
      const prevAmt = prevData.asks.find(([p]) => p === price)?.[1]
      if (prevAmt) {
        const curr = parseFloat(amount)
        const prev = parseFloat(prevAmt)
        if (curr > prev) asksFlash[price] = "increase"
        else if (curr < prev) asksFlash[price] = "decrease"
      }
    })

    setFlashBids(bidsFlash)
    setFlashAsks(asksFlash)

    const timer = setTimeout(() => {
      setFlashBids({})
      setFlashAsks({})
    }, 500)
    return () => clearTimeout(timer)
  }, [data])

  // Compute max volume
  const maxBid = Math.max(...data.bids.map(([,amt]) => parseFloat(amt)), 1)
  const maxAsk = Math.max(...data.asks.map(([,amt]) => parseFloat(amt)), 1)
  const maxVolume = Math.max(maxBid, maxAsk)

  if (!data.bids.length || !data.asks.length) {
    return <div className="flex items-center justify-center h-full">Loading orderbook data...</div>
  }

  const totalBid = data.bids.reduce((sum, [,amt]) => sum + parseFloat(amt), 0)
  const totalAsk = data.asks.reduce((sum, [,amt]) => sum + parseFloat(amt), 0)
  const total = totalBid + totalAsk
  const bidPressure = total > 0 ? totalBid / total * 100 : 50
  const askPressure = total > 0 ? totalAsk / total * 100 : 50

  return (
    <div className="flex flex-col gap-4 h-full pl-4 pt-3">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-xs">
          <span>Bid Pressure: {bidPressure.toFixed(1)}%</span>
          <span>Ask Pressure: {askPressure.toFixed(1)}%</span>
        </div>
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
          <div className="h-full bg-green-500" style={{ width: `${bidPressure}%` }} />
          <div className="h-full bg-red-500" style={{ width: `${askPressure}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow overflow-auto">
        {/* Bids */}
        <div className="overflow-x-auto">
          <h3 className="text-sm font-medium mb-2 text-green-500">Bids</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3 text-right">Price</TableHead>
                <TableHead className="w-1/3 text-right">Amount</TableHead>
                <TableHead className="w-1/3 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.bids.map(([price, amount]) => {
                const vol = parseFloat(amount)
                const pct = vol / maxVolume * 100
                return (
                  <TableRow key={`bid-${price}`} className="relative">
                    <TableCell
                      className={cn(
                        "text-right font-medium text-green-500",
                        flashBids[price] === "increase" && "animate-flash-green",
                        flashBids[price] === "decrease" && "animate-flash-red"
                      )}
                    >{parseFloat(price).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{vol.toFixed(5)}</TableCell>
                    <TableCell className="text-right">
                      {(parseFloat(price) * vol).toFixed(2)}
                      <div className="absolute top-0 right-0 h-full bg-green-500/30 z-0" style={{ width: `${pct}%` }} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        {/* Asks */}
        <div className="overflow-x-auto">
          <h3 className="text-sm font-medium mb-2 text-red-500">Asks</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3 text-right">Price</TableHead>
                <TableHead className="w-1/3 text-right">Amount</TableHead>
                <TableHead className="w-1/3 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.asks.map(([price, amount]) => {
                const vol = parseFloat(amount)
                const pct = vol / maxVolume * 100
                return (
                  <TableRow key={`ask-${price}`} className="relative">
                    <TableCell
                      className={cn(
                        "text-right font-medium text-red-500",
                        flashAsks[price] === "increase" && "animate-flash-green",
                        flashAsks[price] === "decrease" && "animate-flash-red"
                      )}
                    >{parseFloat(price).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{vol.toFixed(5)}</TableCell>
                    <TableCell className="text-right">
                      {(parseFloat(price) * vol).toFixed(2)}
                      <div className="absolute top-0 right-0 h-full bg-red-500/30 z-0" style={{ width: `${pct}%` }} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

