export interface IGPost {
  id: number;
  type: 'carousel' | 'single' | 'reel-caption';
  caption: string;
  hashtags: string[];
  postingDay: number;
}

export interface TikTokScript {
  id: number;
  hook: string;
  script: string;
  cta: string;
  hashtags: string[];
  soundSuggestion?: string;
}

export interface YouTubeShort {
  id: number;
  title: string;
  hook: string;
  script: string;
  cta: string;
}

export interface BlogPost {
  title: string;
  metaDescription: string;
  introduction: string;
  sections: Array<{ heading: string; content: string }>;
  conclusion: string;
  seoKeywords: string[];
}

export interface EmailSequenceItem {
  day: number;
  subject: string;
  previewText: string;
  body: string;
  cta: string;
}

export interface Carousel {
  id: number;
  title: string;
  slides: Array<{ slideNumber: number; text: string; tip?: string }>;
  caption: string;
}

export interface Infographic {
  id: number;
  title: string;
  sections: Array<{ heading: string; points: string[] }>;
  designNotes: string;
}

export interface LeadMagnet {
  title: string;
  format: string;
  description: string;
  contentOutline: string[];
  ctaText: string;
}

export interface ContentMultiplierOutput {
  instagramPosts: IGPost[];
  tiktokScripts: TikTokScript[];
  youtubeShorts: YouTubeShort[];
  blogPost: BlogPost;
  emailSequence: EmailSequenceItem[];
  carousels: Carousel[];
  infographics: Infographic[];
  leadMagnet: LeadMagnet;
  contentCalendar: Array<{
    day: number;
    platform: string;
    contentType: string;
    contentId: number;
  }>;
}
