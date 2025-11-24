import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Star, Plus, Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface PerformanceEvaluationsProps {
  managerId: string;
}

const PerformanceEvaluations = ({ managerId }: PerformanceEvaluationsProps) => {
  const { toast } = useToast();
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    period_start: "",
    period_end: "",
    overall_rating: 3,
    technical_skills: 3,
    communication: 3,
    teamwork: 3,
    leadership: 3,
    initiative: 3,
    comments: "",
    strengths: "",
    areas_for_improvement: "",
  });

  useEffect(() => {
    fetchEvaluations();
    fetchEmployees();
  }, []);

  const fetchEvaluations = async () => {
    const { data, error } = await supabase
      .from("evaluations")
      .select(`
        *,
        profiles!evaluations_employee_id_fkey(full_name, position)
      `)
      .eq("manager_id", managerId)
      .order("created_at", { ascending: false });

    if (!error && data) setEvaluations(data);
  };

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "employee");

    if (data) setEmployees(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("evaluations").insert({
      ...formData,
      manager_id: managerId,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Evaluation created successfully",
      });
      setIsDialogOpen(false);
      fetchEvaluations();
      // Reset form
      setFormData({
        employee_id: "",
        period_start: "",
        period_end: "",
        overall_rating: 3,
        technical_skills: 3,
        communication: 3,
        teamwork: 3,
        leadership: 3,
        initiative: 3,
        comments: "",
        strengths: "",
        areas_for_improvement: "",
      });
    }
  };

  const RatingStars = ({ rating }: { rating: number }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "fill-warning text-warning" : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Performance Evaluations</CardTitle>
            <CardDescription>Create and manage employee performance evaluations</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Evaluation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Performance Evaluation</DialogTitle>
                <DialogDescription>
                  Evaluate employee performance across multiple criteria
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <Select value={formData.employee_id} onValueChange={(value) => setFormData({ ...formData, employee_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name} - {emp.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Period Start</Label>
                    <Input
                      type="date"
                      value={formData.period_start}
                      onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Period End</Label>
                    <Input
                      type="date"
                      value={formData.period_end}
                      onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Rating Criteria (1-5)</Label>
                  {[
                    { key: "overall_rating", label: "Overall Rating" },
                    { key: "technical_skills", label: "Technical Skills" },
                    { key: "communication", label: "Communication" },
                    { key: "teamwork", label: "Teamwork" },
                    { key: "leadership", label: "Leadership" },
                    { key: "initiative", label: "Initiative" },
                  ].map((criterion) => (
                    <div key={criterion.key} className="flex items-center justify-between">
                      <span className="text-sm">{criterion.label}</span>
                      <Select
                        value={formData[criterion.key as keyof typeof formData]?.toString()}
                        onValueChange={(value) =>
                          setFormData({ ...formData, [criterion.key]: parseInt(value) })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <SelectItem key={rating} value={rating.toString()}>
                              {rating} ⭐
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Strengths</Label>
                  <Textarea
                    placeholder="Describe employee strengths..."
                    value={formData.strengths}
                    onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Areas for Improvement</Label>
                  <Textarea
                    placeholder="Describe areas for improvement..."
                    value={formData.areas_for_improvement}
                    onChange={(e) => setFormData({ ...formData, areas_for_improvement: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Additional Comments</Label>
                  <Textarea
                    placeholder="Additional comments..."
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full">Create Evaluation</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Overall Rating</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No evaluations yet
                </TableCell>
              </TableRow>
            ) : (
              evaluations.map((evaluation) => (
                <TableRow key={evaluation.id}>
                  <TableCell className="font-medium">
                    {evaluation.profiles?.full_name}
                    <div className="text-sm text-muted-foreground">{evaluation.profiles?.position}</div>
                  </TableCell>
                  <TableCell>
                    {new Date(evaluation.period_start).toLocaleDateString()} -{" "}
                    {new Date(evaluation.period_end).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <RatingStars rating={evaluation.overall_rating} />
                  </TableCell>
                  <TableCell>{new Date(evaluation.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PerformanceEvaluations;
