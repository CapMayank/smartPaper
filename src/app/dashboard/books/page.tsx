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
import { Plus, Book } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  class: {
    id: string;
    name: string;
  };
}

interface BookType {
  id: string;
  name: string;
  subject: Subject;
  _count: {
    chapters: number;
    questions: number;
  };
}

export default function BooksPage() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subjectId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [booksRes, subjectsRes] = await Promise.all([
        fetch("/api/books"),
        fetch("/api/subjects"),
      ]);

      if (booksRes.ok && subjectsRes.ok) {
        const [booksData, subjectsData] = await Promise.all([
          booksRes.json(),
          subjectsRes.json(),
        ]);
        setBooks(booksData);
        setSubjects(subjectsData);
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

    if (!formData.subjectId) {
      toast.error("Please select a subject");
      return;
    }

    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Book created successfully");
        setDialogOpen(false);
        setFormData({ name: "", subjectId: "" });
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create book");
      }
    } catch (error) {
      toast.error("Error creating book");
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
          <h1 className="text-3xl font-bold">Books</h1>
          <p className="text-gray-600 mt-1">Manage textbooks for subjects</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Book
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Book</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subjectId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name} (Class {subject.class.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Book Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Sparsh, Beehive, Flamingo"
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
                <Button type="submit">Create Book</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <Card key={book.id}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="h-5 w-5 mr-2 text-amber-500" />
                {book.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-semibold">Subject:</span>{" "}
                  {book.subject.name}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Class:</span>{" "}
                  {book.subject.class.name}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Chapters:</span>{" "}
                  {book._count.chapters}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Questions:</span>{" "}
                  {book._count.questions}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {books.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Book className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center">
              No books found. Add textbooks to organize your questions by chapters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
