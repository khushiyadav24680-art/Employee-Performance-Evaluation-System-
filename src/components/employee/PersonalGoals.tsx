import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Target } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PersonalGoalsProps {
  employeeId: string;
  onGoalUpdate?: () => void;
}

const PersonalGoals = ({ employeeId, onGoalUpdate }: PersonalGoalsProps) => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_date: "",
    progress: 0,
    status: "pending",
  });

  useEffect(() => {
    fetchGoals();
  }, [employeeId]);

  const fetchGoals = async () => {
    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("employee_id", employeeId)
      .order("created_at", { ascending: false });

    if (data) setGoals(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingGoal) {
      const { error } = await supabase
        .from("goals")
        .update({
          ...formData,
        })
        .eq("id", editingGoal.id);

      if (!error) {
        toast({
          title: "Success",
          description: "Goal updated successfully",
        });
      }
    } else {
      const { error } = await supabase.from("goals").insert({
        ...formData,
        employee_id: employeeId,
        is_personal: true,
      });

      if (!error) {
        toast({
          title: "Success",
          description: "Goal created successfully",
        });
      }
    }

    setIsDialogOpen(false);
    setEditingGoal(null);
    fetchGoals();
    if (onGoalUpdate) onGoalUpdate();
    setFormData({
      title: "",
      description: "",
      target_date: "",
      progress: 0,
      status: "pending",
    });
  };

  const openEditDialog = (goal: any) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || "",
      target_date: goal.target_date,
      progress: goal.progress,
      status: goal.status,
    });
    setIsDialogOpen(true);
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
            <CardTitle>Personal Goals</CardTitle>
            <CardDescription>Set and track your personal development goals</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingGoal(null);
              setFormData({
                title: "",
                description: "",
                target_date: "",
                progress: 0,
                status: "pending",
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingGoal ? "Update Goal" : "Create Personal Goal"}</DialogTitle>
                <DialogDescription>
                  {editingGoal ? "Update your goal details" : "Set a new personal development goal"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Goal Title</Label>
                  <Input
                    placeholder="e.g., Learn a new programming language"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe your goal..."
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

                {editingGoal && (
                  <>
                    <div className="space-y-2">
                      <Label>Progress (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.progress}
                        onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <Button type="submit" className="w-full">
                  {editingGoal ? "Update Goal" : "Create Goal"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Goal</TableHead>
              <TableHead>Target Date</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No goals set yet. Create your first goal!
                </TableCell>
              </TableRow>
            ) : (
              goals.map((goal) => (
                <TableRow key={goal.id}>
                  <TableCell>
                    <div className="font-medium">{goal.title}</div>
                    {goal.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {goal.description}
                      </div>
                    )}
                    {!goal.is_personal && (
                      <Badge variant="outline" className="mt-1">Manager Set</Badge>
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
                  <TableCell>
                    {goal.is_personal && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(goal)}
                      >
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PersonalGoals;
