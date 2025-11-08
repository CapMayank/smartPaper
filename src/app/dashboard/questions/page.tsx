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
import { Plus, Search, FileQuestion } from "lucide-react";
import { QuestionType, Language, Difficulty } from "@/lib/types";
import ImageUpload from "@/components/image-upload";

interface Question {
  id: string;
  text: string;
  type: string;
  language: string;
  difficulty: string;
  marks: number;
  tags: string[];
  imageUrl?: string | null;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    language: "",
    difficulty: "",
  });
  const [formData, setFormData] = useState({
    text: "",
    type: "SHORT_ANSWER",
    language: "ENGLISH",
    difficulty: "MEDIUM",
    marks: 1,
    tags: [] as string[],
    imageUrl: "",
  });

  useEffect(() => {
    fetchQuestions();
  }, [searchText, filters]);

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams();
      if (searchText) params.append("search", searchText);
      if (filters.type) params.append("type", filters.type);
      if (filters.language) params.append("language", filters.language);
      if (filters.difficulty) params.append("difficulty", filters.difficulty);

      const response = await fetch(`/api/questions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      } else {
        toast.error("Failed to fetch questions");
      }
    } catch (error) {
      toast.error("Error fetching questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Question created successfully");
        setDialogOpen(false);
        setFormData({
          text: "",
          type: "SHORT_ANSWER",
          language: "ENGLISH",
          difficulty: "MEDIUM",
          marks: 1,
          tags: [],
          imageUrl: "",
        });
        fetchQuestions();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create question");
      }
    } catch (error) {
      toast.error("Error creating question");
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
          <h1 className="text-3xl font-bold">Question Bank</h1>
          <p className="text-gray-600 mt-1">Search and manage questions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Question</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="text">Question Text</Label>
                <textarea
                  id="text"
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  placeholder="Enter your question here..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Question Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MCQ">Multiple Choice</SelectItem>
                      <SelectItem value="FILL_IN_THE_BLANKS">Fill in the Blanks</SelectItem>
                      <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                      <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                      <SelectItem value="LONG_ANSWER">Long Answer</SelectItem>
                      <SelectItem value="ONE_WORD">One Word</SelectItem>
                      <SelectItem value="NUMERICAL">Numerical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) =>
                      setFormData({ ...formData, language: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENGLISH">English</SelectItem>
                      <SelectItem value="HINDI">Hindi</SelectItem>
                      <SelectItem value="SANSKRIT">Sanskrit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) =>
                      setFormData({ ...formData, difficulty: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="marks">Marks</Label>
                  <Input
                    id="marks"
                    type="number"
                    value={formData.marks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        marks: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    required
                  />
                </div>
              </div>
              
              {/* Image Upload - for IMAGE_QUESTION type or optional for all */}
              <div>
                <ImageUpload
                  onUploadComplete={(url) =>
                    setFormData({ ...formData, imageUrl: url })
                  }
                  currentImageUrl={formData.imageUrl}
                  label="Question Image (Optional)"
                />
                {formData.type === "IMAGE_QUESTION" && !formData.imageUrl && (
                  <p className="text-xs text-amber-600 mt-1">
                    Image is recommended for IMAGE_QUESTION type
                  </p>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Question</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search questions..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <Select
              value={filters.type}
              onValueChange={(value) =>
                setFilters({ ...filters, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="MCQ">Multiple Choice</SelectItem>
                <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                <SelectItem value="LONG_ANSWER">Long Answer</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.language}
              onValueChange={(value) =>
                setFilters({ ...filters, language: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Languages</SelectItem>
                <SelectItem value="ENGLISH">English</SelectItem>
                <SelectItem value="HINDI">Hindi</SelectItem>
                <SelectItem value="SANSKRIT">Sanskrit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-3">
        {questions.map((question) => (
          <Card key={question.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">{question.text}</p>
                  
                  {question.imageUrl && (
                    <div className="my-3">
                      <img
                        src={question.imageUrl}
                        alt="Question"
                        className="max-w-md h-auto rounded border"
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {question.type.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {question.language}
                    </span>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                      {question.difficulty}
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {question.marks} marks
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {questions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileQuestion className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center">
              No questions found. Create your first question to build your question bank.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
