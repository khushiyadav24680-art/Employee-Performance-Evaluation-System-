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
import { Plus, MessageSquare } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface FeedbackManagementProps {
  managerId: string;
}

const FeedbackManagement = ({ managerId }: FeedbackManagementProps) => {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    feedback_type: "general",
    title: "",
    content: "",
    rating: 3,
  });

  useEffect(() => {
    fetchFeedback();
    fetchEmployees();
  }, []);

  const fetchFeedback = async () => {
    const { data } = await supabase
      .from("feedback")
      .select(`
        *,
        profiles!feedback_employee_id_fkey(full_name, position)
      `)
      .eq("manager_id", managerId)
      .order("created_at", { ascending: false });

    if (data) setFeedback(data);
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

    const { error } = await supabase.from("feedback").insert({
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
        description: "Feedback submitted successfully",
      });
      setIsDialogOpen(false);
      fetchFeedback();
      setFormData({
        employee_id: "",
        feedback_type: "general",
        title: "",
        content: "",
        rating: 3,
      });
    }
  };

  const getFeedbackTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      positive: "success",
      constructive: "warning",
      general: "secondary",
    };
    return <Badge variant={variants[type] || "secondary"}>{type}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Feedback Management</CardTitle>
            <CardDescription>Provide feedback to your team members</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Give Feedback
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Provide Feedback</DialogTitle>
                <DialogDescription>Share feedback with an employee</DialogDescription>
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
                  <Label>Feedback Type</Label>
                  <Select value={formData.feedback_type} onValueChange={(value) => setFormData({ ...formData, feedback_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="constructive">Constructive</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Brief feedback title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Feedback Content</Label>
                  <Textarea
                    placeholder="Your feedback..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rating (1-5)</Label>
                  <Select value={formData.rating.toString()} onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}>
                    <SelectTrigger>
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

                <Button type="submit" className="w-full">Submit Feedback</Button>
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
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedback.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No feedback provided yet
                </TableCell>
              </TableRow>
            ) : (
              feedback.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.profiles?.full_name}
                  </TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{getFeedbackTypeBadge(item.feedback_type)}</TableCell>
                  <TableCell>{item.rating} ⭐</TableCell>
                  <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={item.is_read ? "secondary" : "default"}>
                      {item.is_read ? "Read" : "Unread"}
                    </Badge>
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

export default FeedbackManagement;
