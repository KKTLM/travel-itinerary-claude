import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CitySuggestionsRequest {
  destCountry: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { destCountry }: CitySuggestionsRequest = await req.json()

    if (!destCountry) {
      return new Response(
        JSON.stringify({ error: 'destCountry is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get city suggestions for the destination country
    const cities = getCitySuggestions(destCountry);

    return new Response(
      JSON.stringify({ success: true, cities }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error getting city suggestions:', error)
    
    return new Response(
      JSON.stringify({ error: 'Failed to get city suggestions' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function getCitySuggestions(country: string): string[] {
  // City suggestions database - in a real app, this would come from Gemini AI
  const cityDatabase: Record<string, string[]> = {
    'France': ['Paris', 'Lyon', 'Marseille', 'Nice', 'Bordeaux', 'Strasbourg', 'Toulouse', 'Nantes'],
    'Italy': ['Rome', 'Milan', 'Venice', 'Florence', 'Naples', 'Turin', 'Bologna', 'Palermo'],
    'Spain': ['Madrid', 'Barcelona', 'Seville', 'Valencia', 'Bilbao', 'Granada', 'Salamanca', 'Toledo'],
    'Germany': ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt', 'Dresden', 'Heidelberg', 'Rothenburg'],
    'United Kingdom': ['London', 'Edinburgh', 'Manchester', 'Liverpool', 'Bath', 'Oxford', 'Cambridge', 'York'],
    'Greece': ['Athens', 'Thessaloniki', 'Mykonos', 'Santorini', 'Crete', 'Rhodes', 'Corfu', 'Delphi'],
    'Portugal': ['Lisbon', 'Porto', 'Sintra', 'Óbidos', 'Aveiro', 'Braga', 'Coimbra', 'Évora'],
    'Japan': ['Tokyo', 'Kyoto', 'Osaka', 'Hiroshima', 'Nara', 'Yokohama', 'Kobe', 'Nikko'],
    'Thailand': ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Krabi', 'Ayutthaya', 'Sukhothai', 'Kanchanaburi'],
    'Indonesia': ['Jakarta', 'Bali', 'Yogyakarta', 'Bandung', 'Surabaya', 'Medan', 'Lombok', 'Flores'],
    'Vietnam': ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Hoi An', 'Nha Trang', 'Hue', 'Sapa', 'Ha Long'],
    'South Korea': ['Seoul', 'Busan', 'Jeju', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Gyeongju'],
    'China': ['Beijing', 'Shanghai', 'Xi\'an', 'Guangzhou', 'Chengdu', 'Hangzhou', 'Suzhou', 'Guilin'],
    'India': ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Jaipur', 'Agra', 'Goa'],
    'United States': ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Las Vegas', 'Boston', 'Seattle'],
    'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Quebec City', 'Winnipeg', 'Halifax'],
    'Mexico': ['Mexico City', 'Cancun', 'Guadalajara', 'Puerto Vallarta', 'Playa del Carmen', 'Oaxaca', 'Merida', 'Tulum'],
    'Brazil': ['Rio de Janeiro', 'São Paulo', 'Salvador', 'Brasília', 'Fortaleza', 'Recife', 'Manaus', 'Florianópolis'],
    'Argentina': ['Buenos Aires', 'Córdoba', 'Mendoza', 'Rosario', 'Salta', 'Bariloche', 'Mar del Plata', 'Ushuaia'],
    'Peru': ['Lima', 'Cusco', 'Arequipa', 'Trujillo', 'Iquitos', 'Huacachina', 'Paracas', 'Chachapoyas'],
    'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Cairns', 'Darwin'],
    'New Zealand': ['Auckland', 'Wellington', 'Christchurch', 'Queenstown', 'Rotorua', 'Taupo', 'Dunedin', 'Hamilton'],
    'South Africa': ['Cape Town', 'Johannesburg', 'Durban', 'Port Elizabeth', 'Bloemfontein', 'Pretoria', 'Knysna', 'Hermanus'],
    'Morocco': ['Marrakech', 'Casablanca', 'Fez', 'Rabat', 'Chefchaouen', 'Essaouira', 'Meknes', 'Tangier'],
    'Egypt': ['Cairo', 'Alexandria', 'Luxor', 'Aswan', 'Hurghada', 'Sharm El Sheikh', 'Dahab', 'Siwa'],
    'Kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Malindi', 'Lamu', 'Watamu']
  };

  // Return cities for the specified country, or generic suggestions if not found
  const cities = cityDatabase[country];
  
  if (cities) {
    // Return top 6 cities for the country
    return cities.slice(0, 6);
  } else {
    // Return generic suggestions for unknown countries
    return ['Capital City', 'Historic Town', 'Coastal City', 'Mountain Resort', 'Cultural Center', 'Modern District'];
  }
}