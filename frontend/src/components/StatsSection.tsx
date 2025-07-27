import StatsCard from "./StatsCard";
import { DollarSign, TrendingUp, Coins, Activity } from "lucide-react";

const StatsSection = () => {
  return (
    <section className="container mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Value"
          value="$23,325.00"
          change="+8.2%"
          changeType="positive"
          icon={DollarSign}
        />
        <StatsCard
          title="24h Change"
          value="+$1,892.50"
          change="+8.8%"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatsCard
          title="Active Tokens"
          value="12"
          icon={Coins}
        />
        <StatsCard
          title="Transactions"
          value="156"
          change="+12"
          changeType="positive"
          icon={Activity}
        />
      </div>
    </section>
  );
};

export default StatsSection;