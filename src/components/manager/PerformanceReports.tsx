import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const PerformanceReports = () => {
  const [reportData, setReportData] = useState<any[]>([]);
  const [avgRatings, setAvgRatings] = useState<any[]>([]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    // Fetch evaluation data for charts
    const { data: evaluations } = await supabase
      .from("evaluations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (evaluations) {
      // Transform data for charts
      const chartData = evaluations.map((evaluation) => ({
        date: new Date(evaluation.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        technical: evaluation.technical_skills,
        communication: evaluation.communication,
        teamwork: evaluation.teamwork,
        leadership: evaluation.leadership,
        initiative: evaluation.initiative,
        overall: evaluation.overall_rating,
      }));

      setReportData(chartData.reverse());

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

      setAvgRatings(avgData);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Overall performance ratings over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="overall" stroke="hsl(var(--primary))" name="Overall Rating" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills Breakdown</CardTitle>
          <CardDescription>Average ratings across different skill categories</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={avgRatings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--chart-1))" name="Average Rating" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceReports;
