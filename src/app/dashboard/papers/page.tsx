/** @format */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, FileText, Calendar, BookOpen, Eye } from "lucide-react";
import Link from "next/link";

interface Paper {
  id: string;
  title: string;
  maxMarks: number;
  duration: number;
  finalized: boolean;
  examGroup: {
    name: string;
    session: {
      name: string;
    };
  };
  class: {
    name: string;
  };
  subject: {
    name: string;
  };
  createdBy: {
    name: string | null;
    email: string;
  };
  _count: {
    paperItems: number;
  };
}

export default function PapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const response = await fetch("/api/papers");
      if (response.ok) {
        const data = await response.json();
        setPapers(data);
      } else {
        toast.error("Failed to fetch papers");
      }
    } catch (error) {
      toast.error("Error fetching papers");
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold">Papers</h1>
          <p className="text-gray-600 mt-1">Manage exam papers</p>
        </div>
        <Link href="/dashboard/papers/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Paper
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {papers.map((paper) => (
          <Card key={paper.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center text-base">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  {paper.title}
                </span>
                {paper.finalized && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Finalized
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-semibold">Session:</span>{" "}
                  {paper.examGroup.session.name}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Exam:</span>{" "}
                  {paper.examGroup.name}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Class:</span> {paper.class.name}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Subject:</span>{" "}
                  {paper.subject.name}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Marks:</span> {paper.maxMarks}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Duration:</span>{" "}
                  {paper.duration} min
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Questions:</span>{" "}
                  {paper._count.paperItems}
                </p>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href={`/dashboard/papers/${paper.id}`} className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {papers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center">
              No papers found. Create your first paper to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
