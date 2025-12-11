import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  ExternalLink, 
  Smartphone, 
  Globe, 
  Apple, 
  Star, 
  Check, 
  X, 
  Lightbulb,
  DollarSign,
  Users,
  MapPin,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { 
  UGCApp, 
  UGCUserStatus, 
  CATEGORY_LABELS, 
  CONTENT_TYPE_LABELS, 
  PAY_MODEL_LABELS,
  STATUS_LABELS 
} from '@/types/ugcVault';

interface UGCAppDetailModalProps {
  app: UGCApp | null;
  isOpen: boolean;
  onClose: () => void;
  userStatus?: UGCUserStatus | null;
  userNotes?: string;
  onStatusChange: (status: UGCUserStatus) => void;
  onNotesChange: (notes: string) => void;
  onToggleBookmark: () => void;
}

export function UGCAppDetailModal({ 
  app, 
  isOpen, 
  onClose, 
  userStatus,
  userNotes,
  onStatusChange,
  onNotesChange,
  onToggleBookmark
}: UGCAppDetailModalProps) {
  const [notes, setNotes] = useState(userNotes || '');
  
  if (!app) return null;

  const isBookmarked = userStatus !== null && userStatus !== undefined;

  const getPlatformIcons = () => {
    const platforms = [];
    if (app.platforms.includes('IOS')) platforms.push({ icon: Apple, label: 'iOS', url: app.signup_url_ios });
    if (app.platforms.includes('ANDROID')) platforms.push({ icon: Smartphone, label: 'Android', url: app.signup_url_android });
    if (app.platforms.includes('WEB')) platforms.push({ icon: Globe, label: 'Web', url: app.signup_url_web });
    return platforms;
  };

  const formatPayRange = () => {
    if (app.typical_pay_min === 0 && app.typical_pay_max === 0) return 'Varies';
    if (app.typical_pay_max > 1000) {
      return `$${app.typical_pay_min} - $${(app.typical_pay_max / 1000).toFixed(0)}k+`;
    }
    return `$${app.typical_pay_min} - $${app.typical_pay_max}`;
  };

  const handleSaveNotes = () => {
    onNotesChange(notes);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            {/* App Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
              {app.logo_url ? (
                <img src={app.logo_url} alt={app.name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                app.name.charAt(0)
              )}
            </div>
            
            <div className="flex-1">
              <DialogTitle className="text-xl">{app.name}</DialogTitle>
              <p className="text-muted-foreground mt-1">{app.short_tagline}</p>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {app.category.map((cat) => (
                  <Badge key={cat} variant="secondary">
                    {CATEGORY_LABELS[cat] || cat}
                  </Badge>
                ))}
                {app.is_featured && (
                  <Badge className="bg-accent text-accent-foreground">Featured</Badge>
                )}
              </div>
            </div>

            {/* Bookmark */}
            <Button variant="ghost" size="icon" onClick={onToggleBookmark}>
              {isBookmarked ? (
                <BookmarkCheck className="w-5 h-5 text-primary" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">Pay Range</span>
              </div>
              <p className="font-semibold text-foreground">{formatPayRange()}</p>
            </div>
            
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs">Followers Needed</span>
              </div>
              <p className="font-semibold text-foreground">
                {app.followers_required === 'NONE' ? 'None' : app.followers_required}
              </p>
            </div>
            
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Star className="w-4 h-4" />
                <span className="text-xs">Beginner Score</span>
              </div>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < app.beginner_friendly_score ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs">Regions</span>
              </div>
              <p className="font-semibold text-foreground text-sm">
                {app.countries_supported.slice(0, 3).join(', ')}
                {app.countries_supported.length > 3 && '...'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold mb-2">About</h4>
            <p className="text-muted-foreground text-sm">{app.description}</p>
          </div>

          {/* How It Works */}
          {app.how_it_works && app.how_it_works.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">How You Earn</h4>
              <ol className="space-y-2">
                {app.how_it_works.map((step, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Content Types & Pay Models */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 text-sm">Content Types</h4>
              <div className="flex flex-wrap gap-1">
                {app.content_types.map((type) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {CONTENT_TYPE_LABELS[type] || type}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Pay Models</h4>
              <div className="flex flex-wrap gap-1">
                {app.pay_model.map((model) => (
                  <Badge key={model} variant="outline" className="text-xs">
                    {PAY_MODEL_LABELS[model] || model}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-2 gap-4">
            {app.pros && app.pros.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm text-green-400">Pros</h4>
                <ul className="space-y-1">
                  {app.pros.map((pro, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="w-3 h-3 text-green-400 shrink-0 mt-0.5" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {app.cons && app.cons.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm text-red-400">Cons</h4>
                <ul className="space-y-1">
                  {app.cons.map((con, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <X className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Tips */}
          {app.tips && app.tips.length > 0 && (
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-accent">
                <Lightbulb className="w-4 h-4" />
                Tips to Succeed
              </h4>
              <ul className="space-y-1">
                {app.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-muted-foreground">• {tip}</li>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          {/* User Status & Notes */}
          <div className="space-y-4">
            <h4 className="font-semibold">Your Status</h4>
            
            <div className="flex items-center gap-4">
              <Select
                value={userStatus || 'none'}
                onValueChange={(value) => onStatusChange(value as UGCUserStatus)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not tracked</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Notes</label>
              <Textarea
                placeholder="Add notes about your experience with this app..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2"
                onClick={handleSaveNotes}
              >
                Save Notes
              </Button>
            </div>
          </div>

          <Separator />

          {/* Download/Open Links */}
          <div>
            <h4 className="font-semibold mb-3">Get Started</h4>
            <div className="flex flex-wrap gap-2">
              {getPlatformIcons().map(({ icon: Icon, label, url }) => (
                url && (
                  <Button
                    key={label}
                    variant="outline"
                    onClick={() => window.open(url, '_blank')}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                )
              ))}
              {app.official_site_url && (
                <Button onClick={() => window.open(app.official_site_url!, '_blank')}>
                  <Globe className="w-4 h-4 mr-2" />
                  Visit Website
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
