export interface FreeHostingPlatform {
  id: string;
  name: string;
  icon: string;
  description: string;
  freeTier: string;
  difficulty: 'beginner' | 'intermediate';
  setupUrl: string;
  quickSteps: string[];
  bestFor: string;
  supportsCustomDomain: boolean;
}

export const FREE_HOSTING_PLATFORMS: FreeHostingPlatform[] = [
  {
    id: 'netlify',
    name: 'Netlify',
    icon: 'Cloud',
    description: 'Drag-and-drop your HTML folder. Instant live link.',
    freeTier: '100GB bandwidth/month, free SSL, custom domains',
    difficulty: 'beginner',
    setupUrl: 'https://app.netlify.com/drop',
    quickSteps: [
      'Go to app.netlify.com/drop',
      'Drag your HTML folder onto the page',
      'Copy your free .netlify.app link'
    ],
    bestFor: 'Fastest way to get online',
    supportsCustomDomain: true,
  },
  {
    id: 'vercel',
    name: 'Vercel',
    icon: 'Triangle',
    description: 'Modern hosting with instant deploys and analytics.',
    freeTier: '100GB bandwidth, analytics, custom domains',
    difficulty: 'beginner',
    setupUrl: 'https://vercel.com/new',
    quickSteps: [
      'Create free account at vercel.com',
      'Import your HTML from GitHub or upload',
      'Get your free .vercel.app link instantly'
    ],
    bestFor: 'Professional-looking URLs',
    supportsCustomDomain: true,
  },
  {
    id: 'github-pages',
    name: 'GitHub Pages',
    icon: 'Github',
    description: 'Host directly from your GitHub repository.',
    freeTier: 'Unlimited sites, custom domains, free forever',
    difficulty: 'beginner',
    setupUrl: 'https://pages.github.com',
    quickSteps: [
      'Create a GitHub repository',
      'Upload your HTML file as index.html',
      'Enable Pages in repo Settings → Pages'
    ],
    bestFor: 'Long-term free hosting',
    supportsCustomDomain: true,
  },
  {
    id: 'cloudflare-pages',
    name: 'Cloudflare Pages',
    icon: 'Shield',
    description: 'Global CDN with blazing fast speeds worldwide.',
    freeTier: 'Unlimited requests, free SSL, 500 builds/month',
    difficulty: 'beginner',
    setupUrl: 'https://pages.cloudflare.com',
    quickSteps: [
      'Sign up at pages.cloudflare.com',
      'Connect GitHub or upload directly',
      'Deploy with one click'
    ],
    bestFor: 'Fastest global loading speeds',
    supportsCustomDomain: true,
  },
  {
    id: 'replit',
    name: 'Replit',
    icon: 'Code',
    description: 'Quick prototyping with instant hosting.',
    freeTier: 'Free projects, instant deploy, online editor',
    difficulty: 'beginner',
    setupUrl: 'https://replit.com',
    quickSteps: [
      'Create account at replit.com',
      'Create new HTML/CSS/JS Repl',
      'Paste your HTML and click Run'
    ],
    bestFor: 'Quick testing and editing online',
    supportsCustomDomain: false,
  },
  {
    id: 'tiiny-host',
    name: 'Tiiny.host',
    icon: 'Upload',
    description: 'Simplest option - just upload one HTML file.',
    freeTier: 'Free single page hosting, instant link',
    difficulty: 'beginner',
    setupUrl: 'https://tiiny.host',
    quickSteps: [
      'Go to tiiny.host',
      'Upload your HTML file',
      'Get your link immediately (no signup!)'
    ],
    bestFor: 'Absolute simplest option',
    supportsCustomDomain: false,
  },
  {
    id: 'render',
    name: 'Render',
    icon: 'Server',
    description: 'Static sites with room to grow into full apps.',
    freeTier: '100GB bandwidth, custom domains, free SSL',
    difficulty: 'intermediate',
    setupUrl: 'https://render.com',
    quickSteps: [
      'Create account at render.com',
      'Create new Static Site',
      'Connect GitHub repo or upload files'
    ],
    bestFor: 'Growing into a full web app later',
    supportsCustomDomain: true,
  },
  {
    id: 'surge',
    name: 'Surge.sh',
    icon: 'Zap',
    description: 'Command-line publishing for tech-savvy users.',
    freeTier: 'Free subdomain hosting, unlimited projects',
    difficulty: 'intermediate',
    setupUrl: 'https://surge.sh',
    quickSteps: [
      'Install: npm install -g surge',
      'Navigate to your folder in terminal',
      'Run: surge'
    ],
    bestFor: 'Developers who love CLI',
    supportsCustomDomain: true,
  },
];
