
"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, Moon, Sun, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import Orderbook from "@/components/orderbook"
import SpreadIndicator from "@/components/spread-indicator"

import MarketDepth from "@/components/market-depth"
import TradingPairSelector from "@/components/trading-pair-selector"
import ExpandableCard from "@/components/expandable-card"
import useOrderbook from "@/hooks/use-orderbook"
import { TooltipProvider } from "@/components/ui/tooltip"
import OrderbookImbalance from "@/components/orderbook-imbalance"


export default function Home() {
  const [pair, setPair] = useState("btcusdt")
  const { orderbook, spreadHistory, imbalanceSeries: rawImbalanceSeries, depthData, connectionStatus, errorMessage } = useOrderbook(pair)

  // Transform imbalanceSeries to include timestamps
  const imbalanceSeries = rawImbalanceSeries.map((point, index) => ({
    ...point,
    timestamp: Date.now() - index * 60000, // Example: Add a timestamp (1-minute intervals)
  }))
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure theme toggle only renders client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <TooltipProvider>
      <main className="h-full p-4 md:p-6 bg-background">
        <div className="container mx-auto flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Crypto Orderbook</h1>
              <p className="text-muted-foreground">Real-time market data and indicators</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {connectionStatus === "connected" ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : connectionStatus === "connecting" ? (
                  <Wifi className="h-4 w-4 text-yellow-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  {connectionStatus === "connected"
                    ? "Connected to Binance"
                    : connectionStatus === "connecting"
                      ? "Connecting..."
                      : "Using fallback data"}
                </span>
              </div>
              <TradingPairSelector value={pair} onChange={setPair} />
              {mounted && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              )}
            </div>
          </div>

          {errorMessage && (
            <Alert className="mb-4">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Connection Issue</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Main content area */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 ">
            {/* Orderbook (3/5 width on large screens) */}
            <div className=" lg:col-span-3 h-[500px] md:h-[650px]">
              <ExpandableCard
                title="Orderbook"
                description={`Real-time bids and asks for ${pair.toUpperCase()}`}
                className="h-full"
              >
                <Orderbook data={orderbook} />
              </ExpandableCard>
            </div>

            {/* Indicators (2/5 width on large screens) */}
            <div className="lg:col-span-2 flex flex-col gap-4 h-[500px] md:h-[650px]">
              <ExpandableCard
                title="Spread Indicator"
                description="1-minute rolling spread between best bid and ask"
                className="h-1/3"
              >
                <SpreadIndicator data={spreadHistory} />
              </ExpandableCard>

              <ExpandableCard
                title="Orderbook Imbalance"
                description="Ratio of buy vs sell orders at each price level"
                className="h-1/3"
              >
                <OrderbookImbalance data={imbalanceSeries} />
              </ExpandableCard>

              <ExpandableCard
                title="Market Depth"
                description="Cumulative volume at each price level"
                className="h-1/3"
              >
                <MarketDepth data={depthData} />
              </ExpandableCard>
            </div>
          </div>
        </div>
      </main>
    </TooltipProvider>
  )
}

