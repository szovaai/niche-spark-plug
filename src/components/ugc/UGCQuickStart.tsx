import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Rocket, 
  Copy, 
  Check, 
  Calendar, 
  MessageSquare, 
  Mail, 
  Video,
  Target,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DAY_ACTIONS = [
  {
    day: 1,
    title: 'Choose & Apply',
    icon: Target,
    tasks: [
      { id: 'd1-1', text: 'Pick 2-3 beginner-friendly apps from the Vault', time: '10 min' },
      { id: 'd1-2', text: 'Create accounts on each platform', time: '15 min' },
      { id: 'd1-3', text: 'Complete your profile with a clear bio', time: '20 min' },
      { id: 'd1-4', text: 'Browse available campaigns/jobs', time: '10 min' }
    ]
  },
  {
    day: 2,
    title: 'Create Sample Content',
    icon: Video,
    tasks: [
      { id: 'd2-1', text: 'Film 3 sample UGC videos (30-60 sec each)', time: '1 hr' },
      { id: 'd2-2', text: 'Edit with captions and trending audio', time: '30 min' },
      { id: 'd2-3', text: 'Upload to your app portfolios', time: '15 min' },
      { id: 'd2-4', text: 'Apply to 5+ campaigns with your samples', time: '20 min' }
    ]
  },
  {
    day: 3,
    title: 'Follow Up & Expand',
    icon: Rocket,
    tasks: [
      { id: 'd3-1', text: 'Check for campaign responses/approvals', time: '10 min' },
      { id: 'd3-2', text: 'Send follow-up DMs if needed', time: '15 min' },
      { id: 'd3-3', text: 'Add 2 more apps from the Vault', time: '20 min' },
      { id: 'd3-4', text: 'Apply to 5 more campaigns', time: '20 min' }
    ]
  }
];

const DM_SCRIPTS = [
  {
    title: 'Brand Outreach DM',
    platform: 'Instagram/TikTok',
    script: `Hey [Brand]! 👋

I'm a UGC creator and I LOVE your products. I've been using [specific product] for [time] and would love to create content for you.

I specialize in:
• Authentic product reviews
• Lifestyle integration videos
• Unboxing content

Here's a quick sample of my work: [portfolio link]

Would you be open to a UGC collab? I'd love to help showcase your products to my audience!`
  },
  {
    title: 'App Campaign Application',
    platform: 'In-App Message',
    script: `Hi! I'd love to work on this campaign.

Why I'm a great fit:
• I have experience creating [content type] content
• Your product aligns with my authentic lifestyle
• I can deliver within [timeframe]

My approach:
I focus on genuine, relatable content that doesn't feel like an ad. I'll showcase your product naturally in my daily routine.

Looking forward to collaborating!`
  },
  {
    title: 'Rate Negotiation',
    platform: 'Email/DM',
    script: `Thank you for the opportunity! I'm excited about this campaign.

Based on the deliverables requested:
• [X] videos at [duration] each
• Usage rights: [specify]
• Timeline: [specify]

My rate for this package is $[amount].

This includes:
✓ Concept ideation
✓ Professional editing
✓ 1 round of revisions
✓ Raw footage files

I'm open to discussing if you have a different budget in mind. Let me know your thoughts!`
  }
];

const EMAIL_TEMPLATES = [
  {
    title: 'Cold Pitch Email',
    subject: 'UGC Creator Partnership Opportunity - [Your Name]',
    body: `Hi [Marketing Manager/Brand Name],

I'm [Your Name], a UGC creator specializing in [your niche - beauty, tech, lifestyle, etc.].

I came across [Brand] and absolutely love [specific thing about the brand]. I'd love to create authentic content that showcases your products to potential customers.

What I offer:
• High-quality vertical videos optimized for social ads
• Authentic, relatable content that converts
• Quick turnaround (typically 3-5 business days)

Here's my portfolio: [link]

Would you be open to a quick chat about a potential collaboration?

Best,
[Your Name]`
  }
];

export function UGCQuickStart() {
  const { toast } = useToast();
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`
    });
  };

  const totalTasks = DAY_ACTIONS.reduce((sum, day) => sum + day.tasks.length, 0);
  const progress = (completedTasks.length / totalTasks) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Rocket className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">3-Day Quick Start</h2>
          <p className="text-muted-foreground text-sm">Go from zero to earning in 72 hours</p>
        </div>
      </div>

      {/* Progress */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Your Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedTasks.length}/{totalTasks} tasks
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="action-plan">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="action-plan">
            <Calendar className="w-4 h-4 mr-2" />
            Action Plan
          </TabsTrigger>
          <TabsTrigger value="dm-scripts">
            <MessageSquare className="w-4 h-4 mr-2" />
            DM Scripts
          </TabsTrigger>
          <TabsTrigger value="emails">
            <Mail className="w-4 h-4 mr-2" />
            Email Templates
          </TabsTrigger>
        </TabsList>

        {/* Action Plan */}
        <TabsContent value="action-plan" className="space-y-4">
          {DAY_ACTIONS.map((day) => (
            <Card key={day.day} className="bg-card/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <day.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Day {day.day}: {day.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {day.tasks.map((task) => (
                  <div 
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      completedTasks.includes(task.id) 
                        ? 'bg-green-500/10 border border-green-500/20' 
                        : 'bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      id={task.id}
                      checked={completedTasks.includes(task.id)}
                      onCheckedChange={() => toggleTask(task.id)}
                    />
                    <label 
                      htmlFor={task.id}
                      className={`flex-1 cursor-pointer ${
                        completedTasks.includes(task.id) ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {task.text}
                    </label>
                    <Badge variant="outline" className="text-xs shrink-0">
                      <Clock className="w-3 h-3 mr-1" />
                      {task.time}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* DM Scripts */}
        <TabsContent value="dm-scripts" className="space-y-4">
          {DM_SCRIPTS.map((script, index) => (
            <Card key={index} className="bg-card/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{script.title}</CardTitle>
                    <Badge variant="secondary" className="mt-1">{script.platform}</Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(script.script, script.title)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg font-sans">
                  {script.script}
                </pre>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Email Templates */}
        <TabsContent value="emails" className="space-y-4">
          {EMAIL_TEMPLATES.map((template, index) => (
            <Card key={index} className="bg-card/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(`Subject: ${template.subject}\n\n${template.body}`, template.title)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Subject Line:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-muted/50 p-2 rounded">{template.subject}</code>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyToClipboard(template.subject, 'Subject line')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email Body:</p>
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg font-sans">
                    {template.body}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
