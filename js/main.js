// Main JavaScript functionality
class TravelApp {
    constructor() {
        this.currentSection = 'home';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupScrollEffects();
        this.setupMobileMenu();
        this.setupFormValidation();
        this.loadSavedTrips();
    }

    setupNavigation() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
                this.setActiveNavLink(link);
            });
        });

        // Update active nav link on scroll
        window.addEventListener('scroll', () => {
            this.updateActiveNavOnScroll();
        });
    }

    setupScrollEffects() {
        // Navbar background on scroll
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

        // Intersection Observer for animations
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

        // Observe elements for animation
        document.querySelectorAll('.feature-card, .form-group, .day-card').forEach(el => {
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

            // Close menu when clicking on a link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                });
            });
        }
    }

    setupFormValidation() {
        const form = document.getElementById('itineraryForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });

            // Real-time validation
            const inputs = form.querySelectorAll('input[required], select[required]');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
            });
        }
    }

    validateField(field) {
        const isValid = field.checkValidity();
        field.style.borderColor = isValid ? 'var(--border-color)' : '#ef4444';
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add error message if invalid
        if (!isValid) {
            const errorMessage = document.createElement('span');
            errorMessage.className = 'error-message';
            errorMessage.style.color = '#ef4444';
            errorMessage.style.fontSize = '14px';
            errorMessage.style.marginTop = '4px';
            errorMessage.textContent = field.validationMessage;
            field.parentNode.appendChild(errorMessage);
        }
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offsetTop = section.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            this.currentSection = sectionId;
        }
    }

    setActiveNavLink(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    updateActiveNavOnScroll() {
        const sections = ['home', 'planner', 'saved'];
        const scrollPosition = window.scrollY + 100;

        for (let i = sections.length - 1; i >= 0; i--) {
            const section = document.getElementById(sections[i]);
            if (section && scrollPosition >= section.offsetTop) {
                const activeLink = document.querySelector(`[href="#${sections[i]}"]`);
                if (activeLink && !activeLink.classList.contains('active')) {
                    this.setActiveNavLink(activeLink);
                }
                break;
            }
        }
    }

    async handleFormSubmit() {
        const formData = this.getFormData();
        
        if (!this.validateFormData(formData)) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        this.showLoadingModal();
        
        try {
            // Simulate API call delay
            await this.simulateLoadingSteps();
            
            // Generate itinerary
            const itinerary = await window.itineraryGenerator.generateItinerary(formData);
            
            this.hideLoadingModal();
            this.displayItinerary(itinerary, formData);
            this.scrollToSection('results');
            
        } catch (error) {
            console.error('Error generating itinerary:', error);
            this.hideLoadingModal();
            this.showNotification('Failed to generate itinerary. Please try again.', 'error');
        }
    }

    getFormData() {
        const form = document.getElementById('itineraryForm');
        const formData = new FormData(form);
        
        // Get selected interests
        const interests = Array.from(form.querySelectorAll('input[name="interests"]:checked'))
            .map(input => input.value);
        
        return {
            destination: formData.get('destination'),
            duration: parseInt(formData.get('duration')),
            budget: formData.get('budget'),
            travelers: formData.get('travelers'),
            interests: interests,
            additional: formData.get('additional')
        };
    }

    validateFormData(data) {
        return data.destination && 
               data.duration && 
               data.budget && 
               data.travelers && 
               data.interests.length > 0;
    }

    showLoadingModal() {
        const modal = document.getElementById('loadingModal');
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    hideLoadingModal() {
        const modal = document.getElementById('loadingModal');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    async simulateLoadingSteps() {
        const steps = document.querySelectorAll('.loading-steps .step');
        
        for (let i = 0; i < steps.length; i++) {
            // Remove active class from previous step
            if (i > 0) {
                steps[i - 1].classList.remove('active');
                steps[i - 1].classList.add('completed');
            }
            
            // Add active class to current step
            steps[i].classList.add('active');
            
            // Wait for step duration
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        }
        
        // Mark last step as completed
        steps[steps.length - 1].classList.remove('active');
        steps[steps.length - 1].classList.add('completed');
    }

    displayItinerary(itinerary, formData) {
        // Update trip summary
        document.getElementById('summary-destination').textContent = formData.destination;
        document.getElementById('summary-duration').textContent = `${formData.duration} days`;
        document.getElementById('summary-budget').textContent = this.formatBudget(formData.budget);
        document.getElementById('summary-travelers').textContent = formData.travelers;

        // Display tips
        const tipsList = document.getElementById('tips-list');
        tipsList.innerHTML = '';
        itinerary.tips.forEach(tip => {
            const li = document.createElement('li');
            li.textContent = tip;
            tipsList.appendChild(li);
        });

        // Display itinerary days
        const daysContainer = document.getElementById('itinerary-days');
        daysContainer.innerHTML = '';
        
        itinerary.days.forEach((day, index) => {
            const dayCard = this.createDayCard(day, index + 1);
            daysContainer.appendChild(dayCard);
        });

        // Show results section
        document.getElementById('results').classList.remove('hidden');
        
        // Setup action buttons
        this.setupActionButtons(itinerary, formData);
    }

    createDayCard(day, dayNumber) {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        
        dayCard.innerHTML = `
            <div class="day-header">
                <i class="fas fa-calendar-day"></i>
                <h3>Day ${dayNumber}</h3>
            </div>
            <div class="day-content">
                ${day.activities.map(activity => `
                    <div class="activity">
                        <div class="activity-time">${activity.time}</div>
                        <div class="activity-details">
                            <div class="activity-title">${activity.title}</div>
                            <div class="activity-description">${activity.description}</div>
                            <div class="activity-meta">
                                <span><i class="fas fa-clock"></i> ${activity.duration}</span>
                                <span><i class="fas fa-dollar-sign"></i> ${activity.cost}</span>
                                ${activity.location ? `<span><i class="fas fa-map-marker-alt"></i> ${activity.location}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        return dayCard;
    }

    setupActionButtons(itinerary, formData) {
        // Save button
        document.querySelector('.save-button').addEventListener('click', () => {
            this.saveTrip(itinerary, formData);
        });

        // Share button
        document.querySelector('.share-button').addEventListener('click', () => {
            this.shareItinerary(itinerary, formData);
        });

        // Print button
        document.querySelector('.print-button').addEventListener('click', () => {
            this.printItinerary();
        });
    }

    saveTrip(itinerary, formData) {
        const trip = {
            id: Date.now().toString(),
            destination: formData.destination,
            duration: formData.duration,
            budget: formData.budget,
            travelers: formData.travelers,
            interests: formData.interests,
            itinerary: itinerary,
            createdAt: new Date().toISOString()
        };

        window.storageManager.saveTrip(trip);
        this.showNotification('Trip saved successfully!', 'success');
        this.loadSavedTrips();
    }

    async shareItinerary(itinerary, formData) {
        const shareText = `Check out my ${formData.duration}-day trip to ${formData.destination}!`;
        const shareUrl = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Travel Itinerary',
                    text: shareText,
                    url: shareUrl
                });
            } catch (error) {
                console.log('Error sharing:', error);
                this.fallbackShare(shareText, shareUrl);
            }
        } else {
            this.fallbackShare(shareText, shareUrl);
        }
    }

    fallbackShare(text, url) {
        // Copy to clipboard
        navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
            this.showNotification('Link copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Unable to copy link', 'error');
        });
    }

    printItinerary() {
        const printContent = document.getElementById('results').innerHTML;
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Travel Itinerary</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .results-header { margin-bottom: 20px; }
                    .results-actions { display: none; }
                    .day-card { margin-bottom: 20px; border: 1px solid #ddd; }
                    .day-header { background: #2563eb; color: white; padding: 10px; }
                    .day-content { padding: 15px; }
                    .activity { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
                    .activity-title { font-weight: bold; margin-bottom: 5px; }
                    .activity-meta { font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }

    loadSavedTrips() {
        const savedTrips = window.storageManager.getSavedTrips();
        const grid = document.getElementById('savedTripsGrid');
        
        if (savedTrips.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-suitcase"></i>
                    <h3>No saved trips yet</h3>
                    <p>Start planning your first trip to see it here!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = '';
        savedTrips.forEach(trip => {
            const tripCard = this.createTripCard(trip);
            grid.appendChild(tripCard);
        });
    }

    createTripCard(trip) {
        const card = document.createElement('div');
        card.className = 'trip-card';
        
        const createdDate = new Date(trip.createdAt).toLocaleDateString();
        
        card.innerHTML = `
            <div class="trip-card-header">
                <h3>${trip.destination}</h3>
                <button class="delete-trip" data-trip-id="${trip.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="trip-card-meta">
                <div><i class="fas fa-calendar"></i> ${trip.duration} days</div>
                <div><i class="fas fa-users"></i> ${trip.travelers}</div>
                <div><i class="fas fa-clock"></i> Created ${createdDate}</div>
            </div>
        `;

        // Add click handler to load trip
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.delete-trip')) {
                this.loadTrip(trip);
            }
        });

        // Add delete handler
        card.querySelector('.delete-trip').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteTrip(trip.id);
        });

        return card;
    }

    loadTrip(trip) {
        // Populate form with trip data
        document.getElementById('destination').value = trip.destination;
        document.getElementById('duration').value = trip.duration;
        document.getElementById('budget').value = trip.budget;
        document.getElementById('travelers').value = trip.travelers;
        document.getElementById('additional').value = trip.additional || '';

        // Set interests
        document.querySelectorAll('input[name="interests"]').forEach(input => {
            input.checked = trip.interests.includes(input.value);
        });

        // Display the itinerary
        this.displayItinerary(trip.itinerary, trip);
        this.scrollToSection('results');
    }

    deleteTrip(tripId) {
        if (confirm('Are you sure you want to delete this trip?')) {
            window.storageManager.deleteTrip(tripId);
            this.loadSavedTrips();
            this.showNotification('Trip deleted successfully', 'success');
        }
    }

    formatBudget(budget) {
        const budgetMap = {
            'budget': 'Budget ($0-$50/day)',
            'mid-range': 'Mid-range ($50-$150/day)',
            'luxury': 'Luxury ($150+/day)'
        };
        return budgetMap[budget] || budget;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Global functions
function scrollToPlanner() {
    document.getElementById('planner').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.travelApp = new TravelApp();
});