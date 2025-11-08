/** @format */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  FileText, 
  Download,
  Lock,
  Printer
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Question {
  id: string;
  text: string;
  type: string;
  language: string;
  difficulty: string;
  marks: number;
  options: string[];
  correctAnswer: string | null;
  passage: string | null;
}

interface PaperItem {
  id: string;
  sectionName: string;
  order: number;
  marks: number | null;
  question: Question;
}

interface Paper {
  id: string;
  title: string;
  maxMarks: number;
  duration: number;
  instructions: string | null;
  finalized: boolean;
  finalizedAt: string | null;
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
  paperItems: PaperItem[];
}

export default function PaperDetailPage() {
  const params = useParams();
  const paperId = params?.id as string;
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paperId) {
      fetchPaper();
    }
  }, [paperId]);

  const fetchPaper = async () => {
    try {
      const response = await fetch(`/api/papers/${paperId}`);
      if (response.ok) {
        const data = await response.json();
        setPaper(data);
      } else {
        toast.error("Failed to fetch paper");
      }
    } catch (error) {
      toast.error("Error fetching paper");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    try {
      const response = await fetch(`/api/papers/${paperId}/finalize`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Paper finalized successfully!");
        fetchPaper();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to finalize paper");
      }
    } catch (error) {
      toast.error("Error finalizing paper");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-gray-500 mb-4">Paper not found</p>
        <Link href="/dashboard/papers">
          <Button>Back to Papers</Button>
        </Link>
      </div>
    );
  }

  // Group questions by section
  const sections = paper.paperItems.reduce((acc, item) => {
    if (!acc[item.sectionName]) {
      acc[item.sectionName] = [];
    }
    acc[item.sectionName].push(item);
    return acc;
  }, {} as Record<string, PaperItem[]>);

  // Sort items within each section by order
  Object.keys(sections).forEach((sectionName) => {
    sections[sectionName].sort((a, b) => a.order - b.order);
  });

  const totalMarks = paper.paperItems.reduce(
    (sum, item) => sum + (item.marks || item.question.marks),
    0
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <Link href="/dashboard/papers">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Papers
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{paper.title}</h1>
          <div className="flex gap-4 mt-2 text-sm text-gray-600">
            <span>Session: {paper.examGroup.session.name}</span>
            <span>•</span>
            <span>Exam: {paper.examGroup.name}</span>
            <span>•</span>
            <span>Class: {paper.class.name}</span>
            <span>•</span>
            <span>Subject: {paper.subject.name}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {!paper.finalized && (
            <Button onClick={handleFinalize} variant="default">
              <Lock className="h-4 w-4 mr-2" />
              Finalize Paper
            </Button>
          )}
          <Link href={`/papers/${paper.id}/print`} target="_blank">
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print / PDF
            </Button>
          </Link>
        </div>
      </div>

      {paper.finalized && (
        <Card className="border-green-500 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700">
              <Lock className="h-5 w-5" />
              <span className="font-semibold">
                This paper has been finalized on{" "}
                {new Date(paper.finalizedAt!).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Paper Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Maximum Marks</p>
              <p className="text-2xl font-bold">{paper.maxMarks}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Marks (Current)</p>
              <p className="text-2xl font-bold">{totalMarks}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-2xl font-bold">{paper.duration} min</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Questions</p>
              <p className="text-2xl font-bold">{paper.paperItems.length}</p>
            </div>
          </div>

          {paper.instructions && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-1">Instructions:</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {paper.instructions}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paper Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Printer className="h-5 w-5 mr-2" />
            Paper Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white border-2 rounded-lg p-8 space-y-6">
            {/* Header */}
            <div className="text-center border-b-2 pb-4">
              <h2 className="text-2xl font-bold">
                SARVODAYA ENGLISH HIGHER SECONDARY SCHOOL, LAKHNADON
              </h2>
              <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                <div className="text-left">
                  <span className="font-semibold">Class:</span> {paper.class.name}
                </div>
                <div className="text-center">
                  <span className="font-semibold">Subject:</span> {paper.subject.name}
                </div>
                <div className="text-right">
                  <span className="font-semibold">Max Marks:</span> {paper.maxMarks}
                </div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                <div className="text-left">
                  <span className="font-semibold">Exam:</span> {paper.examGroup.name} {paper.examGroup.session.name}
                </div>
                <div className="text-center">
                  <span className="font-semibold">Time:</span> {paper.duration} minutes
                </div>
                <div className="text-right">
                  <span className="font-semibold">Roll No.:</span> __________
                </div>
              </div>
            </div>

            {/* Instructions */}
            {paper.instructions && (
              <div className="border-b pb-4">
                <p className="font-semibold mb-2">Instructions:</p>
                <p className="text-sm whitespace-pre-wrap">{paper.instructions}</p>
              </div>
            )}

            {/* Sections */}
            {Object.keys(sections).sort().map((sectionName) => (
              <div key={sectionName} className="space-y-4">
                <h3 className="text-xl font-bold border-b pb-2">{sectionName}</h3>
                
                {sections[sectionName].map((item, index) => (
                  <div key={item.id} className="pl-4 space-y-2">
                    <div className="flex gap-4">
                      <span className="font-semibold">{index + 1}.</span>
                      <div className="flex-1">
                        <p className="mb-2">{item.question.text}</p>
                        
                        {item.question.type === "MCQ" && item.question.options.length > 0 && (
                          <div className="pl-4 space-y-1">
                            {item.question.options.map((option, optIndex) => (
                              <p key={optIndex} className="text-sm">
                                ({String.fromCharCode(97 + optIndex)}) {option}
                              </p>
                            ))}
                          </div>
                        )}
                        
                        {item.question.passage && (
                          <div className="bg-gray-50 p-3 rounded my-2 text-sm italic">
                            <p className="font-semibold mb-1">Passage:</p>
                            <p className="whitespace-pre-wrap">{item.question.passage}</p>
                          </div>
                        )}
                        
                        <div className="flex gap-4 text-sm text-gray-600 mt-2">
                          <span className="bg-blue-100 px-2 py-1 rounded text-xs">
                            {item.question.type.replace(/_/g, " ")}
                          </span>
                          <span className="bg-green-100 px-2 py-1 rounded text-xs">
                            [{item.marks || item.question.marks} marks]
                          </span>
                          {item.question.language !== "ENGLISH" && (
                            <span className="bg-purple-100 px-2 py-1 rounded text-xs">
                              {item.question.language}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
