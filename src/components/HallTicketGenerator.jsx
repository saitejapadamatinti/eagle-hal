import React, { useState, useRef } from 'react';
import { Download, Eye, Plus, X } from 'lucide-react';
import jsPDF from 'jspdf';

// Class options
const classOptions = [
  "Nursery", "LKG", "UKG",
  "I", "II", "III", "IV", "V", "VI", "VII"
];

const HallTicketGenerator = () => {
  const [studentsData, setStudentsData] = useState({
    schoolName: 'KIRAN MODERN E/M SCHOOL',
    academicYear: '2025-26',
    examinationType: 'FA-1',
    student1: {
      name: '',
      class: '',
      fatherName: '',
      hallTicketNumber: '',
    },
    student2: {
      name: '',
      class: '',
      fatherName: '',
      hallTicketNumber: '',
    },
    subjects: [
      { name: "Telugu", date: "2025-08-12" },
      { name: "Hindi", date: "2025-08-12" },
      { name: "English", date: "2025-08-13" },
      { name: "Maths", date: "2025-08-13" },
      { name: "EVS", date: "2025-08-14" }
    ]
  });

  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const hallTicketRef = useRef();

  // Validation logic for all required fields
  const checkAllRequiredFields = () => {
    // School info
    if (
      !studentsData.schoolName.trim() ||
      !studentsData.academicYear.trim() ||
      !studentsData.examinationType.trim()
    ) {
      alert('Please fill all school details.');
      return false;
    }

    // Student 1 fields
    for (const [key, value] of Object.entries(studentsData.student1)) {
      if (!value.trim()) {
        alert('Please fill ALL fields for Student 1 (School Copy).');
        return false;
      }
    }

    // Student 2 fields
    for (const [key, value] of Object.entries(studentsData.student2)) {
      if (!value.trim()) {
        alert('Please fill ALL fields for Student 2 (Student Copy).');
        return false;
      }
    }

    const filteredSubjects = studentsData.subjects.filter(
      subject => subject.name.trim() && subject.date.trim()
    );
    if (filteredSubjects.length === 0) {
      alert('Please enter at least one subject with date.');
      return false;
    }
    // Ensure all subjects filled in have both name and date
    for (const subject of studentsData.subjects) {
      if ((subject.name && !subject.date) || (!subject.name && subject.date)) {
        alert('Please fill both subject name and date for every subject row.');
        return false;
      }
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentsData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStudentChange = (studentKey, field, value) => {
    setStudentsData(prev => ({
      ...prev,
      [studentKey]: {
        ...prev[studentKey],
        [field]: value
      }
    }));
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...studentsData.subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setStudentsData(prev => ({
      ...prev,
      subjects: newSubjects
    }));
  };

  const addSubject = () => {
    setStudentsData(prev => ({
      ...prev,
      subjects: [...prev.subjects, { name: '', date: '' }]
    }));
  };

  const removeSubject = (index) => {
    if (studentsData.subjects.length > 1) {
      const newSubjects = studentsData.subjects.filter((_, i) => i !== index);
      setStudentsData(prev => ({
        ...prev,
        subjects: newSubjects
      }));
    }
  };

  // PDF generator (remains unchanged)
  const downloadPDF = async () => {
    if (!checkAllRequiredFields()) return;
    setIsGeneratingPDF(true);
    // ... rest unchanged ...
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const pageWidth = 210;
      const margin = 15 - 10;
      const contentWidth = pageWidth - (2 * margin);

      const drawHallTicket = (student, isStudentCopy = false, yOffset = 0) => {
        const startY = yOffset + margin;
        const validSubjects = studentsData.subjects.filter(
          s => s.name.trim() && s.date.trim()
        );
        const minRows = 6;
        const maxRows = Math.max(minRows, validSubjects.length);
        const rowHeight = 7;
        const headerHeight = 8;
        const baseTicketHeight = 85;
        const tableHeight = headerHeight + (maxRows * rowHeight);
        const ticketHeight = baseTicketHeight + tableHeight;

        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.rect(margin + 2, startY + 2, contentWidth - 4, ticketHeight - 4);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        const schoolNameWidth = pdf.getTextWidth(studentsData.schoolName);
        pdf.text(studentsData.schoolName, (pageWidth - schoolNameWidth) / 2, startY + 15);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.setTextColor(80, 80, 80);
        const academicYearText = `Academic Year: ${studentsData.academicYear}`;
        const academicYearWidth = pdf.getTextWidth(academicYearText);
        pdf.text(academicYearText, (pageWidth - academicYearWidth) / 2, startY + 22);
        pdf.setTextColor(0, 0, 0);

        pdf.setLineWidth(0.3);
        pdf.line(margin + 15, startY + 25, pageWidth - margin - 15, startY + 25);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(15);
        const hallTicketText = 'HALL TICKET';
        const hallTicketWidth = pdf.getTextWidth(hallTicketText);
        pdf.text(hallTicketText, (pageWidth - hallTicketWidth) / 2, startY + 33);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(12);
        const examTypeWidth = pdf.getTextWidth(studentsData.examinationType);
        pdf.text(studentsData.examinationType, (pageWidth - examTypeWidth) / 2, startY + 40);

        // Details
        pdf.setFontSize(10);
        const detailsY = startY + 50;
        const leftColStart = margin + 8;
        const leftColEnd = pageWidth / 2 - 5;
        const rightColStart = pageWidth / 2 + 5;
        const rightColEnd = pageWidth - margin - 8;
        const leftLabelWidth = 32;
        const rightLabelWidth = 32;
        const row1Y = detailsY;
        const row2Y = detailsY + 10;

        pdf.setFont('helvetica', 'bold');
        pdf.text('Hall Ticket No:', leftColStart, row1Y);
        pdf.setFont('helvetica', 'normal');
        const hallTicketStartX = leftColStart + leftLabelWidth;
        pdf.text("KMEMS2025" + student.hallTicketNumber || '', hallTicketStartX, row1Y);
        pdf.setLineWidth(0.3);
        pdf.line(hallTicketStartX - 1, row1Y + 1.5, leftColEnd, row1Y + 1.5);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Student Name:', rightColStart, row1Y);
        pdf.setFont('helvetica', 'normal');
        const studentNameStartX = rightColStart + rightLabelWidth;
        pdf.text(student.name || '', studentNameStartX, row1Y);
        pdf.line(studentNameStartX - 1, row1Y + 1.5, rightColEnd, row1Y + 1.5);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Class:', leftColStart, row2Y);
        pdf.setFont('helvetica', 'normal');
        const classStartX = leftColStart + leftLabelWidth;
        pdf.text(student.class || '', classStartX, row2Y);
        pdf.line(classStartX - 1, row2Y + 1.5, leftColEnd, row2Y + 1.5);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Father Name:', rightColStart, row2Y);
        pdf.setFont('helvetica', 'normal');
        const fatherNameStartX = rightColStart + rightLabelWidth;
        pdf.text(student.fatherName || '', fatherNameStartX, row2Y);
        pdf.line(fatherNameStartX - 1, row2Y + 1.5, rightColEnd, row2Y + 1.5);

        // Subject Table
        const tableStartY = detailsY + 18;
        const tableWidth = contentWidth - 16;
        const tableStartX = margin + 8;
        pdf.setLineWidth(0.3);
        pdf.rect(tableStartX, tableStartY, tableWidth, tableHeight);

        // Table header
        pdf.setLineWidth(0.5);
        pdf.line(tableStartX, tableStartY + headerHeight, tableStartX + tableWidth, tableStartY + headerHeight);

        const col1Width = Math.floor(tableWidth * 0.33);
        const col2Width = Math.floor(tableWidth * 0.33);
        const col3Width = tableWidth - col1Width - col2Width;
        pdf.line(tableStartX + col1Width, tableStartY, tableStartX + col1Width, tableStartY + tableHeight);
        pdf.line(tableStartX + col1Width + col2Width, tableStartY, tableStartX + col1Width + col2Width, tableStartY + tableHeight);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        const col1CenterX = tableStartX + (col1Width / 2);
        const col2CenterX = tableStartX + col1Width + (col2Width / 2);
        const col3CenterX = tableStartX + col1Width + col2Width + (col3Width / 2);
        const headerTextY = tableStartY + (headerHeight / 2) + 1.5;
        pdf.text('Subject', col1CenterX, headerTextY, { align: 'center' });
        pdf.text('Date', col2CenterX, headerTextY, { align: 'center' });
        pdf.text("Invigilator's Signature", col3CenterX, headerTextY, { align: 'center' });

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        validSubjects.forEach((subject, index) => {
          const rowY = tableStartY + headerHeight + (index * rowHeight);
          if (index > 0) {
            pdf.setLineWidth(0.3);
            pdf.line(tableStartX, rowY, tableStartX + tableWidth, rowY);
          }
          const textY = rowY + (rowHeight / 2) + 1.5;
          pdf.text(subject.name, col1CenterX, textY, { align: 'center' });

          let formattedDate = '';
          if (subject.date) {
            const date = new Date(subject.date);
            formattedDate = date.toLocaleDateString('en-GB', {
              day: '2-digit', month: 'short', year: 'numeric'
            }).replace(/ /g, '-');
          }
          pdf.text(formattedDate, col2CenterX, textY, { align: 'center' });

          // Signature box instead of time
          const sigBoxWidth = col3Width * 0.8;
          const sigBoxHeight = rowHeight - 2;
          const sigBoxX = tableStartX + col1Width + col2Width + (col3Width - sigBoxWidth) / 2;
          const sigBoxY = rowY + 1;
          pdf.setLineWidth(0.2);
          pdf.rect(sigBoxX, sigBoxY, sigBoxWidth, sigBoxHeight);
        });

        // Empty rows for unused subjects
        if (validSubjects.length < minRows) {
          for (let i = validSubjects.length; i < minRows; i++) {
            const rowY = tableStartY + headerHeight + (i * rowHeight);
            pdf.setLineWidth(0.3);
            pdf.line(tableStartX, rowY, tableStartX + tableWidth, rowY);

            const sigBoxWidth = col3Width * 0.8;
            const sigBoxHeight = rowHeight - 2;
            const sigBoxX = tableStartX + col1Width + col2Width + (col3Width - sigBoxWidth) / 2;
            const sigBoxY = rowY + 1;
            pdf.setLineWidth(0.2);
            pdf.rect(sigBoxX, sigBoxY, sigBoxWidth, sigBoxHeight);
          }
        }
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(9.5);
        pdf.setTextColor(80, 80, 80);
        pdf.text("Principal's Signature", pageWidth - margin - 50, startY + ticketHeight - 10);
        pdf.setTextColor(0, 0, 0);

        return ticketHeight;
      };

      const firstTicketHeight = drawHallTicket(studentsData.student1, false, 0);
      // Separator, thin gray dash for cutting
      const separatorY = margin + firstTicketHeight + 8;
      pdf.setLineDashPattern([2, 2], 0);
      pdf.setLineWidth(0.3);
      pdf.setDrawColor(130, 130, 130);
      pdf.line(margin + 40, separatorY, pageWidth - margin - 40, separatorY);
      pdf.setLineDashPattern([], 0);

      const secondTicketOffset = separatorY + 8 - margin;
      drawHallTicket(studentsData.student2, true, secondTicketOffset);

      const filename = `Hall_Tickets_${studentsData.student1.name || 'Student'}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Preview logic: block if validation fails
  const handlePreview = () => {
    if (checkAllRequiredFields()) {
      setShowPreview(true);
    }
  };

  // Renders a single hall ticket (for preview)
  const SingleHallTicket = ({ student, isStudent2 = false }) => (
    <div className="single-ticket bg-white border-4 border-black rounded-lg overflow-hidden shadow-lg">
      <div className="ticket-content h-full flex flex-col">
        {/* Header */}
        <div className="text-center px-6 pb-4">
          <h1 className="text-xl font-bold text-black mb-2 leading-tight">{studentsData.schoolName}</h1>
          <p className="text-sm text-gray-700 mb-3">Academic Year: {studentsData.academicYear}</p>
          <div className="border-b-2 border-black mb-3 mx-4"></div>
          <h2 className="text-lg font-bold text-black tracking-wide mb-1">HALL TICKET</h2>
          <p className="text-sm font-medium text-gray-800">{studentsData.examinationType}</p>
        </div>
        {/* Student Details */}
        <div className="px-6 mb-4">
          <div className="space-y-3 grid grid-cols-2">
            <div className="flex items-center min-h-[28px]">
              <span className="text-sm font-semibold text-black w-28 flex-shrink-0">Hall Ticket No:</span>
              <div className="flex-1 border-b-2 border-black pb-1 ml-3 min-h-[20px] flex items-end">
                <span className="text-sm text-black leading-none">{student.hallTicketNumber || ''}</span>
              </div>
            </div>
            <div className="flex items-center min-h-[28px]">
              <span className="text-sm font-semibold text-black w-28 flex-shrink-0">Student Name:</span>
              <div className="flex-1 border-b-2 border-black pb-1 ml-3 min-h-[20px] flex items-end">
                <span className="text-sm text-black leading-none">{student.name || ''}</span>
              </div>
            </div>
            <div className="flex items-center min-h-[28px]">
              <span className="text-sm font-semibold text-black w-28 flex-shrink-0">Class:</span>
              <div className="flex-1 border-b-2 border-black pb-1 ml-3 min-h-[20px] flex items-end">
                <span className="text-sm text-black leading-none">{student.class || ''}</span>
              </div>
            </div>
            <div className="flex items-center min-h-[28px]">
              <span className="text-sm font-semibold text-black w-28 flex-shrink-0">Father Name:</span>
              <div className="flex-1 border-b-2 border-black pb-1 ml-3 min-h-[20px] flex items-end">
                <span className="text-sm text-black leading-none">{student.fatherName || ''}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Subject Table */}
        <div className="px-6 flex-1 pb-4">
          <div className="border-2 border-gray-500 text-xs h-full min-h-[200px] flex flex-col">
            {/* Table Header */}
            <div className="bg-gray-200 grid grid-cols-3 border-b-2 border-gray-500 flex-shrink-0">
              <div className="p-3 font-bold text-black border-r border-gray-500 text-center flex items-center justify-center">
                Subject
              </div>
              <div className="p-3 font-bold text-black border-r border-gray-500 text-center flex items-center justify-center">
                Date
              </div>
              <div className="p-3 font-bold text-black text-center flex items-center justify-center">
                Invigilator's Signature
              </div>
            </div>
            {/* Table Rows */}
            <div className="flex-1">
              {studentsData.subjects.filter(subject => subject.name.trim() && subject.date.trim()).map((subject, index) => (
                <div key={index} className="grid grid-cols-3 border-b border-gray-400 last:border-b-0 min-h-[32px]">
                  <div className="p-2 text-black border-r border-gray-400 text-center flex items-center justify-center">
                    <span className="break-words">{subject.name}</span>
                  </div>
                  <div className="p-2 text-black border-r border-gray-400 text-center flex items-center justify-center">
                    <span className="whitespace-nowrap">
                      {subject.date ? new Date(subject.date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }).replace(/ /g, '-') : ''}
                    </span>
                  </div>
                  <div className="p-2 text-black text-center flex items-center justify-center border border-gray-400 bg-white" style={{ minHeight: '28px', borderRadius: "4px" }}>
                    {/* Signature */}
                  </div>
                </div>
              ))}
              {/* Fill remaining space */}
              {Array.from({ length: Math.max(0, 6 - studentsData.subjects.filter(subject => subject.name.trim() && subject.date.trim()).length) }).map((_, index) => (
                <div key={`empty-${index}`} className="grid grid-cols-3 border-b border-gray-400 last:border-b-0 min-h-[32px]">
                  <div className="p-2 border-r border-gray-400"></div>
                  <div className="p-2 border-r border-gray-400"></div>
                  <div className="p-2 border border-gray-400 bg-white" style={{ minHeight: "28px", borderRadius: "4px" }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const HallTicketPreview = () => (
    <div ref={hallTicketRef} className="hall-ticket-container bg-white shadow-lg">
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4 flex items-stretch">
          <div className="w-full">
            <SingleHallTicket student={studentsData.student1} isStudent2={false} />
          </div>
        </div>
        <div className="flex justify-center py-2">
          <div className="border-t-2 border-dashed border-gray-400 w-4/5"></div>
        </div>
        <div className="flex-1 p-4 flex items-stretch">
          <div className="w-full">
            <SingleHallTicket student={studentsData.student2} isStudent2={true} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Dual Hall Ticket Generator</h1>
        {!showPreview ? (
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Edit Hall Ticket Details</h2>
            <div className="mb-8">
              <div className="form-grid form-grid-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">School Name:</label>
                  <input
                    required
                    type="text"
                    name="schoolName"
                    value={studentsData.schoolName}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter school name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Year:</label>
                  <input
                    required
                    type="text"
                    name="academicYear"
                    value={studentsData.academicYear}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., 2025-26"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Examination Type:</label>
                  <select
                    required
                    name="examinationType"
                    value={studentsData.examinationType}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Select</option>
                    <option value="FA-1">FA-1</option>
                    <option value="FA-2">FA-2</option>
                    <option value="FA-3">FA-3</option>
                    <option value="FA-4">FA-4</option>
                    <option value="SA-1">SA-1</option>
                    <option value="SA-2">SA-2</option>
                  </select>
                </div>
              </div>
            </div>
            {/* Student Details Side by Side */}
            <div className="form-grid form-grid-2 mb-8">
              {/* Student 1 */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Student 1 Details (School Copy)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hall Ticket Number:</label>
                    <input
                      required
                      type="text"
                      value={studentsData.student1.hallTicketNumber}
                      onChange={(e) => handleStudentChange('student1', 'hallTicketNumber', e.target.value)}
                      className="input-field bg-white border border-gray-200"
                      placeholder="Enter Hall Ticket Number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Student Name:</label>
                    <input
                      required
                      type="text"
                      value={studentsData.student1.name}
                      onChange={(e) => handleStudentChange('student1', 'name', e.target.value)}
                      className="input-field bg-white border border-gray-200"
                      placeholder="Enter student name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Class:</label>
                    <select
                      required
                      value={studentsData.student1.class}
                      onChange={(e) => handleStudentChange('student1', 'class', e.target.value)}
                      className="input-field bg-white border border-gray-200"
                    >
                      <option value="">Select class</option>
                      {classOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Father Name:</label>
                    <input
                      required
                      type="text"
                      value={studentsData.student1.fatherName}
                      onChange={(e) => handleStudentChange('student1', 'fatherName', e.target.value)}
                      className="input-field bg-white border border-gray-200"
                      placeholder="Enter father's name"
                    />
                  </div>
                </div>
              </div>
              {/* Student 2 */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Student 2 Details (Student Copy)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hall Ticket Number:</label>
                    <input
                      required
                      type="text"
                      value={studentsData.student2.hallTicketNumber}
                      onChange={(e) => handleStudentChange('student2', 'hallTicketNumber', e.target.value)}
                      className="input-field bg-white border border-gray-200"
                      placeholder="Enter Hall Ticket Number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Student Name:</label>
                    <input
                      required
                      type="text"
                      value={studentsData.student2.name}
                      onChange={(e) => handleStudentChange('student2', 'name', e.target.value)}
                      className="input-field bg-white border border-gray-200"
                      placeholder="Enter student name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Class:</label>
                    <select
                      required
                      value={studentsData.student2.class}
                      onChange={(e) => handleStudentChange('student2', 'class', e.target.value)}
                      className="input-field bg-white border border-gray-200"
                    >
                      <option value="">Select class</option>
                      {classOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Father Name:</label>
                    <input
                      required
                      type="text"
                      value={studentsData.student2.fatherName}
                      onChange={(e) => handleStudentChange('student2', 'fatherName', e.target.value)}
                      className="input-field bg-white border border-gray-200"
                      placeholder="Enter father's name"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Exam Schedule */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Exam Schedule (Common for Both Students)</h3>
              <div className="bg-gray-100 rounded-t-lg p-4 grid grid-cols-8 gap-4 font-semibold text-gray-800">
                <div className="col-span-4">Subject</div>
                <div className="col-span-3">Date</div>
                <div className="col-span-1"></div>
              </div>
              <div className="border border-gray-200 rounded-b-lg">
                {studentsData.subjects.map((subject, index) => (
                  <div key={index} className="p-4 grid grid-cols-8 gap-4 items-center border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                    <div className="col-span-4">
                      <input
                        required
                        type="text"
                        value={subject.name}
                        onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                        className="input-field px-3 py-2"
                        placeholder="Subject name"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        required
                        type="date"
                        value={subject.date}
                        onChange={(e) => handleSubjectChange(index, 'date', e.target.value)}
                        className="input-field px-3 py-2"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      {studentsData.subjects.length > 1 && (
                        <button
                          onClick={() => removeSubject(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={addSubject}
                className="btn btn-secondary"
                type="button"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Subject
              </button>
              <button
                onClick={handlePreview}
                className="btn btn-primary"
                type="button"
              >
                <Eye className="w-5 h-5 mr-2" />
                Preview Hall Tickets
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-center gap-4 mb-6 print-hidden">
              <button
                onClick={() => setShowPreview(false)}
                className="btn btn-secondary"
                type="button"
              >
                ← Back to Edit
              </button>
              <button
                onClick={downloadPDF}
                disabled={isGeneratingPDF}
                className={`btn btn-success ${isGeneratingPDF ? 'loading' : ''}`}
                type="button"
              >
                <Download className="w-5 h-5 mr-2" />
                {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
              </button>
            </div>
            <div className="flex justify-center">
              <HallTicketPreview />
            </div>
          </div>
        )}
      </div>
      {/* ... rest of your style ... */}
    </div>
  );
};

export default HallTicketGenerator;
