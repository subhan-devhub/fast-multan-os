import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useDialog } from '../context/DialogContext';
import { db } from '../firebase/config';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  increment
} from 'firebase/firestore';

// Parse Google Drive file ID from a shareable link
const getGoogleDriveFileId = (url) => {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

const StudyResources = () => {
  const { currentUser, userRole } = useAuth();
  const { alert } = useDialog();
  const [resources, setResources] = useState([]);
  const [customSubjects, setCustomSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectSemester, setNewSubjectSemester] = useState('');
  const [addSubjectError, setAddSubjectError] = useState('');
  const [addSubjectLoading, setAddSubjectLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'pastpaper',
    subject: '',
    semester: '',
    year: '2024',
    description: '',
    driveUrl: ''
  });
  const [uploadErrors, setUploadErrors] = useState({});

  // Base subjects (Semester 1)
  const baseSubjects = [
    'Programming Fundamentals',
    'Calculus',
    'Islamiat',
    'Pakistan Studies',
    'English',
    'Applied Physics',
    'ICT'
  ];

  const fetchResources = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'studyResources'));
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });

      // Split custom subjects and file resources
      const subjectsList = items.filter(item => item.isSubject === true);
      const resourcesList = items.filter(item => !item.isSubject);

      setCustomSubjects(subjectsList);
      setResources(resourcesList);
      setError('');
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load study resources: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Get all subjects including custom ones
  const getAllSubjects = () => {
    return ['All Subjects', ...baseSubjects, ...customSubjects.map(s => s.name)];
  };

  // Get subjects for a specific semester
  const getSubjectsForSemester = (semester) => {
    if (semester === 'all' || !semester) {
      return getAllSubjects();
    }

    // Semester 1 subjects
    if (semester === '1') {
      const sem1Custom = customSubjects.filter(s => s.semester === 1).map(s => s.name);
      return ['Select subject', ...baseSubjects, ...sem1Custom];
    }

    // Other semesters - only custom subjects
    const semesterCustom = customSubjects.filter(s => s.semester === parseInt(semester)).map(s => s.name);
    return ['Select subject', ...semesterCustom];
  };

  // Handle add subject
  const handleAddSubject = async () => {
    setAddSubjectError('');

    if (!newSubjectName || newSubjectName.trim().length < 3) {
      setAddSubjectError('Subject name must be at least 3 characters');
      return;
    }

    if (!newSubjectSemester) {
      setAddSubjectError('Please select a semester');
      return;
    }

    // Check for duplicates
    const allExisting = [...baseSubjects, ...customSubjects.map(s => s.name)];
    if (allExisting.some(s => s.toLowerCase() === newSubjectName.trim().toLowerCase())) {
      setAddSubjectError('This subject already exists');
      return;
    }

    try {
      setAddSubjectLoading(true);
      const newSubject = {
        name: newSubjectName.trim(),
        semester: parseInt(newSubjectSemester),
        addedBy: currentUser?.email || 'Anonymous',
        addedAt: new Date().toISOString(),
        isSubject: true // flag to distinguish from resources
      };

      const docRef = await addDoc(collection(db, 'studyResources'), newSubject);

      setCustomSubjects([...customSubjects, { id: docRef.id, ...newSubject }]);
      alert('Success', `Subject "${newSubject.name}" added for Semester ${newSubject.semester}!`);

      // Reset form
      setNewSubjectName('');
      setNewSubjectSemester('');
      setShowAddSubjectModal(false);
    } catch (err) {
      console.error('Error adding subject:', err);
      setAddSubjectError('Failed to save subject: ' + err.message);
    } finally {
      setAddSubjectLoading(false);
    }
  };

  // Dummy data filtering (now uses live resources state)
  const filteredResources = resources.filter(resource => {
    const matchesTab = activeTab === 'all' || resource.type === activeTab;
    const matchesSubject = selectedSubject === 'all' || resource.subject === selectedSubject;
    const matchesSemester = selectedSemester === 'all' || resource.semester === parseInt(selectedSemester);
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSubject && matchesSemester && matchesSearch;
  });

  // Calculate stats
  const stats = {
    total: resources.length,
    pastpapers: resources.filter(r => r.type === 'pastpaper').length,
    quizzes: resources.filter(r => r.type === 'quiz').length,
    assignments: resources.filter(r => r.type === 'assignment').length
  };

  // Validate and submit Google Drive resource link
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!uploadForm.title || uploadForm.title.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters';
    }
    if (!uploadForm.subject) {
      errors.subject = 'Subject is required';
    }
    if (!uploadForm.semester) {
      errors.semester = 'Semester is required';
    }
    if (!uploadForm.driveUrl || !uploadForm.driveUrl.trim()) {
      errors.driveUrl = 'Google Drive link is required';
    } else if (!uploadForm.driveUrl.includes('drive.google.com') && !uploadForm.driveUrl.includes('docs.google.com')) {
      errors.driveUrl = 'Must be a valid Google Drive link';
    }

    if (Object.keys(errors).length > 0) {
      setUploadErrors(errors);
      return;
    }

    try {
      setUploadLoading(true);

      // Save metadata to Firestore with the Google Drive URL
      const resourceData = {
        title: uploadForm.title,
        type: uploadForm.type,
        subject: uploadForm.subject,
        semester: parseInt(uploadForm.semester),
        year: parseInt(uploadForm.year),
        description: uploadForm.description || '',
        uploadedBy: currentUser?.email || 'Anonymous',
        uploadDate: new Date().toISOString(),
        downloadCount: 0,
        fileName: `${uploadForm.title}.pdf`,
        fileSize: 'Google Drive',
        fileUrl: uploadForm.driveUrl.trim()
      };

      const docRef = await addDoc(collection(db, 'studyResources'), resourceData);

      setResources([ { id: docRef.id, ...resourceData }, ...resources]);
      alert('Success', `"${resourceData.title}" added successfully!`);
      setShowUploadModal(false);
      resetUploadForm();
    } catch (err) {
      console.error('Error saving resource:', err);
      alert('Error', 'Failed to save resource: ' + err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      title: '',
      type: 'pastpaper',
      subject: '',
      semester: '',
      year: '2024',
      description: '',
      driveUrl: ''
    });
    setUploadErrors({});
  };

  const downloadFile = async (url, fileName) => {
    // If it's a blob URL (mock mode local upload), download directly
    if (url.startsWith('blob:')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'download.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const fileId = getGoogleDriveFileId(url);
    if (fileId) {
      // Convert to Google Drive direct download URL
      const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      window.open(directDownloadUrl, '_blank');
      return;
    }

    // Fallback: Open in new tab so user can download/read it there
    window.open(url, '_blank');
  };

  const handlePreview = (resource) => {
    if (!resource.fileUrl) {
      alert('Error', `Preview not available for ${resource.fileName}`);
      return;
    }
    // Open directly in tab
    window.open(resource.fileUrl, '_blank');
  };

  const handleDownload = async (resource) => {
    if (!resource.fileUrl) {
      alert('Error', `Download URL not available for ${resource.fileName}`);
      return;
    }

    const resourceRef = doc(db, 'studyResources', resource.id);
    try {
      // Increment downloadCount in Firestore
      await updateDoc(resourceRef, {
        downloadCount: increment(1)
      });

      // Update local state
      setResources(resources.map(res => {
        if (res.id === resource.id) {
          return { ...res, downloadCount: (res.downloadCount || 0) + 1 };
        }
        return res;
      }));

      // Trigger actual download
      await downloadFile(resource.fileUrl, resource.fileName);
    } catch (err) {
      console.error('Error recording download:', err);
      // Fallback to download regardless
      await downloadFile(resource.fileUrl, resource.fileName);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF2F6] text-[#0F172A] relative overflow-hidden flex flex-col">
      {/* Background Aurora Glow Effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-400/10 to-indigo-400/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-400/8 to-pink-400/8 blur-[130px] pointer-events-none"></div>

      <Navbar />
      <div className="flex flex-1 relative z-10 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-y-auto">
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 mb-2">Study Resources</h1>
                <p className="text-slate-500">Past Papers • Quizzes • Assignments</p>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl p-4 text-center hover:bg-white/80 hover:border-slate-300 hover:shadow-md transition-all duration-300 shadow-sm">
                  <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Total Resources</p>
                </div>
                <div className="bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl p-4 text-center hover:bg-white/80 hover:border-slate-300 hover:shadow-md transition-all duration-300 shadow-sm">
                  <p className="text-2xl font-bold text-blue-600">{stats.pastpapers}</p>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Past Papers</p>
                </div>
                <div className="bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl p-4 text-center hover:bg-white/80 hover:border-slate-300 hover:shadow-md transition-all duration-300 shadow-sm">
                  <p className="text-2xl font-bold text-amber-600">{stats.quizzes}</p>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Quizzes</p>
                </div>
                <div className="bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl p-4 text-center hover:bg-white/80 hover:border-slate-300 hover:shadow-md transition-all duration-300 shadow-sm">
                  <p className="text-2xl font-bold text-emerald-600">{stats.assignments}</p>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Assignments</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${activeTab === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.15)]'
                    : 'bg-white/80 border border-slate-200/60 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('pastpaper')}
                  className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${activeTab === 'pastpaper'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.15)]'
                    : 'bg-white/80 border border-slate-200/60 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  Past Papers
                </button>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${activeTab === 'quiz'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.15)]'
                    : 'bg-white/80 border border-slate-200/60 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  Quizzes
                </button>
                <button
                  onClick={() => setActiveTab('assignment')}
                  className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${activeTab === 'assignment'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.15)]'
                    : 'bg-white/80 border border-slate-200/60 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  Assignments
                </button>
              </div>

              {/* Filter Bar */}
              <div className="bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl p-4 shadow-sm mb-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Subject Filter */}
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-4 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                  >
                    {getAllSubjects().map((subject, index) => (
                      <option key={index} value={index === 0 ? 'all' : subject}>
                        {subject}
                      </option>
                    ))}
                  </select>

                  {/* Semester Filter */}
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="px-4 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                  >
                    <option value="all">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>

                  {/* Search Bar */}
                  <input
                    type="text"
                    placeholder="Search by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                  />

                  {/* Add Subject Button */}
                  {currentUser && userRole === 'admin' && (
                    <button
                      onClick={() => setShowAddSubjectModal(true)}
                      className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/50 px-4 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm"
                    >
                      Add Subject
                    </button>
                  )}

                  {/* Upload Button */}
                  {currentUser && userRole === 'admin' && (
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.15)] text-sm"
                    >
                      Upload
                    </button>
                  )}
                </div>
              </div>

              {/* Resources Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-slate-500">Loading resources...</p>
                </div>
              ) : error ? (
                <div className="bg-red-500/10 border border-red-500/30 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
                  {error}
                </div>
              ) : filteredResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource) => (
                    <div key={resource.id} className="bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl p-6 hover:shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all hover:border-slate-300 hover:bg-white/80 group duration-300 shadow-sm flex flex-col justify-between">
                      <div>
                        {/* PDF Icon */}
                        <div className="flex items-center mb-4">
                          <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-red-600">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                            </svg>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-2">{resource.title}</h3>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="bg-blue-500/10 text-blue-700 border border-blue-500/20 text-xs px-3 py-1 rounded-full font-semibold">
                            {resource.subject}
                          </span>
                          <span className="bg-slate-100 text-slate-600 border border-slate-200 text-xs px-3 py-1 rounded-full font-semibold">
                            Semester {resource.semester}
                          </span>
                        </div>

                        {/* Meta Info */}
                        <div className="text-sm text-slate-500 mb-5 space-y-1.5 border-t border-slate-100 pt-3">
                          <p>Uploaded: {new Date(resource.uploadDate).toLocaleDateString()}</p>
                          <p>By: {resource.uploadedBy}</p>
                          <p className="flex items-center gap-1">
                            <span>Downloads:</span> {resource.downloadCount || 0}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePreview(resource)}
                          className="flex-1 bg-slate-100/80 text-slate-700 hover:bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleDownload(resource)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.15)]"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Empty State
                <div className="bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl p-12 text-center shadow-sm col-span-full">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No resources uploaded yet.</h3>
                  <p className="text-slate-500 mb-4">Be the first to upload!</p>
                  {currentUser && userRole === 'admin' && (
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl transition-all duration-300 font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.15)] text-sm"
                    >
                      Upload Resource
                    </button>
                  )}
                </div>
              )}
            </div>
          </main>
          <Footer />
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 text-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-6">Upload Resource</h2>

              <form onSubmit={handleUploadSubmit} className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Resource Title *
                  </label>
                  <input
                    type="text"
                    placeholder="PF Mid Term Spring 2024"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-white/90 border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm ${uploadErrors.title ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                      }`}
                  />
                  {uploadErrors.title && (
                    <p className="text-red-600 text-sm mt-1">{uploadErrors.title}</p>
                  )}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Type *
                  </label>
                  <div className="flex space-x-6 text-sm text-slate-700">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="pastpaper"
                        checked={uploadForm.type === 'pastpaper'}
                        onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      Past Paper
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="quiz"
                        checked={uploadForm.type === 'quiz'}
                        onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      Quiz
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="assignment"
                        checked={uploadForm.type === 'assignment'}
                        onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      Assignment
                    </label>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Subject *
                  </label>
                  <select
                    value={uploadForm.subject}
                    onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-white/90 border rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm ${uploadErrors.subject ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                      }`}
                  >
                    <option value="">Select subject</option>
                    {getSubjectsForSemester(uploadForm.semester).slice(1).map((subject, index) => (
                      <option key={index} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  {uploadErrors.subject && (
                    <p className="text-red-600 text-sm mt-1">{uploadErrors.subject}</p>
                  )}
                  {uploadForm.semester && uploadForm.semester !== '1' &&
                    getSubjectsForSemester(uploadForm.semester).length === 1 && (
                      <p className="text-amber-600 text-sm mt-1 font-semibold">
                        No subjects for Semester {uploadForm.semester}.
                        <button
                          type="button"
                          onClick={() => {
                            setShowUploadModal(false);
                            setShowAddSubjectModal(true);
                            setNewSubjectSemester(uploadForm.semester);
                          }}
                          className="text-blue-600 underline ml-1 hover:text-blue-500"
                        >
                          Add one now
                        </button>
                      </p>
                    )}
                </div>

                {/* Semester and Year */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Semester *
                    </label>
                    <select
                      value={uploadForm.semester}
                      onChange={(e) => setUploadForm({ ...uploadForm, semester: e.target.value })}
                      className={`w-full px-4 py-2.5 bg-white/90 border rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm ${uploadErrors.semester ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                        }`}
                    >
                      <option value="">Select</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                    {uploadErrors.semester && (
                      <p className="text-red-600 text-sm mt-1">{uploadErrors.semester}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Year
                    </label>
                    <select
                      value={uploadForm.year}
                      onChange={(e) => setUploadForm({ ...uploadForm, year: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                    >
                      <option value="2023">2023</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Any additional details about this resource..."
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                  />
                </div>

                {/* Google Drive Link */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Google Drive Link *
                  </label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                    value={uploadForm.driveUrl}
                    onChange={(e) => setUploadForm({ ...uploadForm, driveUrl: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-white/90 border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm ${uploadErrors.driveUrl ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                      }`}
                  />
                  {uploadErrors.driveUrl && (
                    <p className="text-red-600 text-sm mt-1">{uploadErrors.driveUrl}</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={uploadLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 rounded-xl transition-all duration-300 font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.15)] disabled:opacity-50 text-sm"
                  >
                    {uploadLoading ? 'Uploading...' : 'Upload Resource'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      resetUploadForm();
                    }}
                    className="flex-1 bg-slate-100/80 text-slate-700 hover:bg-slate-100 border border-slate-200 py-3 rounded-xl transition-all duration-300 font-semibold text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 text-slate-800 rounded-3xl shadow-2xl max-w-md w-full">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-4">Add New Subject</h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Add a custom subject for any semester. This will be available when uploading resources.
              </p>

              <div className="space-y-5">
                {/* Subject Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Object Oriented Programming"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-white/90 border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm ${addSubjectError && !newSubjectName ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                      }`}
                  />
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Semester *
                  </label>
                  <select
                    value={newSubjectSemester}
                    onChange={(e) => setNewSubjectSemester(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-white/90 border rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm ${addSubjectError && !newSubjectSemester ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                      }`}
                  >
                    <option value="">Select semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Error Message */}
                {addSubjectError && (
                  <div className="bg-red-50/50 border border-red-250 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                    {addSubjectError}
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Custom subjects are shared with all users and will appear in the subject dropdown when uploading resources.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={handleAddSubject}
                    disabled={addSubjectLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 rounded-xl transition-all duration-300 font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.15)] disabled:opacity-50 text-sm"
                  >
                    {addSubjectLoading ? 'Adding...' : 'Add Subject'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddSubjectModal(false);
                      setNewSubjectName('');
                      setNewSubjectSemester('');
                      setAddSubjectError('');
                    }}
                    className="flex-1 bg-slate-100/80 text-slate-700 hover:bg-slate-100 border border-slate-200 py-3 rounded-xl transition-all duration-300 font-semibold text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyResources;
