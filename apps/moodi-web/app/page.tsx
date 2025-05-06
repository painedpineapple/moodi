import { CreateLifeMetricForm } from "@/entities/life-metric/components/CreateLifeMetricForm";
import { GetFirstRewardsButton } from "@/entities/rewards/components/GetFirstRewardsButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 gap-4">
      <CreateLifeMetricForm />
      <GetFirstRewardsButton />
    </main>
  );
}
