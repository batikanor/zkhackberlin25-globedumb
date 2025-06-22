"use client"
import type React from "react"
import { useEffect, useRef, useState } from "react"

interface ZKPassportAuthProps {
  onVerificationResult: (result: { success: boolean; proof?: any }) => void
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
      url: `zkpassport://verify?mock=true&t=${Date.now()}`,
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
              issuing_country: { disclose: { result: "USA" } },
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
  const [selectedCountry, setSelectedCountry] = useState<string>("USA")
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
            <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              {/* QR Code would be rendered here */}
              <div className="text-center">
                <div className="text-6xl mb-2">📱</div>
                <div className="text-sm text-gray-600">QR Code</div>
                <div className="text-xs text-gray-500 mt-2 break-all">{queryUrl.substring(0, 30)}...</div>
              </div>
            </div>
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
