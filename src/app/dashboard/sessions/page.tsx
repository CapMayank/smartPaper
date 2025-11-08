/** @format */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Calendar } from "lucide-react";

interface AcademicSession {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  isActive: boolean;
  _count: {
    examGroups: number;
  };
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 1,
    isActive: true,
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions");
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      } else {
        toast.error("Failed to fetch sessions");
      }
    } catch (error) {
      toast.error("Error fetching sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Session created successfully");
        setDialogOpen(false);
        setFormData({
          name: "",
          startYear: new Date().getFullYear(),
          endYear: new Date().getFullYear() + 1,
          isActive: true,
        });
        fetchSessions();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create session");
      }
    } catch (error) {
      toast.error("Error creating session");
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
          <h1 className="text-3xl font-bold">Academic Sessions</h1>
          <p className="text-gray-600 mt-1">Manage academic years and sessions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Academic Session</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Session Name (e.g., 2024-25)</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="2024-25"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startYear">Start Year</Label>
                  <Input
                    id="startYear"
                    type="number"
                    value={formData.startYear}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startYear: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endYear">End Year</Label>
                  <Input
                    id="endYear"
                    type="number"
                    value={formData.endYear}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        endYear: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="isActive">Active Session</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Session</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                  {session.name}
                </span>
                {session.isActive && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Active
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-semibold">Year:</span> {session.startYear} - {session.endYear}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Exam Groups:</span> {session._count.examGroups}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sessions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center">
              No academic sessions found. Create your first session to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
