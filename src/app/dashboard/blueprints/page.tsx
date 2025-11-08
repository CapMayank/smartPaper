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
import { Plus, FileText, Trash2, Copy } from "lucide-react";

interface BlueprintSection {
  name: string;
  questionType: string;
  count: number;
  marksPerQuestion: number;
  totalMarks: number;
}

interface Blueprint {
  id: string;
  name: string;
  description: string | null;
  sections: BlueprintSection[];
  createdBy: {
    name: string | null;
    email: string;
  };
  _count: {
    papers: number;
  };
}

export default function BlueprintsPage() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [sections, setSections] = useState<BlueprintSection[]>([
    {
      name: "Section A",
      questionType: "MCQ",
      count: 10,
      marksPerQuestion: 1,
      totalMarks: 10,
    },
  ]);

  useEffect(() => {
    fetchBlueprints();
  }, []);

  const fetchBlueprints = async () => {
    try {
      const response = await fetch("/api/blueprints");
      if (response.ok) {
        const data = await response.json();
        setBlueprints(data);
      } else {
        toast.error("Failed to fetch blueprints");
      }
    } catch (error) {
      toast.error("Error fetching blueprints");
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    setSections([
      ...sections,
      {
        name: `Section ${String.fromCharCode(65 + sections.length)}`,
        questionType: "SHORT_ANSWER",
        count: 5,
        marksPerQuestion: 2,
        totalMarks: 10,
      },
    ]);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const updateSection = (index: number, field: string, value: any) => {
    const newSections = [...sections];
    newSections[index] = {
      ...newSections[index],
      [field]: value,
    };

    // Recalculate total marks
    if (field === "count" || field === "marksPerQuestion") {
      newSections[index].totalMarks =
        newSections[index].count * newSections[index].marksPerQuestion;
    }

    setSections(newSections);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || sections.length === 0) {
      toast.error("Please provide a name and at least one section");
      return;
    }

    try {
      const response = await fetch("/api/blueprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          sections,
        }),
      });

      if (response.ok) {
        toast.success("Blueprint created successfully");
        setDialogOpen(false);
        setFormData({ name: "", description: "" });
        setSections([
          {
            name: "Section A",
            questionType: "MCQ",
            count: 10,
            marksPerQuestion: 1,
            totalMarks: 10,
          },
        ]);
        fetchBlueprints();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create blueprint");
      }
    } catch (error) {
      toast.error("Error creating blueprint");
    }
  };

  const getTotalMarks = (sections: BlueprintSection[]) => {
    return sections.reduce((sum, section) => sum + section.totalMarks, 0);
  };

  const getTotalQuestions = (sections: BlueprintSection[]) => {
    return sections.reduce((sum, section) => sum + section.count, 0);
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
          <h1 className="text-3xl font-bold">Blueprints</h1>
          <p className="text-gray-600 mt-1">
            Create paper templates with predefined structure
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Blueprint
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Blueprint</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Blueprint Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Class 10 Half-Yearly Blueprint"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full min-h-[60px] p-2 border rounded-md"
                  placeholder="Blueprint details..."
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Sections</h3>
                  <Button type="button" onClick={addSection} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </div>

                <div className="space-y-4">
                  {sections.map((section, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-12 gap-3 items-start">
                          <div className="col-span-3">
                            <Label className="text-xs">Section Name</Label>
                            <Input
                              value={section.name}
                              onChange={(e) =>
                                updateSection(index, "name", e.target.value)
                              }
                              placeholder="Section A"
                              size={2}
                            />
                          </div>

                          <div className="col-span-3">
                            <Label className="text-xs">Question Type</Label>
                            <Select
                              value={section.questionType}
                              onValueChange={(value) =>
                                updateSection(index, "questionType", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MCQ">MCQ</SelectItem>
                                <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                                <SelectItem value="LONG_ANSWER">Long Answer</SelectItem>
                                <SelectItem value="FILL_IN_THE_BLANKS">Fill Blanks</SelectItem>
                                <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                                <SelectItem value="ONE_WORD">One Word</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="col-span-2">
                            <Label className="text-xs">Count</Label>
                            <Input
                              type="number"
                              value={section.count}
                              onChange={(e) =>
                                updateSection(index, "count", parseInt(e.target.value))
                              }
                              min="1"
                            />
                          </div>

                          <div className="col-span-2">
                            <Label className="text-xs">Marks Each</Label>
                            <Input
                              type="number"
                              value={section.marksPerQuestion}
                              onChange={(e) =>
                                updateSection(
                                  index,
                                  "marksPerQuestion",
                                  parseInt(e.target.value)
                                )
                              }
                              min="1"
                            />
                          </div>

                          <div className="col-span-1">
                            <Label className="text-xs">Total</Label>
                            <div className="text-lg font-bold pt-2">
                              {section.totalMarks}
                            </div>
                          </div>

                          <div className="col-span-1 pt-6">
                            {sections.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSection(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">Total Questions:</span>
                    <span>{getTotalQuestions(sections)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="font-semibold">Total Marks:</span>
                    <span>{getTotalMarks(sections)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Blueprint</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {blueprints.map((blueprint) => (
          <Card key={blueprint.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  {blueprint.name}
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  {blueprint._count.papers} papers
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {blueprint.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {blueprint.description}
                </p>
              )}

              <div className="space-y-2">
                <div className="text-sm font-semibold">Sections:</div>
                {blueprint.sections.map((section: BlueprintSection, index: number) => (
                  <div
                    key={index}
                    className="text-xs bg-gray-50 p-2 rounded flex justify-between"
                  >
                    <span className="font-medium">{section.name}</span>
                    <span className="text-gray-600">
                      {section.count} × {section.marksPerQuestion}m = {section.totalMarks}m
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t flex justify-between text-sm">
                <div>
                  <span className="font-semibold">Total:</span>{" "}
                  {getTotalQuestions(blueprint.sections)} questions
                </div>
                <div>
                  <span className="font-semibold">{getTotalMarks(blueprint.sections)}</span> marks
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Created by {blueprint.createdBy.name || blueprint.createdBy.email}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {blueprints.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Copy className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center">
              No blueprints found. Create your first blueprint to standardize paper structure.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
