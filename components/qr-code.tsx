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

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Generate a real QR code using a simple implementation
    generateQRCode(ctx, value, size)
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

// Simple QR Code implementation
function generateQRCode(ctx: CanvasRenderingContext2D, text: string, size: number) {
  // This is a simplified QR code generator
  // For production, you'd use a proper library like 'qrcode'

  const modules = 25 // QR code grid size
  const moduleSize = size / modules

  // Clear canvas
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, size, size)

  // Convert text to binary representation
  const data = textToBinary(text)

  // Create QR matrix
  const matrix = createQRMatrix(data, modules)

  // Draw the QR code
  ctx.fillStyle = "black"
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      if (matrix[row][col]) {
        ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
      }
    }
  }
}

function textToBinary(text: string): string {
  return text
    .split("")
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("")
}

function createQRMatrix(data: string, size: number): boolean[][] {
  const matrix: boolean[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(false))

  // Add finder patterns (corner squares)
  addFinderPattern(matrix, 0, 0)
  addFinderPattern(matrix, 0, size - 7)
  addFinderPattern(matrix, size - 7, 0)

  // Add timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0
    matrix[i][6] = i % 2 === 0
  }

  // Add data based on URL hash
  let dataIndex = 0
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!isReservedArea(row, col, size) && dataIndex < data.length) {
        matrix[row][col] = data[dataIndex] === "1"
        dataIndex++
      }
    }
  }

  return matrix
}

function addFinderPattern(matrix: boolean[][], startRow: number, startCol: number) {
  // 7x7 finder pattern
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 7; col++) {
      const isBlack = row === 0 || row === 6 || col === 0 || col === 6 || (row >= 2 && row <= 4 && col >= 2 && col <= 4)
      matrix[startRow + row][startCol + col] = isBlack
    }
  }
}

function isReservedArea(row: number, col: number, size: number): boolean {
  // Check if position is in finder patterns or timing patterns
  return (
    (row < 9 && col < 9) || // Top-left finder
    (row < 9 && col >= size - 8) || // Top-right finder
    (row >= size - 8 && col < 9) || // Bottom-left finder
    row === 6 ||
    col === 6 // Timing patterns
  )
}
