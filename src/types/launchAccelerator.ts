export interface TikTokScript {
  hook: string;
  body: string;
  cta: string;
  duration: string;
  style: 'talking-head' | 'screen-recording' | 'text-overlay' | 'voiceover';
}

export interface InstagramContent {
  posts: Array<{
    type: 'carousel' | 'reel' | 'static';
    caption: string;
    hashtags: string[];
    slides?: string[];
  }>;
  stories: Array<{
    slide: number;
    content: string;
    cta?: string;
  }>;
}

export interface PinterestContent {
  pins: Array<{
    title: string;
    description: string;
    keywords: string[];
  }>;
  boardName: string;
  boardDescription: string;
}

export interface EmailSequence {
  subject: string;
  preview: string;
  body: string;
  sendDay: number;
}

export interface PromoCalendarDay {
  day: number;
  date: string;
  platform: string;
  contentType: string;
  task: string;
  hook?: string;
}

export interface LaunchAccelerator {
  tiktokScripts: TikTokScript[];
  instagram: InstagramContent;
  pinterest: PinterestContent;
  emails: EmailSequence[];
  promoCalendar: PromoCalendarDay[];
  hooks: string[];
  hashtags: {
    tiktok: string[];
    instagram: string[];
    pinterest: string[];
  };
}

export interface LaunchAcceleratorRequest {
  productName: string;
  nicheName: string;
  targetAudience: string;
  productType: string;
  pricePoint: number;
  keyBenefits: string[];
}
