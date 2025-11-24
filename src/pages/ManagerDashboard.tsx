import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Target, MessageSquare, BarChart3, TrendingUp } from "lucide-react";
import PerformanceEvaluations from "@/components/manager/PerformanceEvaluations";
import GoalManagement from "@/components/manager/GoalManagement";
import FeedbackManagement from "@/components/manager/FeedbackManagement";
import PerformanceReports from "@/components/manager/PerformanceReports";
import TeamManagement from "@/components/manager/TeamManagement";

interface ManagerDashboardProps {
  profile: any;
}

const ManagerDashboard = ({ profile }: ManagerDashboardProps) => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeGoals: 0,
    pendingEvaluations: 0,
    avgPerformance: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total employees count
      const { count: employeeCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "employee");

      // Fetch active goals count
      const { count: goalsCount } = await supabase
        .from("goals")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "in_progress"]);

      // Fetch recent evaluations for average rating
      const { data: evaluations } = await supabase
        .from("evaluations")
        .select("overall_rating")
        .limit(10);

      const avgRating = evaluations?.length
        ? evaluations.reduce((acc, e) => acc + e.overall_rating, 0) / evaluations.length
        : 0;

      setStats({
        totalEmployees: employeeCount || 0,
        activeGoals: goalsCount || 0,
        pendingEvaluations: 0,
        avgPerformance: Math.round(avgRating * 10) / 10,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manager Dashboard</h2>
        <p className="text-muted-foreground">
          Manage team performance, set goals, and provide feedback.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeGoals}</div>
            <p className="text-xs text-muted-foreground">In progress or pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgPerformance}/5</div>
            <p className="text-xs text-muted-foreground">Recent evaluations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="evaluations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="evaluations" className="space-y-4">
          <PerformanceEvaluations managerId={profile.id} />
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <GoalManagement managerId={profile.id} />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <FeedbackManagement managerId={profile.id} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <PerformanceReports />
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <TeamManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerDashboard;
