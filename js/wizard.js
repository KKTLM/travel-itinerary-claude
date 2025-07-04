// Wizard functionality
class TravelWizard {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 7;
        this.wizardForm = {
            destCountry: '',
            departureCity: '',
            startDate: '',
            duration: 7,
            travellers: { adults: 1, kids: 0 },
            cities: [],
            interestTags: []
        };
        this.suggestedCities = [];
        this.init();
    }

    init() {
        this.setupProgressDots();
        this.setupAutocomplete();
        this.setupDurationControls();
        this.setupInterestChips();
        this.setupDateInput();
        this.updateProgress();
    }

    setupProgressDots() {
        const dotsContainer = document.getElementById('progressDots');
        dotsContainer.innerHTML = '';
        
        for (let i = 1; i <= this.totalSteps; i++) {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            if (i === 1) dot.classList.add('active');
            dotsContainer.appendChild(dot);
        }
    }

    setupAutocomplete() {
        // Country autocomplete
        const countryInput = document.getElementById('destCountry');
        const countrySuggestions = document.getElementById('countrySuggestions');
        
        const countries = [
            'France', 'Italy', 'Spain', 'Germany', 'United Kingdom', 'Greece', 'Portugal',
            'Japan', 'Thailand', 'Indonesia', 'Vietnam', 'South Korea', 'China', 'India',
            'United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Peru',
            'Australia', 'New Zealand', 'South Africa', 'Morocco', 'Egypt', 'Kenya'
        ];

        this.setupAutocompleteField(countryInput, countrySuggestions, countries, (value) => {
            this.wizardForm.destCountry = value;
        });

        // City autocomplete
        const cityInput = document.getElementById('departureCity');
        const citySuggestions = document.getElementById('citySuggestions');
        
        const cities = [
            'New York (JFK)', 'Los Angeles (LAX)', 'London (LHR)', 'Paris (CDG)',
            'Tokyo (NRT)', 'Sydney (SYD)', 'Dubai (DXB)', 'Singapore (SIN)',
            'Amsterdam (AMS)', 'Frankfurt (FRA)', 'Madrid (MAD)', 'Rome (FCO)',
            'Barcelona (BCN)', 'Munich (MUC)', 'Zurich (ZUR)', 'Vienna (VIE)',
            'Istanbul (IST)', 'Moscow (SVO)', 'Beijing (PEK)', 'Shanghai (PVG)',
            'Hong Kong (HKG)', 'Bangkok (BKK)', 'Mumbai (BOM)', 'Delhi (DEL)'
        ];

        this.setupAutocompleteField(cityInput, citySuggestions, cities, (value) => {
            this.wizardForm.departureCity = value;
        });
    }

    setupAutocompleteField(input, suggestionsContainer, options, callback) {
        input.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase();
            if (value.length < 2) {
                suggestionsContainer.style.display = 'none';
                return;
            }

            const filtered = options.filter(option => 
                option.toLowerCase().includes(value)
            ).slice(0, 5);

            if (filtered.length > 0) {
                suggestionsContainer.innerHTML = filtered.map(option => 
                    `<div class="suggestion-item" data-value="${option}">${option}</div>`
                ).join('');
                suggestionsContainer.style.display = 'block';
            } else {
                suggestionsContainer.style.display = 'none';
            }
        });

        suggestionsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-item')) {
                const value = e.target.dataset.value;
                input.value = value;
                callback(value);
                suggestionsContainer.style.display = 'none';
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.style.display = 'none';
            }
        });
    }

    setupDurationControls() {
        const slider = document.getElementById('durationSlider');
        const numberInput = document.getElementById('durationNumber');

        const updateDuration = (value) => {
            this.wizardForm.duration = parseInt(value);
            slider.value = value;
            numberInput.value = value;
        };

        slider.addEventListener('input', (e) => {
            updateDuration(e.target.value);
        });

        numberInput.addEventListener('input', (e) => {
            const value = Math.max(2, Math.min(30, parseInt(e.target.value) || 2));
            updateDuration(value);
        });
    }

    setupInterestChips() {
        const interestChips = document.querySelectorAll('.interest-chip');
        
        interestChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const interest = chip.dataset.interest;
                
                if (chip.classList.contains('selected')) {
                    chip.classList.remove('selected');
                    this.wizardForm.interestTags = this.wizardForm.interestTags.filter(tag => tag !== interest);
                } else {
                    chip.classList.add('selected');
                    this.wizardForm.interestTags.push(interest);
                }
            });
        });
    }

    setupDateInput() {
        const dateInput = document.getElementById('startDate');
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        
        dateInput.addEventListener('change', (e) => {
            this.wizardForm.startDate = e.target.value;
        });
    }

    async loadCitySuggestions() {
        if (!this.wizardForm.destCountry) return;

        const loadingElement = document.getElementById('loadingCities');
        const citiesGrid = document.getElementById('citiesGrid');
        
        loadingElement.style.display = 'flex';
        citiesGrid.innerHTML = '';

        try {
            // Simulate API call to get city suggestions
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Mock city suggestions based on country
            const cityMap = {
                'France': ['Paris', 'Lyon', 'Marseille', 'Nice', 'Bordeaux', 'Strasbourg'],
                'Italy': ['Rome', 'Milan', 'Venice', 'Florence', 'Naples', 'Turin'],
                'Spain': ['Madrid', 'Barcelona', 'Seville', 'Valencia', 'Bilbao', 'Granada'],
                'Japan': ['Tokyo', 'Kyoto', 'Osaka', 'Hiroshima', 'Nara', 'Yokohama'],
                'Thailand': ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Krabi', 'Ayutthaya'],
                'United States': ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Las Vegas']
            };

            this.suggestedCities = cityMap[this.wizardForm.destCountry] || 
                ['Capital City', 'Historic Town', 'Coastal City', 'Mountain Resort', 'Cultural Center'];

            loadingElement.style.display = 'none';
            this.renderCityChips();
            
        } catch (error) {
            console.error('Error loading city suggestions:', error);
            loadingElement.style.display = 'none';
            this.suggestedCities = ['Capital City', 'Historic Town', 'Coastal City'];
            this.renderCityChips();
        }
    }

    renderCityChips() {
        const citiesGrid = document.getElementById('citiesGrid');
        
        citiesGrid.innerHTML = this.suggestedCities.map(city => 
            `<div class="city-chip" data-city="${city}">${city}</div>`
        ).join('');

        // Add click handlers
        citiesGrid.querySelectorAll('.city-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const city = chip.dataset.city;
                
                if (chip.classList.contains('selected')) {
                    chip.classList.remove('selected');
                    this.wizardForm.cities = this.wizardForm.cities.filter(c => c !== city);
                } else {
                    chip.classList.add('selected');
                    this.wizardForm.cities.push(city);
                }
            });
        });
    }

    validateStep() {
        switch (this.currentStep) {
            case 1:
                return this.wizardForm.destCountry.length > 0;
            case 2:
                return this.wizardForm.departureCity.length > 0;
            case 3:
                return this.wizardForm.startDate.length > 0;
            case 4:
                return this.wizardForm.duration >= 2 && this.wizardForm.duration <= 30;
            case 5:
                return this.wizardForm.travellers.adults >= 1;
            case 6:
                return this.wizardForm.cities.length >= 1;
            case 7:
                return true; // Interests are optional
            default:
                return false;
        }
    }

    async nextStep() {
        if (!this.validateStep()) {
            this.showValidationError();
            return;
        }

        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            
            // Load city suggestions when reaching step 6
            if (this.currentStep === 6) {
                await this.loadCitySuggestions();
            }
            
            this.updateStepDisplay();
            this.updateProgress();
        } else {
            // Generate itinerary
            await this.generateItinerary();
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
            this.updateProgress();
        }
    }

    updateStepDisplay() {
        // Hide all steps
        document.querySelectorAll('.wizard-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step with animation
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Update navigation buttons
        const backBtn = document.getElementById('backBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        backBtn.disabled = this.currentStep === 1;
        
        if (this.currentStep === this.totalSteps) {
            nextBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Itinerary';
            nextBtn.classList.add('generating');
        } else {
            nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
            nextBtn.classList.remove('generating');
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const currentStepSpan = document.getElementById('currentStep');
        const dots = document.querySelectorAll('.progress-dot');
        
        const percentage = (this.currentStep / this.totalSteps) * 100;
        progressFill.style.width = `${percentage}%`;
        currentStepSpan.textContent = this.currentStep;
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.remove('active', 'completed');
            if (index + 1 < this.currentStep) {
                dot.classList.add('completed');
            } else if (index + 1 === this.currentStep) {
                dot.classList.add('active');
            }
        });
    }

    showValidationError() {
        // Simple validation feedback
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        currentStepElement.style.animation = 'shake 0.5s ease-in-out';
        
        setTimeout(() => {
            currentStepElement.style.animation = '';
        }, 500);
    }

    async generateItinerary() {
        // Show loading modal
        document.getElementById('loadingModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        try {
            // Simulate loading steps
            await this.simulateLoadingSteps();
            
            // Generate itinerary using mock data (replace with actual API call)
            const itinerary = await this.mockGenerateItinerary();
            
            // Save trip to storage
            const trip = {
                id: Date.now().toString(),
                ...this.wizardForm,
                itinerary: itinerary,
                createdAt: new Date().toISOString()
            };

            window.storageManager.saveTrip(trip);
            
            // Hide loading modal
            document.getElementById('loadingModal').classList.add('hidden');
            document.body.style.overflow = 'auto';
            
            // Show confetti
            this.showConfetti();
            
            // Navigate to trip builder
            setTimeout(() => {
                window.tripBuilder.loadTrip(trip);
                this.showSection('trip-builder');
            }, 2000);
            
        } catch (error) {
            console.error('Error generating itinerary:', error);
            document.getElementById('loadingModal').classList.add('hidden');
            document.body.style.overflow = 'auto';
            alert('Failed to generate itinerary. Please try again.');
        }
    }

    async simulateLoadingSteps() {
        const steps = document.querySelectorAll('.loading-steps .step');
        
        for (let i = 0; i < steps.length; i++) {
            if (i > 0) {
                steps[i - 1].classList.remove('active');
                steps[i - 1].classList.add('completed');
            }
            
            steps[i].classList.add('active');
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        }
        
        steps[steps.length - 1].classList.remove('active');
        steps[steps.length - 1].classList.add('completed');
    }

    async mockGenerateItinerary() {
        // Mock itinerary generation (replace with actual Gemini API call)
        const days = [];
        
        for (let i = 0; i < this.wizardForm.duration; i++) {
            const dayActivities = this.generateDayActivities(i + 1);
            days.push({
                day: i + 1,
                city: this.wizardForm.cities[i % this.wizardForm.cities.length],
                activities: dayActivities
            });
        }

        return { days };
    }

    generateDayActivities(dayNumber) {
        const activities = [];
        const timeSlots = ['9:00 AM', '11:30 AM', '2:00 PM', '4:30 PM', '7:00 PM'];
        
        const activityTemplates = [
            { title: 'City Walking Tour', description: 'Explore the historic city center', duration: '2 hours' },
            { title: 'Local Museum Visit', description: 'Discover local art and culture', duration: '1.5 hours' },
            { title: 'Traditional Restaurant', description: 'Authentic local cuisine experience', duration: '1 hour' },
            { title: 'Scenic Viewpoint', description: 'Panoramic city views', duration: '45 minutes' },
            { title: 'Local Market', description: 'Browse local crafts and foods', duration: '1 hour' }
        ];

        timeSlots.forEach((time, index) => {
            const template = activityTemplates[index % activityTemplates.length];
            activities.push({
                id: `${dayNumber}-${index}`,
                time: time,
                title: template.title,
                description: template.description,
                duration: template.duration,
                location: 'City Center',
                status: 'planned'
            });
        });

        return activities;
    }

    showConfetti() {
        const canvas = document.getElementById('confetti');
        const ctx = canvas.getContext('2d');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const confettiPieces = [];
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
        
        // Create confetti pieces
        for (let i = 0; i < 100; i++) {
            confettiPieces.push({
                x: Math.random() * canvas.width,
                y: -10,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 3 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            confettiPieces.forEach((piece, index) => {
                piece.x += piece.vx;
                piece.y += piece.vy;
                piece.rotation += piece.rotationSpeed;
                
                ctx.save();
                ctx.translate(piece.x, piece.y);
                ctx.rotate(piece.rotation * Math.PI / 180);
                ctx.fillStyle = piece.color;
                ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
                ctx.restore();
                
                // Remove pieces that are off screen
                if (piece.y > canvas.height + 10) {
                    confettiPieces.splice(index, 1);
                }
            });
            
            if (confettiPieces.length > 0) {
                requestAnimationFrame(animate);
            }
        }
        
        animate();
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Show target section
        document.getElementById(sectionId).classList.remove('hidden');
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const targetLink = document.querySelector(`[href="#${sectionId}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }
    }

    reset() {
        this.currentStep = 1;
        this.wizardForm = {
            destCountry: '',
            departureCity: '',
            startDate: '',
            duration: 7,
            travellers: { adults: 1, kids: 0 },
            cities: [],
            interestTags: []
        };
        
        // Reset form elements
        document.getElementById('destCountry').value = '';
        document.getElementById('departureCity').value = '';
        document.getElementById('startDate').value = '';
        document.getElementById('durationSlider').value = 7;
        document.getElementById('durationNumber').value = 7;
        document.getElementById('adultsCount').textContent = '1';
        document.getElementById('kidsCount').textContent = '0';
        
        // Reset selections
        document.querySelectorAll('.city-chip.selected').forEach(chip => {
            chip.classList.remove('selected');
        });
        
        document.querySelectorAll('.interest-chip.selected').forEach(chip => {
            chip.classList.remove('selected');
        });
        
        this.updateStepDisplay();
        this.updateProgress();
    }
}

// Global functions
function startWizard() {
    window.travelWizard.reset();
    window.travelWizard.showSection('wizard');
}

function skipWizard() {
    // Navigate to manual trip builder
    window.tripBuilder.createNewTrip();
    window.travelWizard.showSection('trip-builder');
}

function nextStep() {
    window.travelWizard.nextStep();
}

function previousStep() {
    window.travelWizard.previousStep();
}

function updateCounter(type, delta) {
    const countElement = document.getElementById(`${type}Count`);
    let currentValue = parseInt(countElement.textContent);
    
    if (type === 'adults') {
        currentValue = Math.max(1, currentValue + delta);
    } else {
        currentValue = Math.max(0, currentValue + delta);
    }
    
    countElement.textContent = currentValue;
    window.travelWizard.wizardForm.travellers[type] = currentValue;
}

function showDashboard() {
    window.travelWizard.showSection('dashboard');
    window.tripDashboard.loadTrips();
}

// Add shake animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Initialize wizard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.travelWizard = new TravelWizard();
});