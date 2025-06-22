// Famous cities and landmarks for the guessing game
export const GAME_LOCATIONS = [
  { name: "Paris, France", lat: 48.8566, lng: 2.3522, country: "France" },
  { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, country: "Japan" },
  { name: "New York, USA", lat: 40.7128, lng: -74.006, country: "United States" },
  { name: "London, UK", lat: 51.5074, lng: -0.1278, country: "United Kingdom" },
  { name: "Sydney, Australia", lat: -33.8688, lng: 151.2093, country: "Australia" },
  { name: "Rio de Janeiro, Brazil", lat: -22.9068, lng: -43.1729, country: "Brazil" },
  { name: "Cairo, Egypt", lat: 30.0444, lng: 31.2357, country: "Egypt" },
  { name: "Mumbai, India", lat: 19.076, lng: 72.8777, country: "India" },
  { name: "Moscow, Russia", lat: 55.7558, lng: 37.6176, country: "Russia" },
  { name: "Cape Town, South Africa", lat: -33.9249, lng: 18.4241, country: "South Africa" },
  { name: "Beijing, China", lat: 39.9042, lng: 116.4074, country: "China" },
  { name: "Mexico City, Mexico", lat: 19.4326, lng: -99.1332, country: "Mexico" },
  { name: "Istanbul, Turkey", lat: 41.0082, lng: 28.9784, country: "Turkey" },
  { name: "Buenos Aires, Argentina", lat: -34.6118, lng: -58.396, country: "Argentina" },
  { name: "Bangkok, Thailand", lat: 13.7563, lng: 100.5018, country: "Thailand" },
]

// Calculate distance between two points using Haversine formula
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

// Calculate points based on distance (closer = more points)
export function calculatePoints(distanceKm: number): number {
  if (distanceKm < 50) return 1000
  if (distanceKm < 100) return 800
  if (distanceKm < 250) return 600
  if (distanceKm < 500) return 400
  if (distanceKm < 1000) return 200
  if (distanceKm < 2000) return 100
  return 50
}

// Get random location for the game
export function getRandomLocation() {
  return GAME_LOCATIONS[Math.floor(Math.random() * GAME_LOCATIONS.length)]
}
