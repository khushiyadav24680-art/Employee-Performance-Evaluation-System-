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
import { Plus, Target } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface GoalManagementProps {
  managerId: string;
}

const GoalManagement = ({ managerId }: GoalManagementProps) => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    title: "",
    description: "",
    target_date: "",
    status: "pending",
  });

  useEffect(() => {
    fetchGoals();
    fetchEmployees();
  }, []);

  const fetchGoals = async () => {
    const { data } = await supabase
      .from("goals")
      .select(`
        *,
        profiles!goals_employee_id_fkey(full_name, position)
      `)
      .eq("manager_id", managerId)
      .order("created_at", { ascending: false });

    if (data) setGoals(data);
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

    const { error } = await supabase.from("goals").insert({
      ...formData,
      manager_id: managerId,
      is_personal: false,
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
        description: "Goal created successfully",
      });
      setIsDialogOpen(false);
      fetchGoals();
      setFormData({
        employee_id: "",
        title: "",
        description: "",
        target_date: "",
        status: "pending",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "secondary",
      in_progress: "default",
      completed: "success",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Goal Management</CardTitle>
            <CardDescription>Set and track goals for your team members</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Set Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set New Goal</DialogTitle>
                <DialogDescription>Create a new goal for an employee</DialogDescription>
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
                          {emp.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Goal Title</Label>
                  <Input
                    placeholder="e.g., Complete React certification"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the goal..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Target Date</Label>
                  <Input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">Create Goal</Button>
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
              <TableHead>Goal</TableHead>
              <TableHead>Target Date</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No goals set yet
                </TableCell>
              </TableRow>
            ) : (
              goals.map((goal) => (
                <TableRow key={goal.id}>
                  <TableCell className="font-medium">
                    {goal.profiles?.full_name}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{goal.title}</div>
                    {goal.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {goal.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{new Date(goal.target_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={goal.progress} className="w-20" />
                      <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(goal.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default GoalManagement;
