import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, MessageSquare } from "lucide-react";

interface FeedbackHistoryProps {
  employeeId: string;
  onFeedbackRead?: () => void;
}

const FeedbackHistory = ({ employeeId, onFeedbackRead }: FeedbackHistoryProps) => {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<any[]>([]);

  useEffect(() => {
    fetchFeedback();
  }, [employeeId]);

  const fetchFeedback = async () => {
    const { data } = await supabase
      .from("feedback")
      .select(`
        *,
        profiles!feedback_manager_id_fkey(full_name, position)
      `)
      .eq("employee_id", employeeId)
      .order("created_at", { ascending: false });

    if (data) setFeedback(data);
  };

  const markAsRead = async (feedbackId: string) => {
    const { error } = await supabase
      .from("feedback")
      .update({ is_read: true })
      .eq("id", feedbackId);

    if (!error) {
      fetchFeedback();
      if (onFeedbackRead) onFeedbackRead();
      toast({
        title: "Marked as read",
        description: "Feedback has been marked as read",
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
        <CardTitle>Feedback History</CardTitle>
        <CardDescription>View feedback from your managers</CardDescription>
      </CardHeader>
      <CardContent>
        {feedback.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            No feedback yet
          </div>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <div
                key={item.id}
                className={`border rounded-lg p-4 space-y-3 ${
                  !item.is_read ? "bg-primary/5 border-primary/20" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      From: {item.profiles?.full_name} •{" "}
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getFeedbackTypeBadge(item.feedback_type)}
                    {!item.is_read && (
                      <Badge variant="default">New</Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm">{item.content}</p>

                {item.rating && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Rating:</span>
                    <span className="text-sm">{item.rating} ⭐</span>
                  </div>
                )}

                {!item.is_read && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markAsRead(item.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackHistory;
