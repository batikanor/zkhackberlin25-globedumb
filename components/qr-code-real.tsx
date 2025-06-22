"use client"
import { useEffect, useRef } from "react"

interface QRCodeRealProps {
  value: string
  size?: number
}

export function QRCodeReal({ value, size = 256 }: QRCodeRealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current || !value) return

      try {
        // Use the qrcode library from CDN
        const QRCode = (window as any).QRCode

        if (QRCode) {
          await QRCode.toCanvas(canvasRef.current, value, {
            width: size,
            height: size,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
            errorCorrectionLevel: "M",
          })
        } else {
          // Fallback: Load QRCode library dynamically
          const script = document.createElement("script")
          script.src = "https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"
          script.onload = async () => {
            const QRCodeLib = (window as any).QRCode
            if (QRCodeLib && canvasRef.current) {
              await QRCodeLib.toCanvas(canvasRef.current, value, {
                width: size,
                height: size,
                margin: 2,
                color: {
                  dark: "#000000",
                  light: "#FFFFFF",
                },
                errorCorrectionLevel: "M",
              })
            }
          }
          document.head.appendChild(script)
        }
      } catch (error) {
        console.error("QR Code generation failed:", error)

        // Ultimate fallback: Draw a simple pattern
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.fillStyle = "#f0f0f0"
          ctx.fillRect(0, 0, size, size)
          ctx.fillStyle = "#333"
          ctx.font = "12px Arial"
          ctx.textAlign = "center"
          ctx.fillText("QR Code Error", size / 2, size / 2 - 10)
          ctx.fillText("Use URL below", size / 2, size / 2 + 10)
        }
      }
    }

    generateQR()
  }, [value, size])

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={size} height={size} className="border border-gray-200 rounded" />
    </div>
  )
}
