"use client"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { generateQRCode } from "@/lib/qrcode"

interface ZKPassportAuthProps {
  onVerificationResult: (result: { success: boolean; proof?: any }) => void
}

// Real QR Code Component using proper QR generation
function RealQRCode({ value, size = 256 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return

    try {
      generateQRCode(canvasRef.current, value, {
        size,
        margin: 4,
        darkColor: "#000000",
        lightColor: "#FFFFFF",
      })
    } catch (error) {
      console.error("QR Code generation error:", error)
      // Fallback to simple pattern if QR generation fails
      const ctx = canvasRef.current.getContext("2d")
      if (ctx) {
        ctx.fillStyle = "#f0f0f0"
        ctx.fillRect(0, 0, size, size)
        ctx.fillStyle = "#333"
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.fillText("QR Code", size / 2, size / 2)
      }
    }
  }, [value, size])

  return <canvas ref={canvasRef} width={size} height={size} className="border border-gray-300 rounded-lg" />
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
    ITA: { name: "Italy", emoji: "🇮🇹" },
    ESP: { name: "Spain", emoji: "🇪🇸" },
    BRA: { name: "Brazil", emoji: "🇧🇷" },
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

  const handleQuickMockLogin = () => {
    const countryNames = {
      USA: "United States",
      GBR: "United Kingdom",
      DEU: "Germany",
      FRA: "France",
      JPN: "Japan",
      CAN: "Canada",
      AUS: "Australia",
      ITA: "Italy",
      ESP: "Spain",
      BRA: "Brazil",
    }

    const mockUser = {
      userId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: `Player${Math.floor(Math.random() * 1000)}`,
      nationality: countryNames[selectedCountry as keyof typeof countryNames] || "Unknown",
      birthYear: 1990 + Math.floor(Math.random() * 25),
    }

    console.log("Quick mock login:", mockUser)
    onVerificationResult({ success: true, proof: mockUser })
  }

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

      <div className="space-y-3">
        {!requestInProgress && (
          <>
            <button
              onClick={createZKPassportRequest}
              className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Generate QR Code
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button
              onClick={handleQuickMockLogin}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🚀 Quick Mock Login
            </button>
            <p className="text-xs text-gray-500 text-center">Skip ZKPassport and login instantly for testing</p>
          </>
        )}
      </div>

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
