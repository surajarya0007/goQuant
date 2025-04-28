import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals)
}

export function formatCurrency(value: number, decimals = 2): string {
  return `$${formatNumber(value, decimals)}`
}

export function formatPercentage(value: number, decimals = 2): string {
  return `${formatNumber(value, decimals)}%`
}
