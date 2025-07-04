// Main application controller
class TravelApp {
    constructor() {
        this.currentSection = 'home';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupScrollEffects();
        this.setupMobileMenu();
        this.initializeDashboard();
    }

    setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.navigateToSection(targetId);
            });
        });

        window.addEventListener('scroll', () => {
            this.updateActiveNavOnScroll();
        });
    }

    setupScrollEffects() {
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        });

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.feature-card, .trip-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    setupMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });

            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                });
            });
        }
    }

    initializeDashboard() {
        window.tripDashboard = new TripDashboard();
    }

    navigateToSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('hidden');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            this.currentSection = sectionId;
        }

        // Update navigation
        this.setActiveNavLink(sectionId);

        // Load section-specific data
        if (sectionId === 'dashboard') {
            window.tripDashboard.loadTrips();
        }
    }

    setActiveNavLink(sectionId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    updateActiveNavOnScroll() {
        if (this.currentSection !== 'home') return;

        const sections = ['home'];
        const scrollPosition = window.scrollY + 100;

        for (let i = sections.length - 1; i >= 0; i--) {
            const section = document.getElementById(sections[i]);
            if (section && scrollPosition >= section.offsetTop) {
                const activeLink = document.querySelector(`[href="#${sections[i]}"]`);
                if (activeLink && !activeLink.classList.contains('active')) {
                    this.setActiveNavLink(sections[i]);
                }
                break;
            }
        }
    }
}

// Trip Dashboard functionality
class TripDashboard {
    constructor() {
        this.trips = [];
    }

    loadTrips() {
        this.trips = window.storageManager.getSavedTrips();
        this.renderTrips();
    }

    renderTrips() {
        const tripsGrid = document.getElementById('tripsGrid');
        
        if (this.trips.length === 0) {
            tripsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-suitcase"></i>
                    <h3>No trips yet</h3>
                    <p>Start planning your first adventure!</p>
                    <button class="cta-button" onclick="startWizard()">
                        <span>Create Your First Trip</span>
                        <i class="fas fa-magic"></i>
                    </button>
                </div>
            `;
            return;
        }

        tripsGrid.innerHTML = this.trips.map(trip => this.createTripCard(trip)).join('');
    }

    createTripCard(trip) {
        const createdDate = new Date(trip.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const startDate = new Date(trip.startDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const adults = trip.travellers.adults;
        const kids = trip.travellers.kids;
        const travellersText = adults + (kids > 0 ? ` adults, ${kids} kids` : ' adults');

        return `
            <div class="trip-card" onclick="openTrip('${trip.id}')">
                <div class="trip-card-header">
                    <h3>${trip.destCountry}</h3>
                    <button class="trip-action-btn" onclick="event.stopPropagation(); deleteTrip('${trip.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <p>${trip.cities.join(', ')}</p>
                <div class="trip-meta">
                    <span><i class="fas fa-calendar"></i> ${trip.duration} days</span>
                    <span><i class="fas fa-users"></i> ${travellersText}</span>
                    <span><i class="fas fa-plane"></i> ${startDate}</span>
                </div>
                <div class="trip-footer">
                    <small>Created ${createdDate}</small>
                </div>
            </div>
        `;
    }

    openTrip(tripId) {
        const trip = window.storageManager.getTrip(tripId);
        if (trip) {
            window.tripBuilder.loadTrip(trip);
            window.travelWizard.showSection('trip-builder');
        }
    }

    deleteTrip(tripId) {
        if (confirm('Are you sure you want to delete this trip?')) {
            window.storageManager.deleteTrip(tripId);
            this.loadTrips();
        }
    }
}

// Global functions
function openTrip(tripId) {
    window.tripDashboard.openTrip(tripId);
}

function deleteTrip(tripId) {
    window.tripDashboard.deleteTrip(tripId);
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.travelApp = new TravelApp();
    
    // Show home section by default
    window.travelApp.navigateToSection('home');
});