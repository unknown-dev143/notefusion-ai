// Admin Authentication Module
class AdminAuth {
    constructor() {
        this.isAuthenticated = false;
        this.authToken = localStorage.getItem('adminAuthToken') || '';
        this.adminRoutes = ['/admin', '/api/admin/'];
    }

    // Check if current route is admin route
    isAdminRoute(path) {
        return this.adminRoutes.some(route => path.startsWith(route));
    }

    // Verify admin token
    async verifyToken() {
        if (!this.authToken) return false;
        
        try {
            const response = await fetch('/api/admin/verify', {
                headers: { 'Authorization': `Bearer ${this.authToken}` }
            });
            
            this.isAuthenticated = response.ok;
            return this.isAuthenticated;
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    }

    // Login with credentials
    async login(credentials) {
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            if (response.ok) {
                const { token } = await response.json();
                this.authToken = token;
                this.isAuthenticated = true;
                localStorage.setItem('adminAuthToken', token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    }

    // Logout
    logout() {
        this.isAuthenticated = false;
        this.authToken = '';
        localStorage.removeItem('adminAuthToken');
    }

    // Middleware for protecting admin routes
    async protectRoute() {
        if (!this.isAdminRoute(window.location.pathname)) return true;
        
        const isAuthenticated = await this.verifyToken();
        if (!isAuthenticated) {
            window.location.href = '/admin/login';
            return false;
        }
        return true;
    }
}

// Export singleton instance
export const adminAuth = new AdminAuth();
