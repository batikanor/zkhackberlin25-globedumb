"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function DatabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<string>("Testing...")
  const [envVars, setEnvVars] = useState<{ url?: string; key?: string }>({})

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Check environment variables
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        setEnvVars({
          url: url ? `${url.substring(0, 20)}...` : "MISSING",
          key: key ? `${key.substring(0, 20)}...` : "MISSING",
        })

        if (!url || !key) {
          setConnectionStatus("❌ Environment variables missing")
          return
        }

        // Test basic connection
        const { data, error } = await supabase.from("users").select("count", { count: "exact", head: true })

        if (error) {
          setConnectionStatus(`❌ Database error: ${error.message}`)
        } else {
          setConnectionStatus(`✅ Database connected! Users table accessible.`)
        }
      } catch (err) {
        setConnectionStatus(`❌ Connection failed: ${err}`)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-yellow-800 mb-2">🔍 Database Connection Test</h3>
      <div className="text-sm space-y-1">
        <div>Status: {connectionStatus}</div>
        <div>Supabase URL: {envVars.url}</div>
        <div>Supabase Key: {envVars.key}</div>
      </div>
    </div>
  )
}
