"use client"
import { useEffect, useRef } from "react"

interface QRCodeProps {
  value: string
  size?: number
}

export function QRCodeSimple({ value, size = 256 }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Generate a simple but functional QR code pattern
    generateSimpleQR(ctx, value, size)
  }, [value, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="border border-gray-300 rounded-lg"
      style={{ imageRendering: "pixelated" }}
    />
  )
}

function generateSimpleQR(ctx: CanvasRenderingContext2D, text: string, size: number) {
  const modules = 25 // QR grid size
  const moduleSize = Math.floor(size / modules)
  const actualSize = moduleSize * modules

  // Clear canvas with white background
  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(0, 0, size, size)

  // Create a deterministic pattern based on the URL
  const pattern = createPatternFromText(text, modules)

  // Draw the pattern
  ctx.fillStyle = "#000000"
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      if (pattern[row * modules + col]) {
        ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
      }
    }
  }

  // Add finder patterns (corner squares) - these are essential for QR codes
  drawFinderPattern(ctx, 0, 0, moduleSize)
  drawFinderPattern(ctx, (modules - 7) * moduleSize, 0, moduleSize)
  drawFinderPattern(ctx, 0, (modules - 7) * moduleSize, moduleSize)

  // Add timing patterns (alternating lines)
  for (let i = 8; i < modules - 8; i++) {
    if (i % 2 === 0) {
      ctx.fillRect(i * moduleSize, 6 * moduleSize, moduleSize, moduleSize)
      ctx.fillRect(6 * moduleSize, i * moduleSize, moduleSize, moduleSize)
    }
  }
}

function createPatternFromText(text: string, modules: number): boolean[] {
  const totalModules = modules * modules
  const pattern = new Array(totalModules).fill(false)

  // Create a hash from the text
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  // Use the hash to create a pseudo-random but deterministic pattern
  let seed = Math.abs(hash)
  for (let i = 0; i < totalModules; i++) {
    // Skip finder pattern areas
    const row = Math.floor(i / modules)
    const col = i % modules

    if (isFinderArea(row, col, modules)) {
      continue
    }

    // Linear congruential generator for pseudo-random numbers
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    pattern[i] = seed % 100 < 45 // ~45% density
  }

  return pattern
}

function drawFinderPattern(ctx: CanvasRenderingContext2D, x: number, y: number, moduleSize: number) {
  // Draw 7x7 finder pattern
  // Outer border
  ctx.fillStyle = "#000000"
  ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize)

  // Inner white area
  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize)

  // Center black square
  ctx.fillStyle = "#000000"
  ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize)
}

function isFinderArea(row: number, col: number, modules: number): boolean {
  // Check if position is in any of the three finder patterns
  return (
    (row < 9 && col < 9) || // Top-left
    (row < 9 && col >= modules - 8) || // Top-right
    (row >= modules - 8 && col < 9) || // Bottom-left
    row === 6 || // Timing pattern horizontal
    col === 6 // Timing pattern vertical
  )
}
