import { authAPI } from './authAPI';
import { notificationService } from './notificationService';

export interface TokenTransaction {
  id: string;
  userId: string;
  amount: number;
  source: string;
  multiplier: number;
  timestamp: Date;
  type: 'earned' | 'spent';
}

export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface UsageData {
  tokensUsed: number;
  tokensLimit: number;
  dailyUsage: number;
  lastResetDate: string;
  plan: 'free' | 'premium' | 'enterprise';
  streak?: number;
  lastActiveDate?: string;
}

interface TokenLimits {
  free: number;
  premium: number;
  enterprise: number;
}

class TokenService {
  private refreshPromise: Promise<string> | null = null;

  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Get refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // Store tokens
  setTokens(tokens: TokenData): void {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('token_expires_at', 
      new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    );
  }

  // Clear tokens
  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return true;
    
    return new Date(expiresAt) <= new Date();
  }

  // Check if token will expire soon (within 5 minutes)
  isTokenExpiringSoon(): boolean {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return true;
    
    const expiryTime = new Date(expiresAt).getTime();
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    return expiryTime - currentTime <= fiveMinutes;
  }

  // Refresh access token
  async refreshAccessToken(): Promise<string> {
    // If already refreshing, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshPromise = this.doRefreshToken(refreshToken);
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async doRefreshToken(_refreshToken: string): Promise<string> {
    try {
      const response = await authAPI.refreshToken();
      
      if (response.error || !response.data) {
        throw new Error(response.error || 'Token refresh failed');
      }

      // Update the access token
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('token_expires_at', 
        new Date(Date.now() + response.data.expires_in * 1000).toISOString()
      );

      return response.data.access_token;
    } catch (error) {
      // If refresh fails, clear tokens and redirect to login
      this.clearTokens();
      throw error;
    }
  }

  // Get valid access token (refresh if needed)
  async getValidAccessToken(): Promise<string | null> {
    const currentToken = this.getAccessToken();
    
    if (!currentToken) {
      return null;
    }

    if (this.isTokenExpired()) {
      try {
        return await this.refreshAccessToken();
      } catch (error) {
        console.error('Failed to refresh token:', error);
        return null;
      }
    }

    return currentToken;
  }

  // Decode JWT token (simple implementation)
  decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  // Get user info from token
  getUserFromToken(): any {
    const token = this.getAccessToken();
    if (!token) return null;
    
    return this.decodeToken(token);
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.getUserFromToken();
    return user?.role === role;
  }

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    const user = this.getUserFromToken();
    return user?.permissions?.includes(permission) || false;
  }

  // Get user token balance
  getTokenBalance(): number {
    const balance = localStorage.getItem('token_balance');
    return balance ? parseInt(balance, 10) : 0;
  }

  // Add tokens to user balance
  addTokens(amount: number, source: string): void {
    const currentBalance = this.getTokenBalance();
    const newBalance = currentBalance + amount;
    localStorage.setItem('token_balance', newBalance.toString());

    // Record transaction
    const transaction: TokenTransaction = {
      id: Date.now().toString(),
      userId: 'current_user',
      amount,
      source,
      multiplier: 1,
      timestamp: new Date(),
      type: 'earned'
    };

    // Save transaction history
    const transactions = this.getTransactionHistory();
    transactions.push(transaction);
    localStorage.setItem('token_transactions', JSON.stringify(transactions));

    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('tokens-updated', {
      detail: { balance: newBalance, transaction }
    }));
  }

  // Spend tokens
  spendTokens(amount: number, source: string): boolean {
    const currentBalance = this.getTokenBalance();
    if (currentBalance < amount) {
      return false; // Insufficient balance
    }

    const newBalance = currentBalance - amount;
    localStorage.setItem('token_balance', newBalance.toString());

    // Record transaction
    const transaction: TokenTransaction = {
      id: Date.now().toString(),
      userId: 'current_user',
      amount: -amount,
      source,
      multiplier: 1,
      timestamp: new Date(),
      type: 'spent'
    };

    // Save transaction history
    const transactions = this.getTransactionHistory();
    transactions.push(transaction);
    localStorage.setItem('token_transactions', JSON.stringify(transactions));

    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('tokens-updated', {
      detail: { balance: newBalance, transaction }
    }));

    return true;
  }

  // Get transaction history
  getTransactionHistory(): TokenTransaction[] {
    const transactions = localStorage.getItem('token_transactions');
    return transactions ? JSON.parse(transactions) : [];
  }

  // Setup automatic token refresh
  setupAutoRefresh(): void {
    setInterval(async () => {
      if (this.isTokenExpiringSoon() && this.getRefreshToken()) {
        try {
          await this.refreshAccessToken();
        } catch (error) {
          console.error('Auto refresh failed:', error);
          // Redirect to login or show re-authentication UI
          window.dispatchEvent(new CustomEvent('token-expired'));
        }
      }
    }, 60000); // Check every minute
  }

  // Initialize token service
  initialize(): void {
    this.setupAutoRefresh();
    
    // Listen for token expiry events
    window.addEventListener('token-expired', () => {
      this.clearTokens();
      // You can redirect to login or show a modal here
      window.location.href = '/login';
    });
  }

  // Usage tracking methods
  getUsageData(): UsageData {
    const usageData = localStorage.getItem('usage_data');
    if (!usageData) {
      const defaultUsage: UsageData = {
        tokensUsed: 0,
        tokensLimit: this.getPlanLimits().free,
        dailyUsage: 0,
        lastResetDate: new Date().toDateString(),
        plan: 'free'
      };
      this.setUsageData(defaultUsage);
      return defaultUsage;
    }
    return JSON.parse(usageData);
  }

  setUsageData(data: UsageData): void {
    localStorage.setItem('usage_data', JSON.stringify(data));
  }

  getPlanLimits(): TokenLimits {
    return {
      free: 1000,
      premium: 10000,
      enterprise: 100000
    };
  }

  checkDailyReset(): void {
    const usage = this.getUsageData();
    const today = new Date().toDateString();
    
    if (usage.lastResetDate !== today) {
      usage.dailyUsage = 0;
      usage.lastResetDate = today;
      this.setUsageData(usage);
    }
  }

  trackUsage(tokensUsed: number): void {
    this.checkDailyReset();
    const usage = this.getUsageData();
    usage.tokensUsed += tokensUsed;
    usage.dailyUsage += tokensUsed;
    this.setUsageData(usage);

    // Send real-time notification for token usage
    notificationService.showTokenNotification(
      tokensUsed,
      'Tokens Used',
      'warning'
    );

    // Check if user is approaching limit
    if (this.isNearLimit()) {
      notificationService.showMessage(
        `Warning: Only ${usage.tokensLimit - usage.tokensUsed} tokens remaining`,
        'warning'
      );
      
      window.dispatchEvent(new CustomEvent('token-limit-near', {
        detail: { usage: usage, remaining: usage.tokensLimit - usage.tokensUsed }
      }));
    }

    // Check if user hit limit
    if (this.isAtLimit()) {
      notificationService.showMessage(
        'Token limit reached! Upgrade your plan or watch ads to earn more tokens.',
        'error'
      );
      
      window.dispatchEvent(new CustomEvent('token-limit-reached', {
        detail: { usage: usage }
      }));
    }
  }

  isAtLimit(): boolean {
    const usage = this.getUsageData();
    return usage.tokensUsed >= usage.tokensLimit;
  }

  getRemainingTokens(): number {
    const usage = this.getUsageData();
    return Math.max(0, usage.tokensLimit - usage.tokensUsed);
  }

  getUsagePercentage(): number {
    const usage = this.getUsageData();
    return (usage.tokensUsed / usage.tokensLimit) * 100;
  }

  upgradePlan(newPlan: 'free' | 'premium' | 'enterprise'): void {
    const usage = this.getUsageData();
    const limits = this.getPlanLimits();
    usage.plan = newPlan;
    usage.tokensLimit = limits[newPlan];
    this.setUsageData(usage);
  }

  resetDailyUsage(): void {
    const usage = this.getUsageData();
    usage.dailyUsage = 0;
    usage.tokensUsed = 0;
    usage.lastResetDate = new Date().toDateString();
    this.setUsageData(usage);
  }

  // Ad rewards system
  addAdReward(tokens: number): void {
    const usage = this.getUsageData();
    usage.tokensLimit += tokens;
    this.setUsageData(usage);
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('tokens-awarded', {
      detail: { tokens: tokens, newLimit: usage.tokensLimit, source: 'ad' }
    }));
    
    // Add to history
    this.addToTokenHistory('Ad Reward', tokens);
  }

  addBonusTokens(type: 'daily' | 'share' | 'profile' | 'achievement' | 'referral'): number {
    const bonusAmounts = {
      daily: 50,
      share: 100,
      profile: 200,
      achievement: 300,
      referral: 500
    };
    
    const tokens = bonusAmounts[type];
    this.addAdReward(tokens);
    
    // Send real-time notification
    notificationService.showTokenNotification(
      tokens,
      `${type.charAt(0).toUpperCase() + type.slice(1)} Bonus`,
      'success'
    );
    
    return tokens;
  }

  // Enhanced token earning methods
  earnTokensByAction(action: string, baseTokens: number, multiplier: number = 1): number {
    const earnedTokens = Math.floor(baseTokens * multiplier);
    const usage = this.getUsageData();
    usage.tokensLimit += earnedTokens;
    this.setUsageData(usage);
    
    this.addToTokenHistory(action, earnedTokens);
    
    // Send real-time notification
    notificationService.showTokenNotification(
      earnedTokens,
      action,
      multiplier > 1 ? 'success' : 'info'
    );
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('tokens-earned', {
      detail: { action, tokens: earnedTokens, newLimit: usage.tokensLimit }
    }));
    
    return earnedTokens;
  }

  // Token streak system
  updateStreak(): void {
    const usage = this.getUsageData();
    const today = new Date().toDateString();
    const lastActive = usage.lastActiveDate || '';
    
    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();
      
      if (lastActive === yesterdayString) {
        usage.streak = (usage.streak || 0) + 1;
      } else {
        usage.streak = 1;
      }
      
      usage.lastActiveDate = today;
      
      // Award streak bonus
      if (usage.streak > 1) {
        const streakBonus = usage.streak * 25;
        this.earnTokensByAction(`Streak Day ${usage.streak}`, streakBonus, 1);
      }
      
      this.setUsageData(usage);
    }
  }

  // Token multiplier system
  getTokenMultiplier(): number {
    const usage = this.getUsageData();
    let multiplier = 1;
    
    // Streak bonus
    const streak = usage.streak || 0;
    if (streak >= 7) multiplier += 0.5;
    if (streak >= 30) multiplier += 0.5;
    
    // Plan bonus
    if (usage.plan === 'premium') multiplier += 1;
    
    return multiplier;
  }

  // Enhanced limit detection
  isNearLimit(threshold: number = 0.8): boolean {
    const usage = this.getUsageData();
    return (usage.tokensUsed / usage.tokensLimit) >= threshold;
  }

  getTokensRemaining(): number {
    const usage = this.getUsageData();
    return Math.max(0, usage.tokensLimit - usage.tokensUsed);
  }

  getTimeUntilReset(): string {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }

  getTotalTokensEarned(): number {
    const history = this.getTokenHistory('default');
    return history.reduce((total, item) => total + item.amount, 0);
  }

  addToTokenHistory(action: string, tokens: number): void {
    this.addTokenTransaction('default', tokens, action, 1.0);
  }

  // Get token statistics for UI components
  getTokenStats() {
    const usage = this.getUsageData();
    return {
      current: usage.tokensUsed,
      limit: usage.tokensLimit,
      remaining: this.getTokensRemaining(),
      percentage: Math.round((usage.tokensUsed / usage.tokensLimit) * 100)
    };
  }

  // Advanced token features
  getTokenHistory(userId: string, limit: number = 50): TokenTransaction[] {
    const history = localStorage.getItem(`token_history_${userId}`);
    const transactions: TokenTransaction[] = history ? JSON.parse(history) : [];
    return transactions.slice(0, limit);
  }

  addTokenTransaction(userId: string, amount: number, source: string, multiplier: number = 1.0) {
    const history = this.getTokenHistory(userId);
    const transaction: TokenTransaction = {
      id: this.generateTransactionId(),
      userId,
      amount: amount * multiplier,
      source,
      multiplier,
      timestamp: new Date(),
      type: amount > 0 ? 'earned' : 'spent'
    };
    
    history.unshift(transaction);
    localStorage.setItem(`token_history_${userId}`, JSON.stringify(history));
  }

  private generateTransactionId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  getTokenStreak(userId: string): { current: number; longest: number; lastEarned: Date | null } {
    const history = this.getTokenHistory(userId);
    const earnings = history.filter(t => t.type === 'earned');
    
    if (earnings.length === 0) {
      return { current: 0, longest: 0, lastEarned: null };
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayEarnings = earnings.filter(t => 
      new Date(t.timestamp).toDateString() === today.toDateString()
    );
    
    const yesterdayEarnings = earnings.filter(t => 
      new Date(t.timestamp).toDateString() === yesterday.toDateString()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    earnings.forEach((earning, index) => {
      const earningDate = new Date(earning.timestamp);
      if (index === 0) {
        tempStreak = 1;
      } else {
        const prevEarning = new Date(earnings[index - 1].timestamp);
        const daysDiff = Math.floor((earningDate.getTime() - prevEarning.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          tempStreak++;
        } else if (daysDiff > 1) {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    });

    longestStreak = Math.max(longestStreak, tempStreak);
    currentStreak = todayEarnings.length > 0 ? (yesterdayEarnings.length > 0 ? tempStreak : 1) : 0;

    return {
      current: currentStreak,
      longest: longestStreak,
      lastEarned: earnings.length > 0 ? new Date(earnings[0].timestamp) : null
    };
  }

  calculateTokenBonus(userId: string, baseAmount: number): number {
    const streak = this.getTokenStreak(userId);
    let bonus = 0;

    // Streak bonus
    if (streak.current >= 7) bonus += baseAmount * 0.5; // 50% bonus for 7+ day streak
    else if (streak.current >= 3) bonus += baseAmount * 0.25; // 25% bonus for 3+ day streak

    // First time bonus
    const history = this.getTokenHistory(userId);
    if (history.length === 0) bonus += baseAmount; // 100% bonus for first transaction

    return Math.floor(bonus);
  }

  getTokenForecast(userId: string): { daily: number; weekly: number; monthly: number } {
    const history = this.getTokenHistory(userId);
    const now = new Date();
    
    const dailyEarnings = history.filter(t => 
      t.type === 'earned' && 
      new Date(t.timestamp).toDateString() === now.toDateString()
    ).reduce((sum, t) => sum + t.amount, 0);

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyEarnings = history.filter(t => 
      t.type === 'earned' && 
      new Date(t.timestamp) >= weekAgo
    ).reduce((sum, t) => sum + t.amount, 0);

    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const monthlyEarnings = history.filter(t => 
      t.type === 'earned' && 
      new Date(t.timestamp) >= monthAgo
    ).reduce((sum, t) => sum + t.amount, 0);

    return {
      daily: dailyEarnings,
      weekly: weeklyEarnings,
      monthly: monthlyEarnings
    };
  }
}

export const tokenService = new TokenService();
