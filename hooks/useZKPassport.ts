"use client"
import { useEffect, useState } from "react"

// Real ZKPassport integration
interface ZKCredential {
  userId: string
  username?: string
  nationality?: string
  birthYear?: number
}

interface ZKPassportOptions {
  projectId: string
}

interface CredentialRequest {
  statement: string
}

class RealZKPassport {
  private projectId: string

  constructor(options: ZKPassportOptions) {
    this.projectId = options.projectId
  }

  async requestCredential(request: CredentialRequest): Promise<ZKCredential | null> {
    // In preview mode, use mock. In production, this will use real ZKPassport
    if (typeof window !== "undefined" && window.location.hostname.includes("v0.dev")) {
      // Mock for v0 preview
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockUser: ZKCredential = {
            userId: `user_${Date.now()}`,
            username: `Player${Math.floor(Math.random() * 1000)}`,
            nationality: "Unknown",
            birthYear: 1990 + Math.floor(Math.random() * 30),
          }
          resolve(mockUser)
        }, 1000)
      })
    }

    // Real ZKPassport implementation for production
    try {
      const { ZKPassport } = await import("@zkpassport/sdk")
      const zkPassport = new ZKPassport(window.location.hostname)

      const queryBuilder = await zkPassport.request({
        name: "Globe Guess Game",
        logo: "/favicon.ico",
        purpose: request.statement,
        scope: "gaming-verification",
        mode: "fast",
        devMode: process.env.NODE_ENV === "development",
      })

      return new Promise((resolve, reject) => {
        const { onResult, onReject, onError } = queryBuilder
          .disclose("firstname")
          .gte("age", 13)
          .disclose("issuing_country")
          .done()

        onResult(({ result, verified }) => {
          if (verified && result) {
            const credential: ZKCredential = {
              userId: `zkp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              username: result.firstname?.disclose?.result || "Player",
              nationality: result.issuing_country?.disclose?.result || "Unknown",
              birthYear: new Date().getFullYear() - (result.age?.gte?.value || 20),
            }
            resolve(credential)
          } else {
            resolve(null)
          }
        })

        onReject(() => resolve(null))
        onError((error) => {
          console.error("ZKPassport error:", error)
          resolve(null)
        })
      })
    } catch (error) {
      console.error("ZKPassport SDK not available:", error)
      return null
    }
  }
}

export function useZKPassport() {
  const [passport, setPassport] = useState<RealZKPassport | null>(null)

  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_ZKPASSPORT_PROJECT_ID || "globe-guess-game"

    const zk = new RealZKPassport({
      projectId,
    })
    setPassport(zk)
  }, [])

  return passport
}
