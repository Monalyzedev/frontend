import { Card, CardContent } from "@/components/ui/card";
import { DivideIcon as LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
}

const StatsCard = ({ title, value, change, changeType = 'neutral', icon: Icon }: StatsCardProps) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="bg-card border-border hover:border-violet-600/50 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <Icon className="w-5 h-5 text-violet-600" />
        </div>
        <div className="space-y-2">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${getChangeColor()}`}>
              {change}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;