// Authentication UI and management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupAuthListener();
        this.setupAuthUI();
    }

    setupAuthListener() {
        window.addEventListener('authStateChange', (event) => {
            this.currentUser = event.detail.user;
            this.updateAuthUI();
            this.updateNavigation();
        });
    }

    setupAuthUI() {
        this.createAuthModal();
        this.updateAuthUI();
    }

    createAuthModal() {
        const authModalHTML = `
            <div id="authModal" class="modal hidden">
                <div class="modal-content auth-modal">
                    <div class="auth-header">
                        <h3 id="authTitle">Welcome to TravelAI</h3>
                        <p id="authSubtitle">Sign in to save and manage your trips</p>
                        <button class="modal-close" onclick="closeAuthModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="auth-tabs">
                        <button class="auth-tab active" data-tab="signin" onclick="switchAuthTab('signin')">
                            Sign In
                        </button>
                        <button class="auth-tab" data-tab="signup" onclick="switchAuthTab('signup')">
                            Sign Up
                        </button>
                    </div>

                    <form id="authForm" class="auth-form">
                        <div class="form-group">
                            <label for="authEmail">Email</label>
                            <input type="email" id="authEmail" required placeholder="Enter your email">
                        </div>
                        
                        <div class="form-group">
                            <label for="authPassword">Password</label>
                            <input type="password" id="authPassword" required placeholder="Enter your password">
                        </div>

                        <div class="form-group signup-only hidden">
                            <label for="authPasswordConfirm">Confirm Password</label>
                            <input type="password" id="authPasswordConfirm" placeholder="Confirm your password">
                        </div>

                        <button type="submit" class="auth-submit-btn" id="authSubmitBtn">
                            <span id="authSubmitText">Sign In</span>
                            <div class="auth-spinner hidden"></div>
                        </button>

                        <div class="auth-error hidden" id="authError"></div>
                        <div class="auth-success hidden" id="authSuccess"></div>
                    </form>

                    <div class="auth-footer">
                        <p class="signin-only">
                            Don't have an account? 
                            <a href="#" onclick="switchAuthTab('signup')">Sign up here</a>
                        </p>
                        <p class="signup-only hidden">
                            Already have an account? 
                            <a href="#" onclick="switchAuthTab('signin')">Sign in here</a>
                        </p>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', authModalHTML);
        this.setupAuthForm();
    }

    setupAuthForm() {
        const form = document.getElementById('authForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAuthSubmit();
        });
    }

    async handleAuthSubmit() {
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        const passwordConfirm = document.getElementById('authPasswordConfirm').value;
        const isSignUp = document.querySelector('.auth-tab[data-tab="signup"]').classList.contains('active');

        // Clear previous messages
        this.hideAuthMessage();

        // Validation
        if (!email || !password) {
            this.showAuthError('Please fill in all fields');
            return;
        }

        if (isSignUp && password !== passwordConfirm) {
            this.showAuthError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            this.showAuthError('Password must be at least 6 characters');
            return;
        }

        // Show loading
        this.setAuthLoading(true);

        try {
            let result;
            if (isSignUp) {
                result = await window.supabaseClient.signUp(email, password);
            } else {
                result = await window.supabaseClient.signIn(email, password);
            }

            if (result.error) {
                this.showAuthError(result.error);
            } else {
                if (isSignUp) {
                    this.showAuthSuccess('Account created successfully! Please check your email to verify your account.');
                } else {
                    this.showAuthSuccess('Signed in successfully!');
                    setTimeout(() => {
                        this.closeAuthModal();
                    }, 1000);
                }
            }
        } catch (error) {
            this.showAuthError('An unexpected error occurred. Please try again.');
        } finally {
            this.setAuthLoading(false);
        }
    }

    switchAuthTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update form elements
        const signupElements = document.querySelectorAll('.signup-only');
        const signinElements = document.querySelectorAll('.signin-only');

        if (tab === 'signup') {
            signupElements.forEach(el => el.classList.remove('hidden'));
            signinElements.forEach(el => el.classList.add('hidden'));
            document.getElementById('authTitle').textContent = 'Create Account';
            document.getElementById('authSubtitle').textContent = 'Join TravelAI to start planning amazing trips';
            document.getElementById('authSubmitText').textContent = 'Sign Up';
        } else {
            signupElements.forEach(el => el.classList.add('hidden'));
            signinElements.forEach(el => el.classList.remove('hidden'));
            document.getElementById('authTitle').textContent = 'Welcome Back';
            document.getElementById('authSubtitle').textContent = 'Sign in to access your saved trips';
            document.getElementById('authSubmitText').textContent = 'Sign In';
        }

        // Clear form and messages
        document.getElementById('authForm').reset();
        this.hideAuthMessage();
    }

    showAuthError(message) {
        const errorEl = document.getElementById('authError');
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
        document.getElementById('authSuccess').classList.add('hidden');
    }

    showAuthSuccess(message) {
        const successEl = document.getElementById('authSuccess');
        successEl.textContent = message;
        successEl.classList.remove('hidden');
        document.getElementById('authError').classList.add('hidden');
    }

    hideAuthMessage() {
        document.getElementById('authError').classList.add('hidden');
        document.getElementById('authSuccess').classList.add('hidden');
    }

    setAuthLoading(loading) {
        const submitBtn = document.getElementById('authSubmitBtn');
        const submitText = document.getElementById('authSubmitText');
        const spinner = document.querySelector('.auth-spinner');

        if (loading) {
            submitBtn.disabled = true;
            submitText.style.opacity = '0';
            spinner.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            submitText.style.opacity = '1';
            spinner.classList.add('hidden');
        }
    }

    updateAuthUI() {
        const authButton = document.getElementById('authButton');
        const userMenu = document.getElementById('userMenu');

        if (this.currentUser) {
            // User is signed in
            if (authButton) authButton.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'flex';
                document.getElementById('userEmail').textContent = this.currentUser.email;
            }
        } else {
            // User is signed out
            if (authButton) authButton.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    updateNavigation() {
        // Update navigation based on auth state
        const dashboardLink = document.querySelector('[href="#dashboard"]');
        
        if (dashboardLink) {
            if (this.currentUser) {
                dashboardLink.style.display = 'block';
            } else {
                dashboardLink.style.display = 'none';
                // Redirect to home if on dashboard without auth
                if (window.location.hash === '#dashboard') {
                    window.travelApp?.navigateToSection('home');
                }
            }
        }
    }

    openAuthModal() {
        document.getElementById('authModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        this.switchAuthTab('signin');
    }

    closeAuthModal() {
        document.getElementById('authModal').classList.add('hidden');
        document.body.style.overflow = 'auto';
        document.getElementById('authForm').reset();
        this.hideAuthMessage();
    }

    async signOut() {
        try {
            await window.supabaseClient.signOut();
            this.showNotification('Signed out successfully', 'success');
        } catch (error) {
            this.showNotification('Error signing out', 'error');
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
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Global functions
function openAuthModal() {
    window.authManager.openAuthModal();
}

function closeAuthModal() {
    window.authManager.closeAuthModal();
}

function switchAuthTab(tab) {
    window.authManager.switchAuthTab(tab);
}

function signOut() {
    window.authManager.signOut();
}

// Initialize auth manager
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});