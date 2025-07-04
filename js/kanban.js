// Kanban board functionality for trip builder
class TripBuilder {
    constructor() {
        this.currentTrip = null;
        this.draggedItem = null;
        this.init();
    }

    init() {
        this.setupDragAndDrop();
    }

    loadTrip(trip) {
        this.currentTrip = trip;
        this.updateTripHeader();
        this.renderKanbanBoard();
    }

    createNewTrip() {
        this.currentTrip = {
            id: Date.now().toString(),
            destCountry: 'New Destination',
            duration: 7,
            travellers: { adults: 2, kids: 0 },
            startDate: new Date().toISOString().split('T')[0],
            itinerary: { days: [] },
            createdAt: new Date().toISOString()
        };

        // Create empty days
        for (let i = 1; i <= this.currentTrip.duration; i++) {
            this.currentTrip.itinerary.days.push({
                day: i,
                city: 'City',
                activities: []
            });
        }

        this.updateTripHeader();
        this.renderKanbanBoard();
    }

    updateTripHeader() {
        if (!this.currentTrip) return;

        const titleElement = document.getElementById('tripTitle');
        const detailsElement = document.getElementById('tripDetails');

        titleElement.textContent = `Trip to ${this.currentTrip.destCountry}`;
        
        const adults = this.currentTrip.travellers.adults;
        const kids = this.currentTrip.travellers.kids;
        const travellersText = adults + (kids > 0 ? ` adults, ${kids} kids` : ' adults');
        const dateText = new Date(this.currentTrip.startDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        detailsElement.textContent = `${this.currentTrip.duration} days • ${travellersText} • ${dateText}`;
    }

    renderKanbanBoard() {
        if (!this.currentTrip) return;

        const kanbanBoard = document.getElementById('kanbanBoard');
        kanbanBoard.innerHTML = '';

        this.currentTrip.itinerary.days.forEach(day => {
            const column = this.createKanbanColumn(day);
            kanbanBoard.appendChild(column);
        });
    }

    createKanbanColumn(day) {
        const column = document.createElement('div');
        column.className = 'kanban-column';
        column.dataset.day = day.day;

        const dayDate = new Date(this.currentTrip.startDate);
        dayDate.setDate(dayDate.getDate() + day.day - 1);
        const formattedDate = dayDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });

        column.innerHTML = `
            <div class="column-header">
                <div>
                    <div class="column-title">Day ${day.day}</div>
                    <div class="column-subtitle">${formattedDate} • ${day.city}</div>
                </div>
                <button class="add-item-btn" onclick="addNewItem(${day.day})">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="kanban-items" data-day="${day.day}">
                ${day.activities.map(activity => this.createKanbanItem(activity)).join('')}
            </div>
        `;

        return column;
    }

    createKanbanItem(activity) {
        const statusColors = {
            planned: '#e5e7eb',
            confirmed: '#dbeafe',
            completed: '#d1fae5'
        };

        return `
            <div class="kanban-item" 
                 draggable="true" 
                 data-id="${activity.id}"
                 style="border-left: 4px solid ${statusColors[activity.status] || statusColors.planned}">
                <div class="item-header">
                    <div class="item-title">${activity.title}</div>
                    <div class="item-actions">
                        <button class="item-action-btn" onclick="editItem('${activity.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="item-action-btn" onclick="deleteItem('${activity.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="item-description">${activity.description}</div>
                <div class="item-meta">
                    <span><i class="fas fa-clock"></i> ${activity.time}</span>
                    <span><i class="fas fa-hourglass-half"></i> ${activity.duration}</span>
                    ${activity.location ? `<span><i class="fas fa-map-marker-alt"></i> ${activity.location}</span>` : ''}
                </div>
                <div class="item-status">
                    <select class="status-select" onchange="updateItemStatus('${activity.id}', this.value)">
                        <option value="planned" ${activity.status === 'planned' ? 'selected' : ''}>Planned</option>
                        <option value="confirmed" ${activity.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="completed" ${activity.status === 'completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </div>
            </div>
        `;
    }

    setupDragAndDrop() {
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('kanban-item')) {
                this.draggedItem = e.target;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('kanban-item')) {
                e.target.classList.remove('dragging');
                this.draggedItem = null;
            }
        });

        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            const kanbanItems = e.target.closest('.kanban-items');
            if (kanbanItems && this.draggedItem) {
                e.dataTransfer.dropEffect = 'move';
            }
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            const kanbanItems = e.target.closest('.kanban-items');
            
            if (kanbanItems && this.draggedItem) {
                const targetDay = parseInt(kanbanItems.dataset.day);
                const itemId = this.draggedItem.dataset.id;
                
                this.moveItemToDay(itemId, targetDay);
                kanbanItems.appendChild(this.draggedItem);
            }
        });
    }

    moveItemToDay(itemId, targetDay) {
        if (!this.currentTrip) return;

        // Find and remove item from current day
        let movedItem = null;
        this.currentTrip.itinerary.days.forEach(day => {
            const itemIndex = day.activities.findIndex(activity => activity.id === itemId);
            if (itemIndex !== -1) {
                movedItem = day.activities.splice(itemIndex, 1)[0];
            }
        });

        // Add item to target day
        if (movedItem) {
            const targetDayData = this.currentTrip.itinerary.days.find(day => day.day === targetDay);
            if (targetDayData) {
                targetDayData.activities.push(movedItem);
            }
        }
    }

    addNewItem(dayNumber) {
        const title = prompt('Activity title:');
        if (!title) return;

        const description = prompt('Activity description:') || '';
        const time = prompt('Time (e.g., 9:00 AM):') || '9:00 AM';
        const duration = prompt('Duration (e.g., 2 hours):') || '1 hour';
        const location = prompt('Location:') || '';

        const newActivity = {
            id: `${dayNumber}-${Date.now()}`,
            title,
            description,
            time,
            duration,
            location,
            status: 'planned'
        };

        const dayData = this.currentTrip.itinerary.days.find(day => day.day === dayNumber);
        if (dayData) {
            dayData.activities.push(newActivity);
            this.renderKanbanBoard();
        }
    }

    editItem(itemId) {
        const item = this.findItemById(itemId);
        if (!item) return;

        const title = prompt('Activity title:', item.title);
        if (title === null) return;

        const description = prompt('Activity description:', item.description);
        if (description === null) return;

        const time = prompt('Time:', item.time);
        if (time === null) return;

        const duration = prompt('Duration:', item.duration);
        if (duration === null) return;

        const location = prompt('Location:', item.location);
        if (location === null) return;

        item.title = title;
        item.description = description;
        item.time = time;
        item.duration = duration;
        item.location = location;

        this.renderKanbanBoard();
    }

    deleteItem(itemId) {
        if (!confirm('Are you sure you want to delete this activity?')) return;

        this.currentTrip.itinerary.days.forEach(day => {
            const itemIndex = day.activities.findIndex(activity => activity.id === itemId);
            if (itemIndex !== -1) {
                day.activities.splice(itemIndex, 1);
            }
        });

        this.renderKanbanBoard();
    }

    updateItemStatus(itemId, status) {
        const item = this.findItemById(itemId);
        if (item) {
            item.status = status;
            this.renderKanbanBoard();
        }
    }

    findItemById(itemId) {
        for (const day of this.currentTrip.itinerary.days) {
            const item = day.activities.find(activity => activity.id === itemId);
            if (item) return item;
        }
        return null;
    }

    saveTrip() {
        if (!this.currentTrip) return;
        
        if (!window.supabaseClient.isAuthenticated()) {
            window.authManager.openAuthModal();
            return;
        }

        window.supabaseClient.saveTrip(this.currentTrip)
            .then(() => {
                this.showNotification('Trip saved successfully!', 'success');
            })
            .catch((error) => {
                console.error('Error saving trip:', error);
                this.showNotification('Failed to save trip', 'error');
            });
    }

    shareTrip() {
        if (!this.currentTrip) return;

        const shareText = `Check out my ${this.currentTrip.duration}-day trip to ${this.currentTrip.destCountry}!`;
        const shareUrl = window.location.href;

        if (navigator.share) {
            navigator.share({
                title: 'My Travel Itinerary',
                text: shareText,
                url: shareUrl
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
                this.showNotification('Link copied to clipboard!', 'success');
            }).catch(() => {
                this.showNotification('Unable to copy link', 'error');
            });
        }
    }

    showNotification(message, type = 'info') {
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

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Global functions
function addNewItem(dayNumber) {
    window.tripBuilder.addNewItem(dayNumber);
}

function editItem(itemId) {
    window.tripBuilder.editItem(itemId);
}

function deleteItem(itemId) {
    window.tripBuilder.deleteItem(itemId);
}

function updateItemStatus(itemId, status) {
    window.tripBuilder.updateItemStatus(itemId, status);
}

function saveTrip() {
    window.tripBuilder.saveTrip();
}

function shareTrip() {
    window.tripBuilder.shareTrip();
}

function backToDashboard() {
    window.travelWizard.showSection('dashboard');
    window.tripDashboard.loadTrips();
}

// Initialize trip builder
document.addEventListener('DOMContentLoaded', () => {
    window.tripBuilder = new TripBuilder();
});