// Supabase client configuration and authentication
class SupabaseClient {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.init();
    }

    init() {
        // Initialize Supabase client
        // In a real app, these would come from environment variables
        const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'your-supabase-url';
        const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
        
        if (supabaseUrl && supabaseKey && supabaseUrl !== 'your-supabase-url') {
            this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
            this.setupAuthListener();
            this.checkCurrentUser();
        } else {
            console.warn('Supabase not configured. Using local storage fallback.');
            this.setupMockAuth();
        }
    }

    setupMockAuth() {
        // Mock authentication for demo purposes
        const mockUser = localStorage.getItem('mock_user');
        if (mockUser) {
            this.currentUser = JSON.parse(mockUser);
            this.notifyAuthChange(this.currentUser);
        }
    }

    async setupAuthListener() {
        if (!this.supabase) return;

        const { data: { session } } = await this.supabase.auth.getSession();
        if (session?.user) {
            this.currentUser = session.user;
            this.notifyAuthChange(this.currentUser);
        }

        this.supabase.auth.onAuthStateChange((event, session) => {
            this.currentUser = session?.user || null;
            this.notifyAuthChange(this.currentUser);
            
            if (event === 'SIGNED_OUT') {
                this.handleSignOut();
            }
        });
    }

    async checkCurrentUser() {
        if (!this.supabase) return;

        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            this.currentUser = user;
            this.notifyAuthChange(user);
        } catch (error) {
            console.error('Error checking current user:', error);
        }
    }

    notifyAuthChange(user) {
        // Notify other parts of the app about auth state changes
        window.dispatchEvent(new CustomEvent('authStateChange', { 
            detail: { user } 
        }));
    }

    async signUp(email, password) {
        if (!this.supabase) {
            // Mock signup for demo
            if (!email || !password) {
                return { user: null, error: 'Please enter both email and password' };
            }
            
            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return { user: null, error: 'Please enter a valid email address' };
            }
            
            if (password.length < 6) {
                return { user: null, error: 'Password must be at least 6 characters long' };
            }
            
            // Check if user already exists in mock storage
            const existingUser = localStorage.getItem('mock_user');
            if (existingUser) {
                const user = JSON.parse(existingUser);
                if (user.email === email) {
                    return { user: null, error: 'An account with this email already exists' };
                }
            }
            
            // Simulate a brief delay like a real API call
            await new Promise(resolve => setTimeout(resolve, 1800));
            
            const mockUser = {
                id: Date.now().toString(),
                email: email,
                created_at: new Date().toISOString()
            };
            localStorage.setItem('mock_user', JSON.stringify(mockUser));
            this.currentUser = mockUser;
            this.notifyAuthChange(mockUser);
            return { user: mockUser, error: null };
        }

        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin
                }
            });

            if (error) throw error;
            return { user: data.user, error: null };
        } catch (error) {
            console.error('Signup error:', error);
            
            // Provide more user-friendly error messages
            let errorMessage = error.message;
            if (error.message.includes('User already registered')) {
                errorMessage = 'An account with this email already exists. Please sign in instead.';
            } else if (error.message.includes('Password should be at least')) {
                errorMessage = 'Password must be at least 6 characters long.';
            } else if (error.message.includes('Invalid email')) {
                errorMessage = 'Please enter a valid email address.';
            }
            
            return { user: null, error: errorMessage };
        }
    }

    async signIn(email, password) {
        if (!this.supabase) {
            // Mock signin for demo
            if (!email || !password) {
                return { user: null, error: 'Please enter both email and password' };
            }
            
            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return { user: null, error: 'Please enter a valid email address' };
            }
            
            if (password.length < 6) {
                return { user: null, error: 'Password must be at least 6 characters long' };
            }
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1200));
            
            const mockUser = {
                id: Date.now().toString(),
                email: email,
                created_at: new Date().toISOString()
            };
            localStorage.setItem('mock_user', JSON.stringify(mockUser));
            this.currentUser = mockUser;
            this.notifyAuthChange(mockUser);
            return { user: mockUser, error: null };
        }

        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            return { user: data.user, error: null };
        } catch (error) {
            console.error('Signin error:', error);
            
            // Provide more user-friendly error messages
            let errorMessage = error.message;
            if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'Invalid email or password. Please check your credentials and try again.';
            } else if (error.message.includes('Email not confirmed')) {
                errorMessage = 'Please check your email and click the confirmation link before signing in.';
            } else if (error.message.includes('Too many requests')) {
                errorMessage = 'Too many login attempts. Please wait a moment and try again.';
            }
            
            return { user: null, error: errorMessage };
        }
    }

    async signOut() {
        if (!this.supabase) {
            // Mock signout
            localStorage.removeItem('mock_user');
            this.currentUser = null;
            this.notifyAuthChange(null);
            return { error: null };
        }

        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Signout error:', error);
            return { error: error.message };
        }
    }

    handleSignOut() {
        // Clear any cached data
        localStorage.removeItem('travelai_saved_trips');
        
        // Redirect to home if on protected pages
        if (window.location.hash.includes('dashboard') || window.location.hash.includes('trip-builder')) {
            window.travelApp?.navigateToSection('home');
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    // Database operations for trips
    async saveTrip(tripData) {
        if (!this.isAuthenticated()) {
            throw new Error('User must be authenticated to save trips');
        }

        if (!this.supabase) {
            // Fallback to local storage
            return window.storageManager.saveTrip({
                ...tripData,
                created_by: this.currentUser.id
            });
        }

        try {
            // First, insert the trip
            const { data: trip, error: tripError } = await this.supabase
                .from('trips')
                .insert({
                    name: `Trip to ${tripData.destCountry}`,
                    start_date: tripData.startDate,
                    end_date: this.calculateEndDate(tripData.startDate, tripData.duration),
                    created_by: this.currentUser.id
                })
                .select()
                .single();

            if (tripError) throw tripError;

            // Create trip days
            const tripDays = [];
            for (let i = 0; i < tripData.duration; i++) {
                const dayDate = new Date(tripData.startDate);
                dayDate.setDate(dayDate.getDate() + i);
                
                const { data: day, error: dayError } = await this.supabase
                    .from('trip_days')
                    .insert({
                        trip_id: trip.id,
                        date: dayDate.toISOString().split('T')[0]
                    })
                    .select()
                    .single();

                if (dayError) throw dayError;
                tripDays.push(day);
            }

            // Create trip items for each day
            if (tripData.itinerary?.days) {
                for (let i = 0; i < tripData.itinerary.days.length; i++) {
                    const dayData = tripData.itinerary.days[i];
                    const tripDay = tripDays[i];

                    if (dayData.activities) {
                        for (let j = 0; j < dayData.activities.length; j++) {
                            const activity = dayData.activities[j];
                            
                            await this.supabase
                                .from('trip_items')
                                .insert({
                                    day_id: tripDay.id,
                                    title: activity.title,
                                    type: 'activity',
                                    note: activity.description,
                                    order: j
                                });
                        }
                    }
                }
            }

            return trip;
        } catch (error) {
            console.error('Error saving trip to database:', error);
            throw error;
        }
    }

    async getUserTrips() {
        if (!this.isAuthenticated()) {
            return [];
        }

        if (!this.supabase) {
            // Fallback to local storage
            const trips = window.storageManager.getSavedTrips();
            return trips.filter(trip => trip.created_by === this.currentUser.id);
        }

        try {
            const { data: trips, error } = await this.supabase
                .from('trips')
                .select(`
                    *,
                    trip_days (
                        *,
                        trip_items (*)
                    )
                `)
                .eq('created_by', this.currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform database format to app format
            return trips.map(trip => this.transformTripFromDB(trip));
        } catch (error) {
            console.error('Error fetching user trips:', error);
            return [];
        }
    }

    async deleteTrip(tripId) {
        if (!this.isAuthenticated()) {
            throw new Error('User must be authenticated to delete trips');
        }

        if (!this.supabase) {
            return window.storageManager.deleteTrip(tripId);
        }

        try {
            const { error } = await this.supabase
                .from('trips')
                .delete()
                .eq('id', tripId)
                .eq('created_by', this.currentUser.id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting trip:', error);
            throw error;
        }
    }

    transformTripFromDB(dbTrip) {
        // Transform database trip format to app format
        const days = dbTrip.trip_days.map(day => ({
            day: day.date,
            city: 'City', // You might want to store this in the database
            activities: day.trip_items.map(item => ({
                id: item.id,
                title: item.title,
                description: item.note || '',
                time: '9:00 AM', // Default time, you might want to store this
                duration: '1 hour',
                location: 'Location',
                status: 'planned'
            }))
        }));

        return {
            id: dbTrip.id,
            destCountry: dbTrip.name.replace('Trip to ', ''),
            startDate: dbTrip.start_date,
            duration: dbTrip.trip_days.length,
            travellers: { adults: 2, kids: 0 }, // Default values
            cities: ['City'], // Default value
            interestTags: [],
            itinerary: { days },
            createdAt: dbTrip.created_at,
            created_by: dbTrip.created_by
        };
    }

    calculateEndDate(startDate, duration) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + duration - 1);
        return endDate.toISOString().split('T')[0];
    }
}

// Initialize Supabase client
window.supabaseClient = new SupabaseClient();