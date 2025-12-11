import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, BookmarkCheck, Star, Smartphone, Globe, Apple, ExternalLink } from 'lucide-react';
import { UGCApp, CATEGORY_LABELS, UGCUserStatus } from '@/types/ugcVault';
import { motion } from 'framer-motion';

interface UGCAppCardProps {
  app: UGCApp;
  userStatus?: UGCUserStatus | null;
  onViewDetails: (app: UGCApp) => void;
  onToggleBookmark: (app: UGCApp) => void;
  isBookmarking?: boolean;
}

export function UGCAppCard({ app, userStatus, onViewDetails, onToggleBookmark, isBookmarking }: UGCAppCardProps) {
  const isBookmarked = userStatus !== null && userStatus !== undefined;
  
  const getPlatformIcons = () => {
    const icons = [];
    if (app.platforms.includes('IOS')) icons.push(<Apple key="ios" className="w-3 h-3" />);
    if (app.platforms.includes('ANDROID')) icons.push(<Smartphone key="android" className="w-3 h-3" />);
    if (app.platforms.includes('WEB')) icons.push(<Globe key="web" className="w-3 h-3" />);
    return icons;
  };

  const formatPayRange = () => {
    if (app.typical_pay_min === 0 && app.typical_pay_max === 0) return null;
    if (app.typical_pay_max > 1000) {
      return `$${app.typical_pay_min}-$${(app.typical_pay_max / 1000).toFixed(0)}k+`;
    }
    return `$${app.typical_pay_min}-$${app.typical_pay_max}`;
  };

  const payRange = formatPayRange();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
        {app.is_featured && (
          <div className="absolute top-0 right-0 bg-gradient-to-l from-accent to-accent/80 text-accent-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">
            Featured
          </div>
        )}
        
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* App Icon/Logo */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl font-bold text-primary shrink-0">
              {app.logo_url ? (
                <img src={app.logo_url} alt={app.name} className="w-full h-full rounded-xl object-cover" />
              ) : (
                app.name.charAt(0)
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">{app.name}</h3>
                <div className="flex items-center gap-1 text-muted-foreground">
                  {getPlatformIcons()}
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{app.short_tagline}</p>
            </div>

            {/* Bookmark Button */}
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(app);
              }}
              disabled={isBookmarking}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-5 h-5 text-primary" />
              ) : (
                <Bookmark className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
              )}
            </Button>
          </div>

          {/* Tags Row */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <Badge variant="secondary" className="text-xs">
              {CATEGORY_LABELS[app.category[0]] || app.category[0]}
            </Badge>
            
            {app.followers_required === 'NONE' && (
              <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                No followers required
              </Badge>
            )}
            
            {payRange && (
              <Badge variant="outline" className="text-xs border-accent/50 text-accent">
                {payRange}/video
              </Badge>
            )}
          </div>

          {/* Scores Row */}
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>Beginner:</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < app.beginner_friendly_score ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span>Earnings:</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < app.earning_potential_score ? 'text-green-400 fill-green-400' : 'text-muted'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onViewDetails(app)}
            >
              View Details
            </Button>
            {app.signup_url_web && (
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => window.open(app.signup_url_web!, '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Open App
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
