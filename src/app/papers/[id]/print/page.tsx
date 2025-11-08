/** @format */

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PrintPaperPage({ params }: Props) {
  const { id } = await params;

  const paper = await prisma.paper.findUnique({
    where: { id },
    include: {
      examGroup: {
        include: {
          session: true,
        },
      },
      class: true,
      subject: true,
      paperItems: {
        include: {
          question: true,
        },
        orderBy: [{ sectionName: "asc" }, { order: "asc" }],
      },
    },
  });

  if (!paper) {
    notFound();
  }

  // Group questions by section
  const sections = paper.paperItems.reduce((acc, item) => {
    if (!acc[item.sectionName]) {
      acc[item.sectionName] = [];
    }
    acc[item.sectionName].push(item);
    return acc;
  }, {} as Record<string, typeof paper.paperItems>);

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <title>{paper.title} - Print</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          @page {
            size: A4;
            margin: 20mm;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Noto Sans Devanagari', Georgia, serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
            background: white;
          }

          .page-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 3px double #000;
            padding-bottom: 15px;
          }

          .school-name {
            font-size: 18pt;
            font-weight: 700;
            margin-bottom: 8px;
            text-transform: uppercase;
          }

          .exam-info {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
            font-size: 11pt;
          }

          .exam-info-row {
            display: flex;
            justify-content: space-between;
            gap: 40px;
            margin-top: 5px;
          }

          .exam-info-item {
            flex: 1;
          }

          .label {
            font-weight: 600;
          }

          .instructions {
            margin: 20px 0;
            padding: 10px;
            border: 1px solid #000;
            background: #f9f9f9;
          }

          .instructions-title {
            font-weight: 700;
            margin-bottom: 8px;
          }

          .section {
            margin-top: 25px;
            page-break-inside: avoid;
          }

          .section-title {
            font-size: 14pt;
            font-weight: 700;
            margin-bottom: 15px;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
          }

          .question {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }

          .question-header {
            display: flex;
            gap: 10px;
            margin-bottom: 8px;
          }

          .question-number {
            font-weight: 700;
            min-width: 30px;
          }

          .question-text {
            flex: 1;
            line-height: 1.8;
          }

          .question-marks {
            margin-left: auto;
            font-weight: 600;
            white-space: nowrap;
          }

          .mcq-options {
            margin: 10px 0 10px 40px;
          }

          .mcq-option {
            margin: 5px 0;
            line-height: 1.6;
          }

          .passage {
            margin: 15px 0 15px 40px;
            padding: 15px;
            background: #f5f5f5;
            border-left: 3px solid #666;
            font-style: italic;
          }

          .passage-label {
            font-weight: 700;
            font-style: normal;
            margin-bottom: 8px;
          }

          .question-image {
            margin: 15px 0 15px 40px;
            max-width: 100%;
            height: auto;
            border: 1px solid #ddd;
            border-radius: 4px;
            page-break-inside: avoid;
          }

          .answer-space {
            margin: 10px 0 10px 40px;
            border-bottom: 1px dotted #999;
            min-height: 80px;
          }

          .question-meta {
            margin-top: 5px;
            margin-left: 40px;
            font-size: 9pt;
            color: #666;
          }

          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }

            .page-header {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
            }

            .no-print {
              display: none;
            }
          }

          @media screen {
            body {
              max-width: 210mm;
              margin: 20px auto;
              padding: 20mm;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }

            .no-print {
              position: fixed;
              top: 20px;
              right: 20px;
              z-index: 1000;
            }

            .print-button {
              padding: 10px 20px;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }

            .print-button:hover {
              background: #0056b3;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="no-print">
          <button className="print-button" onClick={() => window.print()}>
            🖨️ Print / Save as PDF
          </button>
        </div>

        <div className="page-header">
          <div className="school-name">
            Sarvodaya English Higher Secondary School, Lakhnadon
          </div>
          <div className="exam-info">
            <div className="exam-info-row">
              <div className="exam-info-item">
                <span className="label">Class:</span> {paper.class.name}
              </div>
              <div className="exam-info-item" style={{ textAlign: "center" }}>
                <span className="label">Subject:</span> {paper.subject.name}
              </div>
              <div className="exam-info-item" style={{ textAlign: "right" }}>
                <span className="label">Max Marks:</span> {paper.maxMarks}
              </div>
            </div>
            <div className="exam-info-row">
              <div className="exam-info-item">
                <span className="label">Exam:</span> {paper.examGroup.name} {paper.examGroup.session.name}
              </div>
              <div className="exam-info-item" style={{ textAlign: "center" }}>
                <span className="label">Time:</span> {paper.duration} minutes
              </div>
              <div className="exam-info-item" style={{ textAlign: "right" }}>
                <span className="label">Roll No.:</span> __________
              </div>
            </div>
          </div>
        </div>

        {paper.instructions && (
          <div className="instructions">
            <div className="instructions-title">General Instructions:</div>
            <div style={{ whiteSpace: "pre-wrap" }}>{paper.instructions}</div>
          </div>
        )}

        {Object.keys(sections).sort().map((sectionName) => (
          <div key={sectionName} className="section">
            <div className="section-title">{sectionName}</div>
            
            {sections[sectionName].map((item, index) => (
              <div key={item.id} className="question">
                <div className="question-header">
                  <div className="question-number">{index + 1}.</div>
                  <div className="question-text">{item.question.text}</div>
                  <div className="question-marks">
                    [{item.marks || item.question.marks}]
                  </div>
                </div>

                {item.question.type === "MCQ" && item.question.options.length > 0 && (
                  <div className="mcq-options">
                    {item.question.options.map((option, optIndex) => (
                      <div key={optIndex} className="mcq-option">
                        ({String.fromCharCode(97 + optIndex)}) {option}
                      </div>
                    ))}
                  </div>
                )}

                {item.question.imageUrl && (
                  <img
                    src={item.question.imageUrl}
                    alt="Question"
                    className="question-image"
                  />
                )}

                {item.question.passage && (
                  <div className="passage">
                    <div className="passage-label">Passage:</div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{item.question.passage}</div>
                  </div>
                )}

                {item.question.type === "LONG_ANSWER" && (
                  <div className="answer-space" style={{ minHeight: "150px" }} />
                )}
                {item.question.type === "SHORT_ANSWER" && (
                  <div className="answer-space" style={{ minHeight: "80px" }} />
                )}
              </div>
            ))}
          </div>
        ))}

        <script dangerouslySetInnerHTML={{
          __html: `
            document.querySelector('.print-button')?.addEventListener('click', () => {
              window.print();
            });
          `
        }} />
      </body>
    </html>
  );
}
