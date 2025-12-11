import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Filter } from 'lucide-react';
import { 
  UGCAppFilters as FilterState, 
  CATEGORY_LABELS, 
  CONTENT_TYPE_LABELS, 
  PAY_MODEL_LABELS,
  UGCAppCategory,
  UGCContentType,
  UGCPayModel,
  UGCPlatform
} from '@/types/ugcVault';

interface UGCAppFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  activeFilterCount: number;
}

export function UGCAppFilters({ filters, onFiltersChange, activeFilterCount }: UGCAppFiltersProps) {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: null,
      contentType: null,
      platform: null,
      payModel: null,
      followersRequired: null,
      beginnerFriendly: false
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
            <X className="w-3 h-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Category Filter */}
        <Select
          value={filters.category || 'all'}
          onValueChange={(value) => updateFilter('category', value === 'all' ? null : value as UGCAppCategory)}
        >
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Content Type Filter */}
        <Select
          value={filters.contentType || 'all'}
          onValueChange={(value) => updateFilter('contentType', value === 'all' ? null : value as UGCContentType)}
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Content Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Content</SelectItem>
            {Object.entries(CONTENT_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Platform Filter */}
        <Select
          value={filters.platform || 'all'}
          onValueChange={(value) => updateFilter('platform', value === 'all' ? null : value as UGCPlatform)}
        >
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="IOS">iOS</SelectItem>
            <SelectItem value="ANDROID">Android</SelectItem>
            <SelectItem value="WEB">Web</SelectItem>
          </SelectContent>
        </Select>

        {/* Pay Model Filter */}
        <Select
          value={filters.payModel || 'all'}
          onValueChange={(value) => updateFilter('payModel', value === 'all' ? null : value as UGCPayModel)}
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Pay Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pay Models</SelectItem>
            {Object.entries(PAY_MODEL_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Beginner Friendly Toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background">
          <Switch
            id="beginner-friendly"
            checked={filters.beginnerFriendly}
            onCheckedChange={(checked) => updateFilter('beginnerFriendly', checked)}
          />
          <Label htmlFor="beginner-friendly" className="text-sm cursor-pointer">
            Beginner Friendly
          </Label>
        </div>

        {/* No Followers Toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background">
          <Switch
            id="no-followers"
            checked={filters.followersRequired === 'NONE'}
            onCheckedChange={(checked) => updateFilter('followersRequired', checked ? 'NONE' : null)}
          />
          <Label htmlFor="no-followers" className="text-sm cursor-pointer">
            No Followers Required
          </Label>
        </div>
      </div>
    </div>
  );
}
