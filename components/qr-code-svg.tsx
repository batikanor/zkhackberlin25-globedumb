"use client"
import { useEffect, useState } from "react"

interface QRCodeSVGProps {
  value: string
  size?: number
}

export function QRCodeSVG({ value, size = 256 }: QRCodeSVGProps) {
  const [qrSvg, setQrSvg] = useState<string>("")

  useEffect(() => {
    const generateQRSVG = async () => {
      try {
        // Use QR Server API to generate real QR code
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&format=svg&ecc=M&margin=1`

        const response = await fetch(qrUrl)
        const svgText = await response.text()
        setQrSvg(svgText)
      } catch (error) {
        console.error("Failed to generate QR code:", error)
        // Fallback to a simple message
        setQrSvg(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="white"/>
          <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontFamily="Arial" fontSize="12" fill="black">
            QR Code Failed to Load
          </text>
        </svg>`)
      }
    }

    if (value) {
      generateQRSVG()
    }
  }, [value, size])

  if (!qrSvg) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded"
        style={{ width: size, height: size }}
      >
        <div className="text-gray-500 text-sm">Loading QR...</div>
      </div>
    )
  }

  return (
    <div
      className="qr-code-container"
      dangerouslySetInnerHTML={{ __html: qrSvg }}
      style={{ width: size, height: size }}
    />
  )
}
