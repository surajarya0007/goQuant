
"use client";

import { useEffect, useState, useRef, useCallback } from "react";

// Throttle utility
type ThrottleFn<T extends (...args: any[]) => void> = (
  ...args: Parameters<T>
) => void;
function throttle<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): ThrottleFn<T> {
  let lastCall = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = delay - (now - lastCall);

    if (remaining <= 0) {
      if (timeout) clearTimeout(timeout);
      lastCall = now;
      fn(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastCall = Date.now();
        timeout = null;
        fn(...args);
      }, remaining);
    }
  };
}

// Data interfaces
interface OrderbookData {
  bids: [string, string][];
  asks: [string, string][];
  lastUpdateId?: number;
}

interface SpreadData {
  timestamp: number;
  spread: number;
  spreadPercentage: number;
}
interface ImbalancePoint {
  time: number;
  imbalance: number;
}
interface DepthData {
  price: string;
  bidVolume: number;
  bidTotal: number;
  askVolume: number;
  askTotal: number;
}

interface UseOrderbookReturn {
  orderbook: OrderbookData;
  spreadHistory: SpreadData[];
  imbalanceSeries: ImbalancePoint[];
  depthData: DepthData[];
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
  errorMessage: string | null;
}

export default function useOrderbook(symbol: string): UseOrderbookReturn {
  const [orderbook, setOrderbook] = useState<OrderbookData>({
    bids: [],
    asks: [],
  });
  const [spreadHistory, setSpreadHistory] = useState<SpreadData[]>([]);
  const [imbalanceSeries, setImbalanceSeries] = useState<ImbalancePoint[]>([]);
  const [depthData, setDepthData] = useState<DepthData[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const orderbookRef = useRef<OrderbookData>({ bids: [], asks: [] });

  // Compute indicators
  const computeIndicators = useCallback(
    throttle((data: OrderbookData) => {
      const now = Date.now();
      const bestBid = parseFloat(data.bids[0]?.[0] ?? "0");
      const bestAsk = parseFloat(data.asks[0]?.[0] ?? "0");

      if (bestBid && bestAsk) {
        // Spread
        const spread = bestAsk - bestBid;
        const spreadPercentage = (spread / bestAsk) * 100;
        setSpreadHistory((prev) => {
          const next = [...prev, { timestamp: now, spread, spreadPercentage }];
          return next.length > 60 ? next.slice(-60) : next;
        });

        // Imbalance
        const totalBuyVolume = data.bids.reduce((sum, [, volume]) => sum + parseFloat(volume), 0);
        const totalSellVolume = data.asks.reduce((sum, [, volume]) => sum + parseFloat(volume), 0);
        const totalVolume = totalBuyVolume + totalSellVolume;

        if (totalVolume > 0) {
          const ratio = (totalBuyVolume - totalSellVolume) / totalVolume;
          const newPoint: ImbalancePoint = { time: now, imbalance: ratio };
          setImbalanceSeries(prev => {
            const newSeries = [...prev, newPoint];
            // Keep only the latest 60 points
            if (newSeries.length > 60) {
              newSeries.splice(0, newSeries.length - 60);
            }
            return newSeries;
          });
        }

        // Depth
        let bidCum = 0;
        let askCum = 0;
        const snapshot: DepthData[] = [];
        data.bids.forEach(([price, qty]) => {
          const vol = parseFloat(qty);
          bidCum += vol;
          snapshot.push({
            price,
            bidVolume: vol,
            bidTotal: bidCum,
            askVolume: 0,
            askTotal: 0,
          });
        });
        data.asks.forEach(([price, qty]) => {
          const vol = parseFloat(qty);
          askCum += vol;
          const idx = snapshot.findIndex((d) => d.price === price);
          if (idx >= 0) {
            snapshot[idx].askVolume = vol;
            snapshot[idx].askTotal = askCum;
          } else {
            snapshot.push({
              price,
              bidVolume: 0,
              bidTotal: 0,
              askVolume: vol,
              askTotal: askCum,
            });
          }
        });
        setDepthData(snapshot);
      }
    }, 1000),
    []
  );

  // Throttled state + indicator update
  const updateAll = useCallback(
    throttle((data: OrderbookData) => {
      setOrderbook(data);
      computeIndicators(data);
    }, 250),
    [computeIndicators]
  );

  // WebSocket connect: treat each message as full snapshot
  const isClosingRef = useRef(false);

const connectWebSocket = useCallback(
  (pair: string) => {
    // 1) If there’s an old socket, mark it as “closing” then close it:
    if (wsRef.current) {
      isClosingRef.current = true;
      // detach handlers so they don’t fire during shutdown
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      wsRef.current.close();
    }

    setConnectionStatus("connecting");
    setErrorMessage(null);

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${pair.toLowerCase()}@depth10@100ms`
    );

    ws.onopen = () => {
      isClosingRef.current = false;     // we’re live now
      setConnectionStatus("connected");
    };

    ws.onmessage = ({ data }) => {
      try {
        const msg = JSON.parse(data);
        const snapshot: OrderbookData = {
          bids: msg.bids,
          asks: msg.asks,
          lastUpdateId: msg.lastUpdateId,
        };
        orderbookRef.current = snapshot;
        updateAll(snapshot);
      } catch (err) {
        console.error("Parsing WS data failed", err);
      }
    };

    ws.onerror = (evt) => {
      // only treat it as a real error if we're _not_ in the middle of closing
      if (!isClosingRef.current) {
        setConnectionStatus("error");
        setErrorMessage("WebSocket error");
      }
    };

    ws.onclose = () => {
      // note: we’ll sometimes get here both during normal close _and_ after an error
      setConnectionStatus("disconnected");
    };

    wsRef.current = ws;
  },
  [updateAll]
);


  useEffect(() => {
    setOrderbook({ bids: [], asks: [] });
    setSpreadHistory([]);
    setImbalanceSeries([]);
    setDepthData([]);
    connectWebSocket(symbol);
    return () => wsRef.current?.close();
  }, [symbol, connectWebSocket]);


  return {
    orderbook,
    spreadHistory,
    imbalanceSeries,
    depthData,
    connectionStatus,
    errorMessage,
  };
}
