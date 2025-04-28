"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Maximize2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExpandableCardProps {
  title: string
  description: string
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export default function ExpandableCard({
  title,
  description,
  children,
  className,
  contentClassName,
}: ExpandableCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Card className={cn("flex-1 min-h-0 flex flex-col relative", className)}>
        <CardHeader className="pb-1 flex flex-row items-start justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <CardTitle className="text-lg font-medium ">{title}</CardTitle>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="max-w-xs">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <button
            onClick={() => setIsOpen(true)}
            className="p-1 rounded-md hover:bg-muted transition-colors"
            aria-label="Expand to full screen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent className={cn("flex-grow overflow-hidden", contentClassName)}>{children}</CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[90vw] max-w-[1200px] h-[90vh] max-h-[900px] p-0">
          <DialogHeader className="p-6">
            <DialogTitle>{title}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </DialogHeader>
          <div className="p-6 pt-2 h-full overflow-auto">{children}</div>
        </DialogContent>
      </Dialog>
    </>
  )
}

