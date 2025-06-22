"use client"
import { useEffect, useRef } from "react"

interface QRCodeProps {
  value: string
  size?: number
}

export function QRCode({ value, size = 256 }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return

    // Simple QR code generation using a library-free approach
    // In production, you'd use a proper QR library like 'qrcode'
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, size, size)

    // Generate a simple pattern for demo
    // In real implementation, this would be proper QR encoding
    const moduleSize = size / 25
    ctx.fillStyle = "black"

    // Create a simple QR-like pattern
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        // Create a pattern based on the URL hash
        const hash = value.split("").reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0)
          return a & a
        }, 0)

        if ((hash + i * j) % 3 === 0) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize)
        }
      }
    }

    // Add finder patterns (corners)
    const drawFinderPattern = (x: number, y: number) => {
      ctx.fillStyle = "black"
      ctx.fillRect(x, y, moduleSize * 7, moduleSize * 7)
      ctx.fillStyle = "white"
      ctx.fillRect(x + moduleSize, y + moduleSize, moduleSize * 5, moduleSize * 5)
      ctx.fillStyle = "black"
      ctx.fillRect(x + moduleSize * 2, y + moduleSize * 2, moduleSize * 3, moduleSize * 3)
    }

    drawFinderPattern(0, 0) // Top-left
    drawFinderPattern(0, size - moduleSize * 7) // Bottom-left
    drawFinderPattern(size - moduleSize * 7, 0) // Top-right
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
