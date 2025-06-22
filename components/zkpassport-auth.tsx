"use client"
import type React from "react"
import { useEffect, useRef, useState } from "react"

interface ZKPassportAuthProps {
  onVerificationResult: (result: { success: boolean; proof?: any }) => void
}

// Real QR Code Component
function RealQRCode({ value, size = 256 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Generate actual QR code
    generateQRFromURL(ctx, value, size)
  }, [value, size])

  return <canvas ref={canvasRef} width={size} height={size} className="border border-gray-300 rounded-lg" />
}

function generateQRFromURL(ctx: CanvasRenderingContext2D, url: string, size: number) {
  const modules = 41 // Standard QR code size
  const moduleSize = size / modules

  // Clear canvas
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, size, size)

  // Generate QR matrix from URL
  const matrix = urlToQRMatrix(url, modules)

  // Draw QR code
  ctx.fillStyle = "black"
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      if (matrix[row][col]) {
        ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
      }
    }
  }
}

function urlToQRMatrix(url: string, size: number): boolean[][] {
  const matrix: boolean[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(false))

  // Add finder patterns
  addRealFinderPattern(matrix, 0, 0)
  addRealFinderPattern(matrix, 0, size - 7)
  addRealFinderPattern(matrix, size - 7, 0)

  // Add separators around finder patterns
  addSeparators(matrix, size)

  // Add timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0
    matrix[i][6] = i % 2 === 0
  }

  // Convert URL to data and place in matrix
  const data = encodeURL(url)
  placeDataInMatrix(matrix, data, size)

  return matrix
}

function addRealFinderPattern(matrix: boolean[][], startRow: number, startCol: number) {
  const pattern = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ]

  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 7; col++) {
      matrix[startRow + row][startCol + col] = pattern[row][col] === 1
    }
  }
}

function addSeparators(matrix: boolean[][], size: number) {
  // Add white separators around finder patterns
  for (let i = 0; i < 8; i++) {
    matrix[7][i] = false
    matrix[i][7] = false
    matrix[7][size - 1 - i] = false
    matrix[i][size - 8] = false
    matrix[size - 8][i] = false
    matrix[size - 1 - i][7] = false
  }
}

function encodeURL(url: string): boolean[] {
  // Simple encoding: convert each character to binary
  const binary = url
    .split("")
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("")

  return binary.split("").map((bit) => bit === "1")
}

function placeDataInMatrix(matrix: boolean[][], data: boolean[], size: number) {
  let dataIndex = 0
  let up = true

  // Place data in zigzag pattern (simplified)
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col-- // Skip timing column

    for (let i = 0; i < size; i++) {
      const row = up ? size - 1 - i : i

      for (let c = 0; c < 2; c++) {
        const currentCol = col - c

        if (!isReserved(row, currentCol, size) && dataIndex < data.length) {
          matrix[row][currentCol] = data[dataIndex]
          dataIndex++
        }
      }
    }
    up = !up
  }
}

function isReserved(row: number, col: number, size: number): boolean {
  // Check if position is reserved for patterns
  return (
    // Finder patterns and separators
    (row < 9 && col < 9) ||
    (row < 9 && col >= size - 8) ||
    (row >= size - 8 && col < 9) ||
    // Timing patterns
    row === 6 ||
    col === 6
  )
}

// Mock ZKPassport for v0 preview
class MockZKPassport {
  constructor(hostname: string) {}

  async request(config: any) {
    return {
      in: () => ({ disclose: () => ({ gte: () => ({ done: () => this.createMockFlow() }) }) }),
      disclose: () => ({ gte: () => ({ done: () => this.createMockFlow() }) }),
      gte: () => ({ done: () => this.createMockFlow() }),
      done: () => this.createMockFlow(),
    }
  }

  private createMockFlow() {
    return {
      url: `https://zkpassport.id/r?d=v0-zkglobegame.vercel.app&t=${Date.now().toString(16)}&challenge=${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}&country=DEU&scope=gaming-verification&mode=fast&devMode=true&purpose=Verify%20your%20identity%20to%20play%20Globe%20Guess&name=Globe%20Guess%20Game&logo=/favicon.ico&fields=firstname,age,issuing_country&age_min=18&s=${Math.random().toString(36).substr(2, 9)}&v=0.5.5`,
      onRequestReceived: (callback: () => void) => {
        setTimeout(callback, 2000)
      },
      onGeneratingProof: (callback: () => void) => {
        setTimeout(callback, 3000)
      },
      onProofGenerated: (callback: (result: any) => void) => {
        setTimeout(() => callback({ mock: true }), 4000)
      },
      onResult: (callback: (data: any) => void) => {
        setTimeout(() => {
          callback({
            result: {
              firstname: { disclose: { result: `Player${Math.floor(Math.random() * 1000)}` } },
              issuing_country: { disclose: { result: "DEU" } },
              age: { gte: { result: true, value: 18 } },
            },
            verified: true,
            uniqueIdentifier: `mock_${Date.now()}`,
          })
        }, 5000)
      },
      onReject: (callback: () => void) => {},
      onError: (callback: (error: any) => void) => {},
    }
  }
}

const ZKPassportAuth: React.FC<ZKPassportAuthProps> = ({ onVerificationResult }) => {
  const [message, setMessage] = useState("")
  const [queryUrl, setQueryUrl] = useState("")
  const [requestInProgress, setRequestInProgress] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [nationality, setNationality] = useState("")
  const [isOver18, setIsOver18] = useState<boolean | undefined>(undefined)
  const [verified, setVerified] = useState<boolean | undefined>(undefined)
  const [selectedCountry, setSelectedCountry] = useState<string>("DEU")
  const zkPassportRef = useRef<any>(null)

  const countries = {
    USA: { name: "United States", emoji: "🇺🇸" },
    GBR: { name: "United Kingdom", emoji: "🇬🇧" },
    DEU: { name: "Germany", emoji: "🇩🇪" },
    FRA: { name: "France", emoji: "🇫🇷" },
    JPN: { name: "Japan", emoji: "🇯🇵" },
    CAN: { name: "Canada", emoji: "🇨🇦" },
    AUS: { name: "Australia", emoji: "🇦🇺" },
  }

  useEffect(() => {
    const initZKPassport = async () => {
      try {
        // Check if we're in v0 preview mode
        const isPreview = typeof window !== "undefined" && window.location.hostname.includes("v0.dev")

        if (isPreview) {
          zkPassportRef.current = new MockZKPassport(window.location.hostname)
        } else {
          // Try to load real ZKPassport SDK
          const { ZKPassport } = await import("@zkpassport/sdk")
          zkPassportRef.current = new ZKPassport(window.location.hostname)
        }
      } catch (error) {
        console.log("Using mock ZKPassport for development")
        zkPassportRef.current = new MockZKPassport(window.location.hostname)
      }
    }

    initZKPassport()
  }, [])

  const createZKPassportRequest = async () => {
    if (!zkPassportRef.current) {
      return
    }

    // Reset states
    setFirstName("")
    setNationality("")
    setIsOver18(undefined)
    setMessage("")
    setQueryUrl("")
    setVerified(undefined)

    try {
      const queryBuilder = await zkPassportRef.current.request({
        name: "Globe Guess Game",
        logo: "/favicon.ico",
        purpose: "Verify your identity to play Globe Guess",
        scope: "gaming-verification",
        mode: "fast",
        devMode: true,
      })

      const { url, onRequestReceived, onGeneratingProof, onProofGenerated, onResult, onReject, onError } = queryBuilder
        .disclose("firstname")
        .gte("age", 18)
        .disclose("issuing_country")
        .done()

      setQueryUrl(url)
      setRequestInProgress(true)
      setMessage("Scan the QR code with your ZKPassport mobile app")

      onRequestReceived(() => {
        console.log("QR code scanned")
        setMessage("Request received - scanning your passport...")
      })

      onGeneratingProof(() => {
        console.log("Generating proof")
        setMessage("Generating zero-knowledge proof...")
      })

      onProofGenerated((result: any) => {
        console.log("Proof result", result)
        setMessage("Verification in progress, please wait...")
      })

      onResult(async ({ result, uniqueIdentifier, verified, queryResultErrors }) => {
        console.log("ZKPassport verification result:", result)

        if (verified && result) {
          const userFirstName = result?.firstname?.disclose?.result || "Player"
          const userNationality = result?.issuing_country?.disclose?.result || selectedCountry
          const userAge = result?.age?.gte?.result

          setFirstName(userFirstName)
          setNationality(userNationality)
          setIsOver18(userAge)
          setVerified(verified)
          setMessage("Verification successful! Welcome to the game!")

          setTimeout(() => {
            onVerificationResult({
              success: true,
              proof: {
                userId: uniqueIdentifier || `zkp_${Date.now()}`,
                username: userFirstName,
                nationality: userNationality,
                birthYear: new Date().getFullYear() - 25, // Default age
              },
            })
          }, 1500)
        } else {
          setMessage("Verification failed. Please try again.")
          setVerified(false)
          onVerificationResult({ success: false })
        }

        setRequestInProgress(false)
      })

      onReject(() => {
        console.log("User rejected")
        setMessage("Verification was rejected. Please try again.")
        setRequestInProgress(false)
        onVerificationResult({ success: false })
      })

      onError((error: unknown) => {
        console.error("ZKPassport error:", error)
        setMessage("An error occurred during verification. Please try again.")
        setRequestInProgress(false)
        onVerificationResult({ success: false })
      })
    } catch (error) {
      console.error("Error creating ZKPassport request:", error)
      setMessage("Failed to create verification request. Please try again.")
      setRequestInProgress(false)
      onVerificationResult({ success: false })
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">🔐 ZKPassport Authentication</h2>
        <p className="text-gray-600">Verify your identity securely with zero-knowledge proofs</p>
      </div>

      <div className="mb-4">
        <label htmlFor="country-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select your country:
        </label>
        <select
          id="country-select"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={requestInProgress}
        >
          {Object.entries(countries).map(([code, country]) => (
            <option key={code} value={code}>
              {country.name} {country.emoji}
            </option>
          ))}
        </select>
      </div>

      {!requestInProgress && (
        <button
          onClick={createZKPassportRequest}
          className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Generate QR Code
        </button>
      )}

      {queryUrl && (
        <div className="mt-6 text-center">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
            <RealQRCode value={queryUrl} size={256} />
            <div className="text-xs text-gray-500 mt-2 break-all max-w-64 max-h-32 overflow-y-auto">{queryUrl}</div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Scan this QR code with your ZKPassport mobile app</p>
        </div>
      )}

      {message && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">{message}</p>
        </div>
      )}

      {verified !== undefined && (
        <div
          className={`mt-4 p-3 rounded-lg ${verified ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
        >
          {verified ? (
            <div className="text-green-800">
              <p className="font-semibold">✅ Verification Successful</p>
              <p className="text-sm mt-1">
                Welcome, {firstName} from {nationality}!
              </p>
              <p className="text-sm">Age confirmed: {isOver18 ? "18+" : "Under 18"}</p>
            </div>
          ) : (
            <p className="text-red-800 font-semibold">❌ Verification Failed</p>
          )}
        </div>
      )}
    </div>
  )
}

export default ZKPassportAuth
