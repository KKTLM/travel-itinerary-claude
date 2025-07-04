import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ItineraryRequest {
  departureCity: string;
  destCountry: string;
  startDate: string;
  duration: number;
  travellers: { adults: number; kids: number };
  cities: string[];
  interestTags: string[];
}

interface DayPlan {
  day: number;
  city: string;
  title: string;
  lat?: number;
  lng?: number;
  snippet: string;
  activities: Activity[];
}

interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  duration: string;
  location: string;
  status: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      departureCity, 
      destCountry, 
      startDate, 
      duration, 
      travellers, 
      cities, 
      interestTags 
    }: ItineraryRequest = await req.json()

    // Validate required fields
    if (!departureCity || !destCountry || !startDate || !duration || !cities.length) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate itinerary using Gemini AI (mock implementation)
    const itinerary = await generateItineraryWithGemini({
      departureCity,
      destCountry,
      startDate,
      duration,
      travellers,
      cities,
      interestTags
    });

    return new Response(
      JSON.stringify({ success: true, itinerary }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error generating itinerary:', error)
    
    return new Response(
      JSON.stringify({ error: 'Failed to generate itinerary' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function generateItineraryWithGemini(params: ItineraryRequest): Promise<{ days: DayPlan[] }> {
  // In a real implementation, this would call the Gemini API
  // For now, we'll generate a mock itinerary based on the parameters
  
  const { duration, cities, interestTags, travellers } = params;
  const days: DayPlan[] = [];

  for (let i = 0; i < duration; i++) {
    const dayNumber = i + 1;
    const city = cities[i % cities.length];
    
    // Generate activities based on interests and day
    const activities = generateDayActivities(dayNumber, city, interestTags, travellers);
    
    days.push({
      day: dayNumber,
      city: city,
      title: `Day ${dayNumber} in ${city}`,
      snippet: `Explore the best of ${city} with curated activities`,
      activities: activities
    });
  }

  return { days };
}

function generateDayActivities(
  dayNumber: number, 
  city: string, 
  interests: string[], 
  travellers: { adults: number; kids: number }
): Activity[] {
  const activities: Activity[] = [];
  const timeSlots = ['9:00 AM', '11:30 AM', '2:00 PM', '4:30 PM', '7:00 PM'];
  
  // Activity templates based on interests
  const activityTemplates = {
    culture: [
      { title: 'Historic Walking Tour', description: 'Explore ancient landmarks and cultural sites', duration: '2.5 hours' },
      { title: 'Local Museum Visit', description: 'Discover art, history, and local heritage', duration: '2 hours' },
      { title: 'Traditional Architecture Tour', description: 'Marvel at historic buildings and monuments', duration: '1.5 hours' }
    ],
    food: [
      { title: 'Local Food Market', description: 'Taste authentic street food and local delicacies', duration: '1.5 hours' },
      { title: 'Cooking Class', description: 'Learn to prepare traditional dishes', duration: '3 hours' },
      { title: 'Restaurant Experience', description: 'Fine dining at a renowned local restaurant', duration: '2 hours' }
    ],
    adventure: [
      { title: 'Outdoor Adventure', description: 'Hiking, climbing, or water sports activity', duration: '4 hours' },
      { title: 'City Bike Tour', description: 'Explore the city on two wheels', duration: '3 hours' },
      { title: 'Adventure Park', description: 'Thrilling activities and challenges', duration: '2.5 hours' }
    ],
    beach: [
      { title: 'Beach Relaxation', description: 'Unwind on pristine sandy beaches', duration: '3 hours' },
      { title: 'Water Sports', description: 'Surfing, snorkeling, or diving adventure', duration: '2.5 hours' },
      { title: 'Sunset Beach Walk', description: 'Romantic stroll along the coastline', duration: '1 hour' }
    ],
    relax: [
      { title: 'Spa Treatment', description: 'Rejuvenating massage and wellness therapy', duration: '2 hours' },
      { title: 'Garden Visit', description: 'Peaceful walk through botanical gardens', duration: '1.5 hours' },
      { title: 'Meditation Session', description: 'Mindfulness and relaxation practice', duration: '1 hour' }
    ],
    nightlife: [
      { title: 'Local Bar Crawl', description: 'Experience the vibrant nightlife scene', duration: '3 hours' },
      { title: 'Live Music Venue', description: 'Enjoy local bands and performances', duration: '2.5 hours' },
      { title: 'Night Market', description: 'Shop and dine at bustling evening markets', duration: '2 hours' }
    ]
  };

  // Default activities if no interests specified
  const defaultActivities = [
    { title: 'City Exploration', description: 'Discover the main attractions and landmarks', duration: '2 hours' },
    { title: 'Local Experience', description: 'Immerse yourself in local culture and traditions', duration: '1.5 hours' },
    { title: 'Scenic Viewpoint', description: 'Enjoy panoramic views of the city', duration: '1 hour' },
    { title: 'Shopping District', description: 'Browse local shops and markets', duration: '2 hours' },
    { title: 'Café Culture', description: 'Relax at a local café with great atmosphere', duration: '1 hour' }
  ];

  // Select activity templates based on interests
  const availableTemplates = interests.length > 0 
    ? interests.flatMap(interest => activityTemplates[interest as keyof typeof activityTemplates] || [])
    : defaultActivities;

  timeSlots.forEach((time, index) => {
    const template = availableTemplates[index % availableTemplates.length];
    
    activities.push({
      id: `${dayNumber}-${index + 1}`,
      time: time,
      title: template.title,
      description: template.description,
      duration: template.duration,
      location: `${city} Center`,
      status: 'planned'
    });
  });

  return activities;
}