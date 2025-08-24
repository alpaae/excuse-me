import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Heart, TrendingUp, Calendar } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

export function StatsCard({ title, value, description, icon, trend, badge }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {badge && (
            <Badge variant={badge.variant || 'secondary'}>
              {badge.text}
            </Badge>
          )}
        </div>
        {trend && (
          <div className="flex items-center pt-2">
            <TrendingUp 
              className={`h-3 w-3 ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`} 
            />
            <span className={`text-xs ml-1 ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  totalExcuses: number;
  favoriteExcuses: number;
  thisMonthExcuses: number;
  lastMonthExcuses: number;
}

export function DashboardStats({ 
  totalExcuses, 
  favoriteExcuses, 
  thisMonthExcuses, 
  lastMonthExcuses 
}: DashboardStatsProps) {
  const monthlyGrowth = lastMonthExcuses > 0 
    ? Math.round(((thisMonthExcuses - lastMonthExcuses) / lastMonthExcuses) * 100)
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Excuses"
        value={totalExcuses}
        description="All time"
        icon={<History className="h-4 w-4" />}
      />
      
      <StatsCard
        title="Favorites"
        value={favoriteExcuses}
        description="Saved to favorites"
        icon={<Heart className="h-4 w-4" />}
        badge={{
          text: `${Math.round((favoriteExcuses / totalExcuses) * 100)}%`,
          variant: 'outline'
        }}
      />
      
      <StatsCard
        title="This Month"
        value={thisMonthExcuses}
        description="Created this month"
        icon={<Calendar className="h-4 w-4" />}
        trend={{
          value: Math.abs(monthlyGrowth),
          isPositive: monthlyGrowth >= 0
        }}
      />
      
      <StatsCard
        title="Activity"
        value={thisMonthExcuses > 0 ? 'High' : 'Low'}
        description="Compared to last month"
        icon={<TrendingUp className="h-4 w-4" />}
        badge={{
          text: thisMonthExcuses > lastMonthExcuses ? '↑' : '↓',
          variant: thisMonthExcuses > lastMonthExcuses ? 'default' : 'destructive'
        }}
      />
    </div>
  );
}
