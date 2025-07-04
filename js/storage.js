// Local storage management for saved trips
class StorageManager {
    constructor() {
        this.storageKey = 'travelai_saved_trips';
        this.init();
    }

    init() {
        // Ensure localStorage is available
        if (!this.isLocalStorageAvailable()) {
            console.warn('localStorage is not available. Trip saving will be disabled.');
            return;
        }

        // Initialize storage if it doesn't exist
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }

        // Clean up old trips (optional - remove trips older than 6 months)
        this.cleanupOldTrips();
    }

    isLocalStorageAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    saveTrip(trip) {
        if (!this.isLocalStorageAvailable()) {
            throw new Error('Local storage is not available');
        }

        try {
            const trips = this.getSavedTrips();
            
            // Check if trip already exists (update if it does)
            const existingIndex = trips.findIndex(t => t.id === trip.id);
            
            if (existingIndex !== -1) {
                trips[existingIndex] = { ...trip, updatedAt: new Date().toISOString() };
            } else {
                trips.unshift(trip); // Add to beginning of array
            }

            // Limit to maximum 50 saved trips
            if (trips.length > 50) {
                trips.splice(50);
            }

            localStorage.setItem(this.storageKey, JSON.stringify(trips));
            return true;
        } catch (error) {
            console.error('Error saving trip:', error);
            throw new Error('Failed to save trip');
        }
    }

    getSavedTrips() {
        if (!this.isLocalStorageAvailable()) {
            return [];
        }

        try {
            const trips = localStorage.getItem(this.storageKey);
            return trips ? JSON.parse(trips) : [];
        } catch (error) {
            console.error('Error loading saved trips:', error);
            return [];
        }
    }

    getTrip(tripId) {
        const trips = this.getSavedTrips();
        return trips.find(trip => trip.id === tripId);
    }

    deleteTrip(tripId) {
        if (!this.isLocalStorageAvailable()) {
            throw new Error('Local storage is not available');
        }

        try {
            const trips = this.getSavedTrips();
            const filteredTrips = trips.filter(trip => trip.id !== tripId);
            
            localStorage.setItem(this.storageKey, JSON.stringify(filteredTrips));
            return true;
        } catch (error) {
            console.error('Error deleting trip:', error);
            throw new Error('Failed to delete trip');
        }
    }

    updateTrip(tripId, updates) {
        if (!this.isLocalStorageAvailable()) {
            throw new Error('Local storage is not available');
        }

        try {
            const trips = this.getSavedTrips();
            const tripIndex = trips.findIndex(trip => trip.id === tripId);
            
            if (tripIndex === -1) {
                throw new Error('Trip not found');
            }

            trips[tripIndex] = {
                ...trips[tripIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem(this.storageKey, JSON.stringify(trips));
            return trips[tripIndex];
        } catch (error) {
            console.error('Error updating trip:', error);
            throw new Error('Failed to update trip');
        }
    }

    searchTrips(query) {
        const trips = this.getSavedTrips();
        const lowercaseQuery = query.toLowerCase();
        
        return trips.filter(trip => 
            trip.destination.toLowerCase().includes(lowercaseQuery) ||
            trip.interests.some(interest => 
                interest.toLowerCase().includes(lowercaseQuery)
            )
        );
    }

    getTripsByDestination(destination) {
        const trips = this.getSavedTrips();
        return trips.filter(trip => 
            trip.destination.toLowerCase() === destination.toLowerCase()
        );
    }

    getTripStats() {
        const trips = this.getSavedTrips();
        
        if (trips.length === 0) {
            return {
                totalTrips: 0,
                totalDays: 0,
                favoriteDestinations: [],
                favoriteInterests: []
            };
        }

        // Calculate statistics
        const totalDays = trips.reduce((sum, trip) => sum + trip.duration, 0);
        
        // Count destinations
        const destinationCounts = {};
        trips.forEach(trip => {
            destinationCounts[trip.destination] = (destinationCounts[trip.destination] || 0) + 1;
        });
        
        // Count interests
        const interestCounts = {};
        trips.forEach(trip => {
            trip.interests.forEach(interest => {
                interestCounts[interest] = (interestCounts[interest] || 0) + 1;
            });
        });

        // Sort and get top items
        const favoriteDestinations = Object.entries(destinationCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([destination, count]) => ({ destination, count }));

        const favoriteInterests = Object.entries(interestCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([interest, count]) => ({ interest, count }));

        return {
            totalTrips: trips.length,
            totalDays,
            favoriteDestinations,
            favoriteInterests
        };
    }

    exportTrips() {
        const trips = this.getSavedTrips();
        const dataStr = JSON.stringify(trips, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `travelai_trips_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
    }

    importTrips(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importedTrips = JSON.parse(e.target.result);
                    
                    if (!Array.isArray(importedTrips)) {
                        throw new Error('Invalid file format');
                    }

                    // Validate trip structure
                    const validTrips = importedTrips.filter(trip => 
                        trip.id && trip.destination && trip.duration && trip.itinerary
                    );

                    if (validTrips.length === 0) {
                        throw new Error('No valid trips found in file');
                    }

                    // Merge with existing trips
                    const existingTrips = this.getSavedTrips();
                    const mergedTrips = [...existingTrips];

                    validTrips.forEach(importedTrip => {
                        const existingIndex = mergedTrips.findIndex(t => t.id === importedTrip.id);
                        if (existingIndex === -1) {
                            mergedTrips.push({
                                ...importedTrip,
                                importedAt: new Date().toISOString()
                            });
                        }
                    });

                    localStorage.setItem(this.storageKey, JSON.stringify(mergedTrips));
                    resolve(validTrips.length);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    clearAllTrips() {
        if (!this.isLocalStorageAvailable()) {
            throw new Error('Local storage is not available');
        }

        try {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
            return true;
        } catch (error) {
            console.error('Error clearing trips:', error);
            throw new Error('Failed to clear trips');
        }
    }

    cleanupOldTrips() {
        try {
            const trips = this.getSavedTrips();
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const recentTrips = trips.filter(trip => {
                const tripDate = new Date(trip.createdAt);
                return tripDate > sixMonthsAgo;
            });

            if (recentTrips.length !== trips.length) {
                localStorage.setItem(this.storageKey, JSON.stringify(recentTrips));
                console.log(`Cleaned up ${trips.length - recentTrips.length} old trips`);
            }
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    getStorageUsage() {
        if (!this.isLocalStorageAvailable()) {
            return { used: 0, available: 0, percentage: 0 };
        }

        try {
            const trips = localStorage.getItem(this.storageKey);
            const used = new Blob([trips || '']).size;
            
            // Estimate available storage (most browsers allow ~5-10MB)
            const estimated = 5 * 1024 * 1024; // 5MB estimate
            const percentage = (used / estimated) * 100;

            return {
                used: Math.round(used / 1024), // KB
                available: Math.round(estimated / 1024), // KB
                percentage: Math.round(percentage)
            };
        } catch (error) {
            console.error('Error calculating storage usage:', error);
            return { used: 0, available: 0, percentage: 0 };
        }
    }
}

// Initialize storage manager
window.storageManager = new StorageManager();