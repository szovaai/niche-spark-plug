export interface TikTokScript {
  hook: string;
  body: string;
  callToAction: string;
  soundSuggestion: string;
  textOverlays: string[];
}

export interface InstagramCarousel {
  title: string;
  slides: {
    slideNumber: number;
    headline: string;
    body: string;
    visualSuggestion: string;
  }[];
  caption: string;
  hashtags: string[];
}

export interface PinterestPin {
  title: string;
  description: string;
  keywords: string[];
  boardSuggestion: string;
}

export interface EmailTemplate {
  type: 'launch' | 'reminder' | 'lastChance';
  subjectLine: string;
  previewText: string;
  body: string;
  callToAction: string;
}

export interface PowerHook {
  platform: 'tiktok' | 'instagram' | 'pinterest' | 'email' | 'universal';
  hook: string;
  angle: string;
}

export interface LaunchCalendarDay {
  day: number;
  date: string;
  platform: string;
  contentType: string;
  description: string;
  bestTime: string;
}

export interface LaunchKit {
  tiktokScripts: TikTokScript[];
  instagramCarousels: InstagramCarousel[];
  pinterestPins: PinterestPin[];
  emailTemplates: EmailTemplate[];
  powerHooks: PowerHook[];
  launchCalendar: LaunchCalendarDay[];
}
