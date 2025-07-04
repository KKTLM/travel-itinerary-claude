// Itinerary generation logic
class ItineraryGenerator {
    constructor() {
        this.destinations = this.loadDestinationData();
        this.activities = this.loadActivityData();
    }

    async generateItinerary(formData) {
        const { destination, duration, budget, travelers, interests, additional } = formData;
        
        // Get destination-specific data
        const destinationData = this.getDestinationData(destination);
        
        // Generate daily activities
        const days = [];
        for (let i = 0; i < duration; i++) {
            const dayActivities = this.generateDayActivities(
                destinationData, 
                interests, 
                budget, 
                i + 1, 
                duration
            );
            days.push({ activities: dayActivities });
        }

        // Generate tips
        const tips = this.generateTips(destinationData, interests, budget, travelers);

        return {
            destination,
            duration,
            days,
            tips,
            estimatedCost: this.calculateEstimatedCost(days, budget, travelers)
        };
    }

    getDestinationData(destination) {
        // Normalize destination name
        const normalizedDestination = destination.toLowerCase().trim();
        
        // Check if we have specific data for this destination
        const specificData = this.destinations[normalizedDestination];
        if (specificData) {
            return specificData;
        }

        // Return generic destination data
        return this.destinations.generic;
    }

    generateDayActivities(destinationData, interests, budget, dayNumber, totalDays) {
        const activities = [];
        const timeSlots = [
            { time: '9:00 AM', type: 'morning' },
            { time: '11:30 AM', type: 'morning' },
            { time: '1:00 PM', type: 'afternoon' },
            { time: '3:30 PM', type: 'afternoon' },
            { time: '6:00 PM', type: 'evening' },
            { time: '8:00 PM', type: 'evening' }
        ];

        // Determine day theme based on interests and day number
        const dayTheme = this.getDayTheme(interests, dayNumber, totalDays);
        
        timeSlots.forEach((slot, index) => {
            const activity = this.selectActivity(
                destinationData, 
                dayTheme, 
                slot.type, 
                budget, 
                index
            );
            
            if (activity) {
                activities.push({
                    time: slot.time,
                    ...activity
                });
            }
        });

        return activities;
    }

    getDayTheme(interests, dayNumber, totalDays) {
        // First day: arrival and orientation
        if (dayNumber === 1) {
            return 'arrival';
        }
        
        // Last day: departure preparation
        if (dayNumber === totalDays) {
            return 'departure';
        }

        // Middle days: rotate through interests
        const themes = interests.length > 0 ? interests : ['culture', 'food', 'nature'];
        return themes[(dayNumber - 2) % themes.length];
    }

    selectActivity(destinationData, theme, timeOfDay, budget, slotIndex) {
        const availableActivities = destinationData.activities.filter(activity => {
            return activity.themes.includes(theme) && 
                   activity.timeOfDay.includes(timeOfDay) &&
                   activity.budget.includes(budget);
        });

        if (availableActivities.length === 0) {
            // Fallback to generic activities
            return this.getGenericActivity(theme, timeOfDay, budget, slotIndex);
        }

        // Select random activity from available options
        const randomIndex = Math.floor(Math.random() * availableActivities.length);
        return availableActivities[randomIndex];
    }

    getGenericActivity(theme, timeOfDay, budget, slotIndex) {
        const genericActivities = {
            morning: [
                {
                    title: 'Local Market Visit',
                    description: 'Explore the vibrant local market and experience authentic culture',
                    duration: '2 hours',
                    cost: budget === 'budget' ? 'Free' : '$10-20',
                    location: 'City Center'
                },
                {
                    title: 'Walking Tour',
                    description: 'Discover the city\'s history and hidden gems on foot',
                    duration: '2.5 hours',
                    cost: budget === 'budget' ? '$5-10' : '$15-25',
                    location: 'Historic District'
                }
            ],
            afternoon: [
                {
                    title: 'Museum Visit',
                    description: 'Immerse yourself in local art and history',
                    duration: '2 hours',
                    cost: budget === 'budget' ? '$5-15' : '$20-30',
                    location: 'Cultural District'
                },
                {
                    title: 'Local Restaurant',
                    description: 'Enjoy authentic local cuisine at a recommended restaurant',
                    duration: '1.5 hours',
                    cost: budget === 'budget' ? '$10-20' : budget === 'mid-range' ? '$25-40' : '$50-80',
                    location: 'Restaurant District'
                }
            ],
            evening: [
                {
                    title: 'Sunset Viewing',
                    description: 'Watch the sunset from a scenic viewpoint',
                    duration: '1 hour',
                    cost: 'Free',
                    location: 'Scenic Overlook'
                },
                {
                    title: 'Local Entertainment',
                    description: 'Experience local nightlife and entertainment',
                    duration: '2-3 hours',
                    cost: budget === 'budget' ? '$10-20' : '$30-50',
                    location: 'Entertainment District'
                }
            ]
        };

        const activities = genericActivities[timeOfDay] || genericActivities.afternoon;
        return activities[slotIndex % activities.length];
    }

    generateTips(destinationData, interests, budget, travelers) {
        const tips = [];
        
        // Budget-specific tips
        if (budget === 'budget') {
            tips.push('Look for free walking tours and public events');
            tips.push('Eat at local markets for authentic and affordable meals');
            tips.push('Use public transportation to save money');
        } else if (budget === 'luxury') {
            tips.push('Consider hiring a private guide for personalized experiences');
            tips.push('Make reservations at high-end restaurants in advance');
            tips.push('Book spa treatments and premium experiences');
        }

        // Traveler-specific tips
        if (travelers === '1') {
            tips.push('Join group tours to meet other travelers');
            tips.push('Stay in social accommodations like hostels or guesthouses');
        } else if (travelers.includes('+')) {
            tips.push('Book group discounts for attractions and tours');
            tips.push('Consider vacation rentals for larger groups');
        }

        // Interest-specific tips
        if (interests.includes('food')) {
            tips.push('Try street food for authentic local flavors');
            tips.push('Ask locals for restaurant recommendations');
        }
        
        if (interests.includes('culture')) {
            tips.push('Visit during local festivals for cultural immersion');
            tips.push('Learn basic phrases in the local language');
        }

        if (interests.includes('photography')) {
            tips.push('Wake up early for the best lighting conditions');
            tips.push('Research Instagram-worthy spots in advance');
        }

        // General tips
        tips.push('Download offline maps before exploring');
        tips.push('Keep copies of important documents');
        tips.push('Check local weather forecasts daily');
        tips.push('Respect local customs and dress codes');

        return tips.slice(0, 6); // Return max 6 tips
    }

    calculateEstimatedCost(days, budget, travelers) {
        const budgetRanges = {
            'budget': { min: 30, max: 50 },
            'mid-range': { min: 75, max: 150 },
            'luxury': { min: 200, max: 400 }
        };

        const range = budgetRanges[budget];
        const dailyCost = (range.min + range.max) / 2;
        const totalDays = days.length;
        
        // Adjust for number of travelers
        const travelerMultiplier = travelers === '1' ? 1 : 
                                 travelers === '2' ? 1.8 : 
                                 travelers.includes('3-4') ? 3.2 : 4.5;

        const totalCost = dailyCost * totalDays * travelerMultiplier;
        
        return {
            perPerson: Math.round(dailyCost * totalDays),
            total: Math.round(totalCost),
            currency: 'USD'
        };
    }

    loadDestinationData() {
        return {
            // Popular destinations with specific data
            'paris': {
                activities: [
                    {
                        title: 'Eiffel Tower Visit',
                        description: 'Iconic landmark with breathtaking city views',
                        duration: '2 hours',
                        cost: '$15-25',
                        location: 'Champ de Mars',
                        themes: ['culture', 'photography'],
                        timeOfDay: ['morning', 'afternoon', 'evening'],
                        budget: ['budget', 'mid-range', 'luxury']
                    },
                    {
                        title: 'Louvre Museum',
                        description: 'World\'s largest art museum with famous masterpieces',
                        duration: '3 hours',
                        cost: '$20-30',
                        location: '1st Arrondissement',
                        themes: ['culture', 'art'],
                        timeOfDay: ['morning', 'afternoon'],
                        budget: ['mid-range', 'luxury']
                    },
                    {
                        title: 'Seine River Cruise',
                        description: 'Romantic boat ride along the historic Seine River',
                        duration: '1.5 hours',
                        cost: '$15-35',
                        location: 'Seine River',
                        themes: ['relaxation', 'photography'],
                        timeOfDay: ['afternoon', 'evening'],
                        budget: ['budget', 'mid-range', 'luxury']
                    }
                ]
            },
            'tokyo': {
                activities: [
                    {
                        title: 'Senso-ji Temple',
                        description: 'Ancient Buddhist temple in traditional Asakusa district',
                        duration: '2 hours',
                        cost: 'Free',
                        location: 'Asakusa',
                        themes: ['culture', 'photography'],
                        timeOfDay: ['morning', 'afternoon'],
                        budget: ['budget', 'mid-range', 'luxury']
                    },
                    {
                        title: 'Tsukiji Fish Market',
                        description: 'Famous fish market with fresh sushi and seafood',
                        duration: '2 hours',
                        cost: '$20-40',
                        location: 'Tsukiji',
                        themes: ['food', 'culture'],
                        timeOfDay: ['morning'],
                        budget: ['budget', 'mid-range', 'luxury']
                    },
                    {
                        title: 'Shibuya Crossing',
                        description: 'World\'s busiest pedestrian crossing',
                        duration: '1 hour',
                        cost: 'Free',
                        location: 'Shibuya',
                        themes: ['culture', 'photography'],
                        timeOfDay: ['afternoon', 'evening'],
                        budget: ['budget', 'mid-range', 'luxury']
                    }
                ]
            },
            'new york': {
                activities: [
                    {
                        title: 'Central Park Walk',
                        description: 'Peaceful stroll through Manhattan\'s green oasis',
                        duration: '2 hours',
                        cost: 'Free',
                        location: 'Central Park',
                        themes: ['nature', 'relaxation'],
                        timeOfDay: ['morning', 'afternoon'],
                        budget: ['budget', 'mid-range', 'luxury']
                    },
                    {
                        title: 'Broadway Show',
                        description: 'World-class theater performance in the Theater District',
                        duration: '3 hours',
                        cost: '$75-200',
                        location: 'Theater District',
                        themes: ['culture', 'entertainment'],
                        timeOfDay: ['evening'],
                        budget: ['mid-range', 'luxury']
                    },
                    {
                        title: 'Brooklyn Bridge Walk',
                        description: 'Iconic bridge with stunning city skyline views',
                        duration: '1.5 hours',
                        cost: 'Free',
                        location: 'Brooklyn Bridge',
                        themes: ['photography', 'culture'],
                        timeOfDay: ['morning', 'afternoon', 'evening'],
                        budget: ['budget', 'mid-range', 'luxury']
                    }
                ]
            },
            // Generic destination for unknown locations
            'generic': {
                activities: [
                    {
                        title: 'City Walking Tour',
                        description: 'Explore the main attractions and learn about local history',
                        duration: '3 hours',
                        cost: '$15-25',
                        location: 'City Center',
                        themes: ['culture', 'photography'],
                        timeOfDay: ['morning', 'afternoon'],
                        budget: ['budget', 'mid-range', 'luxury']
                    },
                    {
                        title: 'Local Market Visit',
                        description: 'Experience authentic local culture and try regional specialties',
                        duration: '2 hours',
                        cost: '$10-30',
                        location: 'Market District',
                        themes: ['food', 'culture'],
                        timeOfDay: ['morning', 'afternoon'],
                        budget: ['budget', 'mid-range', 'luxury']
                    },
                    {
                        title: 'Scenic Viewpoint',
                        description: 'Visit the best viewpoint for panoramic city or landscape views',
                        duration: '1.5 hours',
                        cost: 'Free-$10',
                        location: 'Scenic Area',
                        themes: ['photography', 'nature'],
                        timeOfDay: ['afternoon', 'evening'],
                        budget: ['budget', 'mid-range', 'luxury']
                    }
                ]
            }
        };
    }

    loadActivityData() {
        // Additional activity templates that can be mixed and matched
        return {
            cultural: [
                'Visit local museums and galleries',
                'Explore historic neighborhoods',
                'Attend cultural performances',
                'Take architecture tours',
                'Visit religious sites and temples'
            ],
            food: [
                'Food walking tours',
                'Cooking classes',
                'Local restaurant experiences',
                'Street food exploration',
                'Wine or beer tastings'
            ],
            adventure: [
                'Hiking and nature walks',
                'Water sports activities',
                'Cycling tours',
                'Rock climbing or zip-lining',
                'Adventure park visits'
            ],
            relaxation: [
                'Spa and wellness treatments',
                'Beach or lakeside relaxation',
                'Meditation and yoga sessions',
                'Scenic picnics',
                'Leisurely boat rides'
            ]
        };
    }
}

// Initialize the itinerary generator
window.itineraryGenerator = new ItineraryGenerator();