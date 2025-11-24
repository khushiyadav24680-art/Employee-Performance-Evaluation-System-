import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface EmployeeReportsProps {
  employeeId: string;
}

const EmployeeReports = ({ employeeId }: EmployeeReportsProps) => {
  const [skillsData, setSkillsData] = useState<any[]>([]);
  const [goalsData, setGoalsData] = useState<any>({});

  useEffect(() => {
    fetchReportData();
  }, [employeeId]);

  const fetchReportData = async () => {
    // Fetch evaluation data
    const { data: evaluations } = await supabase
      .from("evaluations")
      .select("*")
      .eq("employee_id", employeeId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (evaluations && evaluations.length > 0) {
      // Calculate average ratings
      const avgData = [
        {
          category: "Technical",
          value: evaluations.reduce((acc, e) => acc + (e.technical_skills || 0), 0) / evaluations.length,
        },
        {
          category: "Communication",
          value: evaluations.reduce((acc, e) => acc + (e.communication || 0), 0) / evaluations.length,
        },
        {
          category: "Teamwork",
          value: evaluations.reduce((acc, e) => acc + (e.teamwork || 0), 0) / evaluations.length,
        },
        {
          category: "Leadership",
          value: evaluations.reduce((acc, e) => acc + (e.leadership || 0), 0) / evaluations.length,
        },
        {
          category: "Initiative",
          value: evaluations.reduce((acc, e) => acc + (e.initiative || 0), 0) / evaluations.length,
        },
      ];

      setSkillsData(avgData);
    }

    // Fetch goals data
    const { data: goals } = await supabase
      .from("goals")
      .select("status")
      .eq("employee_id", employeeId);

    if (goals) {
      const statusCounts = goals.reduce(
        (acc, goal) => {
          acc[goal.status] = (acc[goal.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      setGoalsData(statusCounts);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Skills Assessment</CardTitle>
          <CardDescription>Your average ratings across different skill areas</CardDescription>
        </CardHeader>
        <CardContent>
          {skillsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={skillsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" name="Average Rating" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No evaluation data available yet
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Goals Overview</CardTitle>
          <CardDescription>Summary of your goals by status</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(goalsData).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(goalsData).map(([status, count]) => (
                <div key={status} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{count as number}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {status.replace("_", " ")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No goals data available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeReports;
