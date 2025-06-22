// Expanded trivia questions with various types of locations
export const TRIVIA_LOCATIONS = [
  // Famous birthplaces
  { name: "Mozart's birthplace", lat: 47.8095, lng: 13.055, country: "Austria", hint: "Salzburg, Austria" },
  {
    name: "Shakespeare's birthplace",
    lat: 52.1919,
    lng: -1.7082,
    country: "United Kingdom",
    hint: "Stratford-upon-Avon, England",
  },
  { name: "Einstein's birthplace", lat: 48.3974, lng: 9.9917, country: "Germany", hint: "Ulm, Germany" },
  { name: "Napoleon's birthplace", lat: 41.9198, lng: 8.7389, country: "France", hint: "Ajaccio, Corsica" },

  // Famous inventions/discoveries
  {
    name: "Where the telephone was invented",
    lat: 42.3601,
    lng: -71.0589,
    country: "United States",
    hint: "Boston, Massachusetts",
  },
  {
    name: "Where the World Wide Web was invented",
    lat: 46.2044,
    lng: 6.1432,
    country: "Switzerland",
    hint: "CERN, Geneva",
  },
  {
    name: "Where penicillin was discovered",
    lat: 51.5074,
    lng: -0.1278,
    country: "United Kingdom",
    hint: "London, England",
  },
  {
    name: "Where the first airplane flew",
    lat: 36.0157,
    lng: -75.6716,
    country: "United States",
    hint: "Kitty Hawk, North Carolina",
  },

  // Historical events
  { name: "Where the Berlin Wall fell", lat: 52.52, lng: 13.405, country: "Germany", hint: "Berlin, Germany" },
  {
    name: "Where the Titanic was built",
    lat: 54.5973,
    lng: -5.9301,
    country: "United Kingdom",
    hint: "Belfast, Northern Ireland",
  },
  {
    name: "Where the first Olympic Games were held",
    lat: 37.6361,
    lng: 22.7706,
    country: "Greece",
    hint: "Olympia, Greece",
  },
  { name: "Where tea was first cultivated", lat: 30.2741, lng: 120.1551, country: "China", hint: "Hangzhou, China" },

  // Famous landmarks
  {
    name: "The Great Wall of China starts here",
    lat: 40.3584,
    lng: 116.0078,
    country: "China",
    hint: "Shanhaiguan, China",
  },
  { name: "Where the Statue of Liberty was made", lat: 48.8566, lng: 2.3522, country: "France", hint: "Paris, France" },
  { name: "Where Machu Picchu is located", lat: -13.1631, lng: -72.545, country: "Peru", hint: "Cusco Region, Peru" },
  {
    name: "Where Stonehenge stands",
    lat: 51.1789,
    lng: -1.8262,
    country: "United Kingdom",
    hint: "Wiltshire, England",
  },

  // Food origins
  { name: "Where pizza was invented", lat: 40.8518, lng: 14.2681, country: "Italy", hint: "Naples, Italy" },
  { name: "Where sushi originated", lat: 35.6762, lng: 139.6503, country: "Japan", hint: "Tokyo, Japan" },
  {
    name: "Where chocolate was first used",
    lat: 19.4326,
    lng: -99.1332,
    country: "Mexico",
    hint: "Mexico City, Mexico",
  },
  { name: "Where coffee was discovered", lat: 9.145, lng: 40.4897, country: "Ethiopia", hint: "Ethiopian Highlands" },

  // Modern tech
  {
    name: "Where Google was founded",
    lat: 37.4419,
    lng: -122.143,
    country: "United States",
    hint: "Palo Alto, California",
  },
  { name: "Where IKEA was founded", lat: 56.8796, lng: 14.8095, country: "Sweden", hint: "Älmhult, Sweden" },
  { name: "Where Nokia was founded", lat: 61.4991, lng: 23.7871, country: "Finland", hint: "Tampere, Finland" },
  { name: "Where LEGO was invented", lat: 55.7308, lng: 9.1242, country: "Denmark", hint: "Billund, Denmark" },

  // Art and culture
  {
    name: "Where the Mona Lisa is displayed",
    lat: 48.8606,
    lng: 2.3376,
    country: "France",
    hint: "Louvre Museum, Paris",
  },
  { name: "Where tango was born", lat: -34.6118, lng: -58.396, country: "Argentina", hint: "Buenos Aires, Argentina" },
  { name: "Where flamenco originated", lat: 37.3891, lng: -5.9845, country: "Spain", hint: "Seville, Spain" },
  {
    name: "Where jazz was born",
    lat: 29.9511,
    lng: -90.0715,
    country: "United States",
    hint: "New Orleans, Louisiana",
  },

  // Natural wonders
  { name: "Where the Amazon River begins", lat: -15.5007, lng: -71.937, country: "Peru", hint: "Peruvian Andes" },
  {
    name: "Where diamonds were first discovered",
    lat: -28.7282,
    lng: 24.7499,
    country: "South Africa",
    hint: "Kimberley, South Africa",
  },
  {
    name: "Where the Northern Lights are best seen",
    lat: 69.6492,
    lng: 18.9553,
    country: "Norway",
    hint: "Tromsø, Norway",
  },
  {
    name: "Where the deepest ocean trench is located",
    lat: 11.3733,
    lng: 142.5917,
    country: "Pacific Ocean",
    hint: "Mariana Trench",
  },
]

// Get random trivia location
export function getRandomTrivia() {
  return TRIVIA_LOCATIONS[Math.floor(Math.random() * TRIVIA_LOCATIONS.length)]
}

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

// FIXED: Calculate points based on distance (closer = more points)
export function calculatePoints(distanceKm: number): number {
  console.log(`Distance: ${distanceKm}km`) // Debug log

  if (distanceKm < 50) return 1000
  if (distanceKm < 100) return 800
  if (distanceKm < 250) return 600
  if (distanceKm < 500) return 400
  if (distanceKm < 1000) return 200
  if (distanceKm < 2000) return 100
  return 50
}
