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
import { toast } from "sonner";
import { 
  Search, 
  Plus, 
  Trash2, 
  Eye, 
  Save,
  FileText,
  ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Session {
  id: string;
  name: string;
}

interface ExamGroup {
  id: string;
  name: string;
  sessionId: string;
}

interface Class {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  classId: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
  language: string;
  difficulty: string;
  marks: number;
  tags: string[];
}

interface PaperQuestion extends Question {
  sectionName: string;
  order: number;
  paperId?: string;
}

interface SectionDefinition {
  name: string;
  questions: PaperQuestion[];
}

function SortableQuestionItem({ question, onRemove }: { question: PaperQuestion; onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded-lg p-3 mb-2 cursor-move hover:shadow-md transition-shadow"
      {...attributes}
      {...listeners}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium line-clamp-2">{question.text}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {question.type.replace(/_/g, " ")}
            </span>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
              {question.language}
            </span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              {question.marks} marks
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function CreatePaperPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // Form data
  const [title, setTitle] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedExamGroupId, setSelectedExamGroupId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [maxMarks, setMaxMarks] = useState(80);
  const [duration, setDuration] = useState(180);
  const [instructions, setInstructions] = useState("");

  // Data
  const [sessions, setSessions] = useState<Session[]>([]);
  const [examGroups, setExamGroups] = useState<ExamGroup[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Search and filters
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");

  // Paper sections
  const [sections, setSections] = useState<SectionDefinition[]>([
    { name: "Section A", questions: [] },
    { name: "Section B", questions: [] },
    { name: "Section C", questions: [] },
  ]);

  // Drag and drop
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchSessions();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      fetchExamGroups(selectedSessionId);
    }
  }, [selectedSessionId]);

  useEffect(() => {
    if (selectedClassId) {
      fetchSubjects(selectedClassId);
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (step === 2) {
      fetchQuestions();
    }
  }, [step, searchText, filterType, filterLanguage, filterDifficulty]);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions");
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const fetchExamGroups = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/exam-groups?sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setExamGroups(data);
      }
    } catch (error) {
      console.error("Error fetching exam groups:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchSubjects = async (classId: string) => {
    try {
      const response = await fetch(`/api/subjects?classId=${classId}`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams();
      if (searchText) params.append("search", searchText);
      if (filterType) params.append("type", filterType);
      if (filterLanguage) params.append("language", filterLanguage);
      if (filterDifficulty) params.append("difficulty", filterDifficulty);

      const response = await fetch(`/api/questions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!title || !selectedSessionId || !selectedExamGroupId || !selectedClassId || !selectedSubjectId) {
        toast.error("Please fill in all required fields");
        return;
      }
      setStep(2);
    }
  };

  const addQuestionToSection = (question: Question, sectionName: string) => {
    const sectionIndex = sections.findIndex((s) => s.name === sectionName);
    if (sectionIndex === -1) return;

    const newSections = [...sections];
    const newQuestion: PaperQuestion = {
      ...question,
      sectionName,
      order: newSections[sectionIndex].questions.length,
    };

    newSections[sectionIndex].questions.push(newQuestion);
    setSections(newSections);
    toast.success(`Added to ${sectionName}`);
  };

  const removeQuestionFromSection = (questionId: string, sectionName: string) => {
    const sectionIndex = sections.findIndex((s) => s.name === sectionName);
    if (sectionIndex === -1) return;

    const newSections = [...sections];
    newSections[sectionIndex].questions = newSections[sectionIndex].questions.filter(
      (q) => q.id !== questionId
    );
    setSections(newSections);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    // Find which section this question belongs to
    for (const section of sections) {
      if (section.questions.some((q) => q.id === event.active.id)) {
        setActiveSection(section.name);
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !activeSection) {
      setActiveId(null);
      setActiveSection(null);
      return;
    }

    const sectionIndex = sections.findIndex((s) => s.name === activeSection);
    if (sectionIndex === -1) {
      setActiveId(null);
      setActiveSection(null);
      return;
    }

    const oldIndex = sections[sectionIndex].questions.findIndex((q) => q.id === active.id);
    const newIndex = sections[sectionIndex].questions.findIndex((q) => q.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const newSections = [...sections];
      newSections[sectionIndex].questions = arrayMove(
        newSections[sectionIndex].questions,
        oldIndex,
        newIndex
      );
      setSections(newSections);
    }

    setActiveId(null);
    setActiveSection(null);
  };

  const calculateTotalMarks = () => {
    return sections.reduce((total, section) => {
      return total + section.questions.reduce((sum, q) => sum + q.marks, 0);
    }, 0);
  };

  const handleSavePaper = async () => {
    try {
      // Create the paper
      const paperResponse = await fetch("/api/papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          examGroupId: selectedExamGroupId,
          classId: selectedClassId,
          subjectId: selectedSubjectId,
          maxMarks,
          duration,
          instructions,
        }),
      });

      if (!paperResponse.ok) {
        throw new Error("Failed to create paper");
      }

      const paper = await paperResponse.json();

      // Add all questions to the paper
      const allQuestions = sections.flatMap((section) =>
        section.questions.map((q, index) => ({
          paperId: paper.id,
          questionId: q.id,
          sectionName: section.name,
          order: index,
          marks: q.marks,
        }))
      );

      for (const item of allQuestions) {
        await fetch(`/api/papers/${paper.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
      }

      toast.success("Paper created successfully!");
      router.push(`/dashboard/papers/${paper.id}`);
    } catch (error) {
      console.error("Error saving paper:", error);
      toast.error("Failed to save paper");
    }
  };

  const totalMarks = calculateTotalMarks();
  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);

  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Paper</h1>
          <p className="text-gray-600 mt-1">Step 1: Paper Details</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Paper Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Half-Yearly Examination 2024-25"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="session">Academic Session *</Label>
                <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
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
                <Label htmlFor="examGroup">Exam Type *</Label>
                <Select
                  value={selectedExamGroupId}
                  onValueChange={setSelectedExamGroupId}
                  disabled={!selectedSessionId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    {examGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="class">Class *</Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        Class {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Select
                  value={selectedSubjectId}
                  onValueChange={setSelectedSubjectId}
                  disabled={!selectedClassId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxMarks">Maximum Marks</Label>
                <Input
                  id="maxMarks"
                  type="number"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(parseInt(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="instructions">Instructions (Optional)</Label>
              <textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full min-h-[100px] p-2 border rounded-md"
                placeholder="Enter exam instructions..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleNext} size="lg">
            Next: Add Questions
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-gray-600">
              Questions: {totalQuestions} | Total Marks: {totalMarks}/{maxMarks}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back to Details
            </Button>
            <Button onClick={handleSavePaper} disabled={totalQuestions === 0}>
              <Save className="h-4 w-4 mr-2" />
              Save Paper
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
        {/* Left Panel - Search */}
        <div className="col-span-3 border rounded-lg p-4 overflow-y-auto">
          <h2 className="font-semibold mb-4 flex items-center">
            <Search className="h-4 w-4 mr-2" />
            Search Questions
          </h2>
          
          <div className="space-y-3">
            <Input
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="MCQ">Multiple Choice</SelectItem>
                <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                <SelectItem value="LONG_ANSWER">Long Answer</SelectItem>
                <SelectItem value="FILL_IN_THE_BLANKS">Fill in Blanks</SelectItem>
                <SelectItem value="TRUE_FALSE">True/False</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterLanguage} onValueChange={setFilterLanguage}>
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

            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Difficulties</SelectItem>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Middle Panel - Results */}
        <div className="col-span-4 border rounded-lg p-4 overflow-y-auto">
          <h2 className="font-semibold mb-4 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Available Questions ({questions.length})
          </h2>

          <div className="space-y-2">
            {questions.map((question) => (
              <div
                key={question.id}
                className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <p className="text-sm font-medium line-clamp-2 mb-2">{question.text}</p>
                <div className="flex gap-2 flex-wrap mb-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {question.type.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {question.language}
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    {question.marks} marks
                  </span>
                </div>
                <div className="flex gap-1">
                  {sections.map((section) => (
                    <Button
                      key={section.name}
                      size="sm"
                      variant="outline"
                      onClick={() => addQuestionToSection(question, section.name)}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {section.name}
                    </Button>
                  ))}
                </div>
              </div>
            ))}

            {questions.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No questions found. Try adjusting your filters.
              </p>
            )}
          </div>
        </div>

        {/* Right Panel - Paper Builder */}
        <div className="col-span-5 border rounded-lg p-4 overflow-y-auto bg-gray-50">
          <h2 className="font-semibold mb-4">Paper Structure</h2>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-4">
              {sections.map((section) => (
                <Card key={section.name}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex justify-between items-center">
                      <span>{section.name}</span>
                      <span className="text-sm font-normal text-gray-600">
                        {section.questions.length} questions |{" "}
                        {section.questions.reduce((sum, q) => sum + q.marks, 0)} marks
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SortableContext
                      items={section.questions.map((q) => q.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {section.questions.map((question) => (
                        <SortableQuestionItem
                          key={question.id}
                          question={question}
                          onRemove={() => removeQuestionFromSection(question.id, section.name)}
                        />
                      ))}
                    </SortableContext>

                    {section.questions.length === 0 && (
                      <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                        <p className="text-sm">No questions yet</p>
                        <p className="text-xs">Add questions from the middle panel</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <DragOverlay>
              {activeId ? (
                <div className="bg-white border rounded-lg p-3 shadow-lg opacity-90">
                  <p className="text-sm font-medium">Dragging question...</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
