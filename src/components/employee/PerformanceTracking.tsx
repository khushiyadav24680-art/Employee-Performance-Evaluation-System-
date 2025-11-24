import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface PerformanceTrackingProps {
  employeeId: string;
}

const PerformanceTracking = ({ employeeId }: PerformanceTrackingProps) => {
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);

  useEffect(() => {
    fetchPerformanceData();
    fetchEvaluations();
  }, [employeeId]);

  const fetchPerformanceData = async () => {
    const { data } = await supabase
      .from("performance_metrics")
      .select("*")
      .eq("employee_id", employeeId)
      .order("metric_date", { ascending: true })
      .limit(10);

    if (data) {
      const chartData = data.map((metric) => ({
        date: new Date(metric.metric_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        productivity: metric.productivity_score,
        quality: metric.quality_score,
        attendance: metric.attendance_score,
        collaboration: metric.collaboration_score,
      }));
      setPerformanceData(chartData);
    }
  };

  const fetchEvaluations = async () => {
    const { data } = await supabase
      .from("evaluations")
      .select("*")
      .eq("employee_id", employeeId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (data) setEvaluations(data);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Track your performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="productivity" stroke="hsl(var(--chart-1))" name="Productivity" strokeWidth={2} />
                <Line type="monotone" dataKey="quality" stroke="hsl(var(--chart-2))" name="Quality" strokeWidth={2} />
                <Line type="monotone" dataKey="collaboration" stroke="hsl(var(--chart-3))" name="Collaboration" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No performance data available yet
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Evaluations</CardTitle>
          <CardDescription>Your latest performance evaluations</CardDescription>
        </CardHeader>
        <CardContent>
          {evaluations.length > 0 ? (
            <div className="space-y-4">
              {evaluations.map((evaluation) => (
                <div key={evaluation.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {new Date(evaluation.period_start).toLocaleDateString()} -{" "}
                      {new Date(evaluation.period_end).toLocaleDateString()}
                    </div>
                    <div className="text-lg font-semibold">
                      {evaluation.overall_rating}/5 ⭐
                    </div>
                  </div>
                  {evaluation.strengths && (
                    <div>
                      <div className="text-sm font-medium text-success">Strengths</div>
                      <p className="text-sm text-muted-foreground">{evaluation.strengths}</p>
                    </div>
                  )}
                  {evaluation.areas_for_improvement && (
                    <div>
                      <div className="text-sm font-medium text-warning">Areas for Improvement</div>
                      <p className="text-sm text-muted-foreground">{evaluation.areas_for_improvement}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No evaluations yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceTracking;
