import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, MessageSquare, BarChart3, TrendingUp } from "lucide-react";
import PerformanceTracking from "@/components/employee/PerformanceTracking";
import FeedbackHistory from "@/components/employee/FeedbackHistory";
import PersonalGoals from "@/components/employee/PersonalGoals";
import EmployeeReports from "@/components/employee/EmployeeReports";

interface EmployeeDashboardProps {
  profile: any;
}

const EmployeeDashboard = ({ profile }: EmployeeDashboardProps) => {
  const [stats, setStats] = useState({
    activeGoals: 0,
    completedGoals: 0,
    unreadFeedback: 0,
    avgRating: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [profile.id]);

  const fetchStats = async () => {
    try {
      // Fetch active goals
      const { count: activeCount } = await supabase
        .from("goals")
        .select("*", { count: "exact", head: true })
        .eq("employee_id", profile.id)
        .in("status", ["pending", "in_progress"]);

      // Fetch completed goals
      const { count: completedCount } = await supabase
        .from("goals")
        .select("*", { count: "exact", head: true })
        .eq("employee_id", profile.id)
        .eq("status", "completed");

      // Fetch unread feedback
      const { count: unreadCount } = await supabase
        .from("feedback")
        .select("*", { count: "exact", head: true })
        .eq("employee_id", profile.id)
        .eq("is_read", false);

      // Fetch recent evaluations
      const { data: evaluations } = await supabase
        .from("evaluations")
        .select("overall_rating")
        .eq("employee_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(5);

      const avgRating = evaluations?.length
        ? evaluations.reduce((acc, e) => acc + e.overall_rating, 0) / evaluations.length
        : 0;

      setStats({
        activeGoals: activeCount || 0,
        completedGoals: completedCount || 0,
        unreadFeedback: unreadCount || 0,
        avgRating: Math.round(avgRating * 10) / 10,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Employee Dashboard</h2>
        <p className="text-muted-foreground">
          Track your performance, view feedback, and manage your goals.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeGoals}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Goals</CardTitle>
            <Target className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedGoals}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadFeedback}</div>
            <p className="text-xs text-muted-foreground">Unread messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating}/5</div>
            <p className="text-xs text-muted-foreground">Recent evaluations</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="goals">Personal Goals</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceTracking employeeId={profile.id} />
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <PersonalGoals employeeId={profile.id} onGoalUpdate={fetchStats} />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <FeedbackHistory employeeId={profile.id} onFeedbackRead={fetchStats} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <EmployeeReports employeeId={profile.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeDashboard;
