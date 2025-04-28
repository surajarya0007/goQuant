"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useState } from "react"

const tradingPairs = [
  { value: "btcusdt", label: "BTC/USDT" },
  { value: "ethusdt", label: "ETH/USDT" },
  { value: "xrpusdt", label: "XRP/USDT" },
  { value: "solusdt", label: "SOL/USDT" },
  { value: "adausdt", label: "ADA/USDT" },
  { value: "bnbusdt", label: "BNB/USDT" },
  { value: "dogeusdt", label: "DOGE/USDT" },
  { value: "dotusdt", label: "DOT/USDT" },
]

interface TradingPairSelectorProps {
  value: string
  onChange: (value: string) => void
}

export default function TradingPairSelector({ value, onChange }: TradingPairSelectorProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
          {value ? tradingPairs.find((pair) => pair.value === value)?.label : "Select pair..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search trading pair..." />
          <CommandList>
            <CommandEmpty>No trading pair found.</CommandEmpty>
            <CommandGroup>
              {tradingPairs.map((pair) => (
                <CommandItem
                  key={pair.value}
                  value={pair.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === pair.value ? "opacity-100" : "opacity-0")} />
                  {pair.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
