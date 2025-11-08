/** @format */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, CalendarDays } from "lucide-react";

interface AcademicSession {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
}

interface ExamGroup {
  id: string;
  name: string;
  session: AcademicSession;
  _count: {
    papers: number;
  };
}

export default function ExamGroupsPage() {
  const [examGroups, setExamGroups] = useState<ExamGroup[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sessionId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examGroupsRes, sessionsRes] = await Promise.all([
        fetch("/api/exam-groups"),
        fetch("/api/sessions"),
      ]);

      if (examGroupsRes.ok && sessionsRes.ok) {
        const [examGroupsData, sessionsData] = await Promise.all([
          examGroupsRes.json(),
          sessionsRes.json(),
        ]);
        setExamGroups(examGroupsData);
        setSessions(sessionsData);
      } else {
        toast.error("Failed to fetch data");
      }
    } catch (error) {
      toast.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sessionId) {
      toast.error("Please select a session");
      return;
    }

    try {
      const response = await fetch("/api/exam-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Exam group created successfully");
        setDialogOpen(false);
        setFormData({ name: "", sessionId: "" });
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create exam group");
      }
    } catch (error) {
      toast.error("Error creating exam group");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Exam Groups</h1>
          <p className="text-gray-600 mt-1">
            Manage exam types (Quarterly, Half-Yearly, Annual)
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Exam Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Exam Group</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="session">Academic Session</Label>
                <Select
                  value={formData.sessionId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sessionId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Exam Group Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Quarterly, Half-Yearly, Annual"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Exam Group</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {examGroups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDays className="h-5 w-5 mr-2 text-indigo-500" />
                {group.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-semibold">Session:</span>{" "}
                  {group.session.name}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Papers:</span>{" "}
                  {group._count.papers}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {examGroups.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarDays className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center">
              No exam groups found. Create your first exam group to organize papers.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
