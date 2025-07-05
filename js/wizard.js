// Wizard state
let currentStep = 1;
const totalSteps = 7;
let wizardData = {};

// Make functions globally accessible
window.startWizard = startWizard;
window.nextStep = nextStep;
window.previousStep = previousStep;
window.skipWizard = skipWizard;
window.updateCounter = updateCounter;

function startWizard() {
    // Hide other sections
    document.getElementById('home').classList.add('hidden');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('trip-builder').classList.add('hidden');
    
    // Show wizard section
    document.getElementById('wizard').classList.remove('hidden');
    
    // Reset wizard state
    currentStep = 1;
    wizardData = {};
    
    // Initialize wizard
    initializeWizard();
    updateProgress();
    showStep(currentStep);
}

function initializeWizard() {
    // Initialize progress dots
    const progressDots = document.getElementById('progressDots');
    progressDots.innerHTML = '';
    
    for (let i = 1; i <= totalSteps; i++) {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        if (i === 1) dot.classList.add('active');
        progressDots.appendChild(dot);
    }
    
    // Set up autocomplete for countries
    setupCountryAutocomplete();
    
    // Set up autocomplete for cities
    setupCityAutocomplete();
    
    // Set up duration controls
    setupDurationControls();
    
    // Set up interest chips
    setupInterestChips();
    
    // Set minimum date to today
    const startDateInput = document.getElementById('startDate');
    if (startDateInput) {
        const today = new Date().toISOString().split('T')[0];
        startDateInput.min = today;
    }
}

function setupCountryAutocomplete() {
    const input = document.getElementById('destCountry');
    const suggestions = document.getElementById('countrySuggestions');
    
    if (!input || !suggestions) return;
    
    const countries = [
        'France', 'Italy', 'Spain', 'Germany', 'United Kingdom', 'Greece', 'Portugal',
        'Japan', 'Thailand', 'Indonesia', 'Vietnam', 'South Korea', 'China', 'India',
        'United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Peru',
        'Australia', 'New Zealand', 'South Africa', 'Morocco', 'Egypt', 'Kenya'
    ];
    
    input.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        suggestions.innerHTML = '';
        
        if (value.length > 0) {
            const filtered = countries.filter(country => 
                country.toLowerCase().includes(value)
            );
            
            if (filtered.length > 0) {
                suggestions.style.display = 'block';
                filtered.slice(0, 5).forEach(country => {
                    const item = document.createElement('div');
                    item.className = 'suggestion-item';
                    item.textContent = country;
                    item.addEventListener('click', function() {
                        input.value = country;
                        suggestions.style.display = 'none';
                        wizardData.destCountry = country;
                    });
                    suggestions.appendChild(item);
                });
            } else {
                suggestions.style.display = 'none';
            }
        } else {
            suggestions.style.display = 'none';
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !suggestions.contains(e.target)) {
            suggestions.style.display = 'none';
        }
    });
}

function setupCityAutocomplete() {
    const input = document.getElementById('departureCity');
    const suggestions = document.getElementById('citySuggestions');
    
    if (!input || !suggestions) return;
    
    const cities = [
        'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
        'London', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Amsterdam',
        'Tokyo', 'Seoul', 'Bangkok', 'Singapore', 'Hong Kong', 'Mumbai',
        'Sydney', 'Melbourne', 'Toronto', 'Vancouver', 'Montreal'
    ];
    
    input.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        suggestions.innerHTML = '';
        
        if (value.length > 0) {
            const filtered = cities.filter(city => 
                city.toLowerCase().includes(value)
            );
            
            if (filtered.length > 0) {
                suggestions.style.display = 'block';
                filtered.slice(0, 5).forEach(city => {
                    const item = document.createElement('div');
                    item.className = 'suggestion-item';
                    item.textContent = city;
                    item.addEventListener('click', function() {
                        input.value = city;
                        suggestions.style.display = 'none';
                        wizardData.departureCity = city;
                    });
                    suggestions.appendChild(item);
                });
            } else {
                suggestions.style.display = 'none';
            }
        } else {
            suggestions.style.display = 'none';
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !suggestions.contains(e.target)) {
            suggestions.style.display = 'none';
        }
    });
}

function setupDurationControls() {
    const slider = document.getElementById('durationSlider');
    const number = document.getElementById('durationNumber');
    
    if (!slider || !number) return;
    
    slider.addEventListener('input', function() {
        number.value = this.value;
        wizardData.duration = parseInt(this.value);
    });
    
    number.addEventListener('input', function() {
        slider.value = this.value;
        wizardData.duration = parseInt(this.value);
    });
}

function setupInterestChips() {
    const chips = document.querySelectorAll('.interest-chip');
    
    chips.forEach(chip => {
        chip.addEventListener('click', function() {
            this.classList.toggle('selected');
            
            const interest = this.dataset.interest;
            if (!wizardData.interestTags) {
                wizardData.interestTags = [];
            }
            
            if (this.classList.contains('selected')) {
                if (!wizardData.interestTags.includes(interest)) {
                    wizardData.interestTags.push(interest);
                }
            } else {
                wizardData.interestTags = wizardData.interestTags.filter(tag => tag !== interest);
            }
        });
    });
}

function nextStep() {
    if (!validateCurrentStep()) {
        return;
    }
    
    if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
        updateProgress();
        
        // Load cities for step 6
        if (currentStep === 6) {
            loadCitySuggestions();
        }
    } else {
        // Generate itinerary
        generateItinerary();
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        updateProgress();
    }
}

function skipWizard() {
    // Navigate to manual trip creation
    if (typeof showTripBuilder === 'function') {
        showTripBuilder();
    } else {
        // Fallback to dashboard
        showDashboard();
    }
}

function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            const destCountry = document.getElementById('destCountry').value;
            if (!destCountry) {
                alert('Please select a destination country');
                return false;
            }
            wizardData.destCountry = destCountry;
            break;
            
        case 2:
            const departureCity = document.getElementById('departureCity').value;
            if (!departureCity) {
                alert('Please enter your departure city');
                return false;
            }
            wizardData.departureCity = departureCity;
            break;
            
        case 3:
            const startDate = document.getElementById('startDate').value;
            if (!startDate) {
                alert('Please select your departure date');
                return false;
            }
            wizardData.startDate = startDate;
            break;
            
        case 4:
            const duration = document.getElementById('durationNumber').value;
            if (!duration || duration < 2) {
                alert('Please select a trip duration of at least 2 days');
                return false;
            }
            wizardData.duration = parseInt(duration);
            break;
            
        case 5:
            const adults = parseInt(document.getElementById('adultsCount').textContent);
            const kids = parseInt(document.getElementById('kidsCount').textContent);
            wizardData.travellers = { adults, kids };
            break;
            
        case 6:
            const selectedCities = document.querySelectorAll('.city-chip.selected');
            if (selectedCities.length === 0) {
                alert('Please select at least one city to visit');
                return false;
            }
            wizardData.cities = Array.from(selectedCities).map(chip => chip.textContent);
            break;
            
        case 7:
            // Interests are optional
            break;
    }
    
    return true;
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.wizard-step').forEach(stepEl => {
        stepEl.classList.remove('active');
    });
    
    // Show current step
    const currentStepEl = document.querySelector(`[data-step="${step}"]`);
    if (currentStepEl) {
        currentStepEl.classList.add('active');
    }
    
    // Update navigation buttons
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (backBtn) {
        backBtn.disabled = step === 1;
    }
    
    if (nextBtn) {
        if (step === totalSteps) {
            nextBtn.innerHTML = '<span>Generate Itinerary</span><i class="fas fa-magic"></i>';
            nextBtn.classList.add('generating');
        } else {
            nextBtn.innerHTML = 'Next<i class="fas fa-arrow-right"></i>';
            nextBtn.classList.remove('generating');
        }
    }
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressDots = document.querySelectorAll('.progress-dot');
    const currentStepSpan = document.getElementById('currentStep');
    
    if (progressFill) {
        const percentage = (currentStep / totalSteps) * 100;
        progressFill.style.width = `${percentage}%`;
    }
    
    if (currentStepSpan) {
        currentStepSpan.textContent = currentStep;
    }
    
    // Update dots
    progressDots.forEach((dot, index) => {
        dot.classList.remove('active', 'completed');
        if (index + 1 < currentStep) {
            dot.classList.add('completed');
        } else if (index + 1 === currentStep) {
            dot.classList.add('active');
        }
    });
}

function updateCounter(type, delta) {
    const countElement = document.getElementById(`${type}Count`);
    if (!countElement) return;
    
    let currentValue = parseInt(countElement.textContent);
    let newValue = currentValue + delta;
    
    // Ensure minimum values
    if (type === 'adults' && newValue < 1) newValue = 1;
    if (type === 'kids' && newValue < 0) newValue = 0;
    
    countElement.textContent = newValue;
}

async function loadCitySuggestions() {
    const loadingEl = document.getElementById('loadingCities');
    const gridEl = document.getElementById('citiesGrid');
    
    if (!loadingEl || !gridEl) return;
    
    loadingEl.style.display = 'flex';
    gridEl.innerHTML = '';
    
    try {
        // Call the suggest-cities edge function
        const response = await fetch(`${supabaseUrl}/functions/v1/suggest-cities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseAnonKey}`
            },
            body: JSON.stringify({
                destCountry: wizardData.destCountry
            })
        });
        
        const data = await response.json();
        
        if (data.success && data.cities) {
            loadingEl.style.display = 'none';
            
            data.cities.forEach(city => {
                const chip = document.createElement('div');
                chip.className = 'city-chip';
                chip.textContent = city;
                chip.addEventListener('click', function() {
                    this.classList.toggle('selected');
                });
                gridEl.appendChild(chip);
            });
        } else {
            throw new Error('Failed to load city suggestions');
        }
    } catch (error) {
        console.error('Error loading cities:', error);
        loadingEl.style.display = 'none';
        
        // Show fallback cities
        const fallbackCities = ['Capital City', 'Historic Town', 'Coastal City', 'Mountain Resort'];
        fallbackCities.forEach(city => {
            const chip = document.createElement('div');
            chip.className = 'city-chip';
            chip.textContent = city;
            chip.addEventListener('click', function() {
                this.classList.toggle('selected');
            });
            gridEl.appendChild(chip);
        });
    }
}

async function generateItinerary() {
    // Show loading modal
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) {
        loadingModal.classList.remove('hidden');
        animateLoadingSteps();
    }
    
    try {
        // Call the generate-itinerary edge function
        const response = await fetch(`${supabaseUrl}/functions/v1/generate-itinerary`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseAnonKey}`
            },
            body: JSON.stringify(wizardData)
        });
        
        const data = await response.json();
        
        if (data.success && data.itinerary) {
            // Save trip to database if user is authenticated
            if (window.supabaseClient && window.currentUser) {
                await saveTripToDatabase(data.itinerary);
            } else {
                // Save to local storage for non-authenticated users
                localStorage.setItem('currentTrip', JSON.stringify({
                    ...wizardData,
                    itinerary: data.itinerary
                }));
            }
            
            // Hide loading modal
            if (loadingModal) {
                loadingModal.classList.add('hidden');
            }
            
            // Show confetti
            if (typeof triggerConfetti === 'function') {
                triggerConfetti();
            }
            
            // Navigate to trip builder
            setTimeout(() => {
                showTripBuilder(data.itinerary);
            }, 1000);
            
        } else {
            throw new Error('Failed to generate itinerary');
        }
    } catch (error) {
        console.error('Error generating itinerary:', error);
        
        // Hide loading modal
        if (loadingModal) {
            loadingModal.classList.add('hidden');
        }
        
        alert('Failed to generate itinerary. Please try again.');
    }
}

async function saveTripToDatabase(itinerary) {
    try {
        // Create trip record
        const { data: trip, error: tripError } = await window.supabaseClient
            .from('trips')
            .insert({
                name: `Trip to ${wizardData.destCountry}`,
                start_date: wizardData.startDate,
                end_date: calculateEndDate(wizardData.startDate, wizardData.duration),
                created_by: window.currentUser.id
            })
            .select()
            .single();
        
        if (tripError) throw tripError;
        
        // Create trip days and items
        for (const day of itinerary.days) {
            // Create trip day
            const { data: tripDay, error: dayError } = await window.supabaseClient
                .from('trip_days')
                .insert({
                    trip_id: trip.id,
                    date: calculateDayDate(wizardData.startDate, day.day - 1)
                })
                .select()
                .single();
            
            if (dayError) throw dayError;
            
            // Create trip items for this day
            for (let i = 0; i < day.activities.length; i++) {
                const activity = day.activities[i];
                await window.supabaseClient
                    .from('trip_items')
                    .insert({
                        day_id: tripDay.id,
                        title: activity.title,
                        note: activity.description,
                        order: i,
                        type: 'activity'
                    });
            }
        }
        
        // Store trip ID for navigation
        wizardData.tripId = trip.id;
        
    } catch (error) {
        console.error('Error saving trip to database:', error);
        // Continue anyway - user can still see the itinerary
    }
}

function calculateEndDate(startDate, duration) {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + duration - 1);
    return end.toISOString().split('T')[0];
}

function calculateDayDate(startDate, dayOffset) {
    const start = new Date(startDate);
    const day = new Date(start);
    day.setDate(start.getDate() + dayOffset);
    return day.toISOString().split('T')[0];
}

function animateLoadingSteps() {
    const steps = document.querySelectorAll('.loading-steps .step');
    let currentStepIndex = 0;
    
    const interval = setInterval(() => {
        if (currentStepIndex > 0) {
            steps[currentStepIndex - 1].classList.remove('active');
            steps[currentStepIndex - 1].classList.add('completed');
        }
        
        if (currentStepIndex < steps.length) {
            steps[currentStepIndex].classList.add('active');
            currentStepIndex++;
        } else {
            clearInterval(interval);
        }
    }, 1000);
}

function showTripBuilder(itinerary) {
    // Hide wizard
    document.getElementById('wizard').classList.add('hidden');
    
    // Show trip builder
    document.getElementById('trip-builder').classList.remove('hidden');
    
    // Update trip info
    const tripTitle = document.getElementById('tripTitle');
    const tripDetails = document.getElementById('tripDetails');
    
    if (tripTitle) {
        tripTitle.textContent = `Trip to ${wizardData.destCountry}`;
    }
    
    if (tripDetails) {
        const adults = wizardData.travellers.adults;
        const kids = wizardData.travellers.kids;
        const travellersText = `${adults} adult${adults > 1 ? 's' : ''}${kids > 0 ? `, ${kids} kid${kids > 1 ? 's' : ''}` : ''}`;
        tripDetails.textContent = `${wizardData.duration} days • ${travellersText} • ${new Date(wizardData.startDate).toLocaleDateString()}`;
    }
    
    // Load itinerary into kanban board
    if (typeof loadItineraryIntoKanban === 'function') {
        loadItineraryIntoKanban(itinerary);
    }
}

function showDashboard() {
    // Hide all sections
    document.getElementById('home').classList.add('hidden');
    document.getElementById('wizard').classList.add('hidden');
    document.getElementById('trip-builder').classList.add('hidden');
    
    // Show dashboard
    document.getElementById('dashboard').classList.remove('hidden');
    
    // Load trips if function exists
    if (typeof loadUserTrips === 'function') {
        loadUserTrips();
    }
}