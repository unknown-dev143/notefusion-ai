export interface Achievement { 
  id: string; 
  name: string; 
  description: string; 
  icon: string; 
  unlockedAt: Date; 
} 

export interface AdCampaign {
  id: string;
  title: string;
  description: string;
  category: string;
  reward: number;
  duration: number;
  imageUrl?: string;
}

export interface AdInteraction {
  id: string;
  adId: string;
  userId: string;
  timestamp: Date;
  completed: boolean;
  reward: number;
}

export interface UserStats {
  totalEarned: number;
  adsCompleted: number;
  adsSkipped: number;
  streakDays: number;
} 
 
class AdService { 
  private static instance: AdService; 
 
  public static getInstance(): AdService { 
    if (!AdService.instance) { 
      AdService.instance = new AdService(); 
    } 
    return AdService.instance; 
  } 
 
  public unlockAchievement(achievementId: string): Achievement { 
    return { 
      id: achievementId, 
      name: 'Test Achievement', 
      description: 'Test Description', 
      icon: 'star', 
      unlockedAt: new Date() 
    }; 
  } 

  public getUserStats(): UserStats {
    return {
      totalEarned: 150,
      adsCompleted: 25,
      adsSkipped: 5,
      streakDays: 7
    };
  }

  public getAvailableAds(): AdCampaign[] {
    return [
      {
        id: '1',
        title: 'Premium Learning App',
        description: 'Get 50% off on premium features',
        category: 'Education',
        reward: 10,
        duration: 30
      },
      {
        id: '2',
        title: 'Productivity Tools',
        description: 'Boost your productivity with our tools',
        category: 'Productivity',
        reward: 15,
        duration: 45
      }
    ];
  }

  public getUserInteractionHistory(): AdInteraction[] {
    return [
      {
        id: '1',
        adId: '1',
        userId: 'user1',
        timestamp: new Date(),
        completed: true,
        reward: 10
      }
    ];
  }

  public getCategories(): string[] {
    return ['Education', 'Productivity', 'Entertainment', 'Health'];
  }

  public startAdInteraction(adId: string): Promise<AdInteraction> {
    return Promise.resolve({
      id: Math.random().toString(),
      adId,
      userId: 'user1',
      timestamp: new Date(),
      completed: false,
      reward: 0
    });
  }

  public skipAdInteraction(_interactionId: string): Promise<void> {
    return Promise.resolve();
  }

  public getAdById(adId: string): AdCampaign | null {
    const ads = this.getAvailableAds();
    return ads.find(ad => ad.id === adId) || null;
  } 
} 
 
export const adService = AdService.getInstance(); 
