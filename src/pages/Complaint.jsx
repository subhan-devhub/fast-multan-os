import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useDialog } from '../context/DialogContext';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { stripHtml, validateLength, validateInputFormat } from '../utils/validation';

const Complaint = () => {
  const { currentUser, userRole } = useAuth();
  const { alert, confirm } = useDialog();
  
  // Student form state
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Admin complaints state
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      setComplaintsLoading(true);
      const querySnapshot = await getDocs(collection(db, 'complaints'));
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      // Sort by date/createdAt descending
      items.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
      });
      setComplaints(items);
      setError('');
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to load complaints: ' + err.message);
    } finally {
      setComplaintsLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'admin') {
      fetchComplaints();
    }
  }, [userRole]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const sanitizedCategory = stripHtml(formData.category.trim());
    const sanitizedSubject = stripHtml(formData.subject.trim());
    const sanitizedDescription = stripHtml(formData.description.trim());

    // Length check
    if (!validateLength(sanitizedCategory, 500) || !validateLength(sanitizedSubject, 500) || !validateLength(sanitizedDescription, 2000)) {
      setError('Invalid input format.');
      setLoading(false);
      return;
    }

    // Malformed check
    if (!validateInputFormat(sanitizedSubject) || !validateInputFormat(sanitizedDescription)) {
      setError('Invalid input format.');
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, 'complaints'), {
        category: sanitizedCategory,
        subject: sanitizedSubject,
        description: sanitizedDescription,
        userId: currentUser?.uid || 'anonymous',
        userEmail: currentUser?.email || 'anonymous',
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setFormData({ category: '', subject: '', description: '' });
    } catch (err) {
      console.error('Error submitting complaint:', err);
      setError('Failed to submit complaint: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      const docRef = doc(db, 'complaints', id);
      await updateDoc(docRef, { status: 'resolved' });
      setComplaints(complaints.map(c => c.id === id ? { ...c, status: 'resolved' } : c));
      alert('Success', 'Complaint marked as resolved!');
    } catch (err) {
      console.error('Error resolving complaint:', err);
      alert('Error', 'Failed to resolve complaint: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm(
      'Delete Complaint',
      'Are you sure you want to delete this complaint?'
    );
    if (!confirmed) return;
    try {
      const docRef = doc(db, 'complaints', id);
      await deleteDoc(docRef);
      setComplaints(complaints.filter(c => c.id !== id));
      alert('Success', 'Complaint deleted successfully!');
    } catch (err) {
      console.error('Error deleting complaint:', err);
      alert('Error', 'Failed to delete complaint: ' + err.message);
    }
  };

  // Helper for rendering category badges
  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case 'academic': return 'bg-blue-50 text-blue-600 border border-blue-100/50';
      case 'infrastructure': return 'bg-amber-50 text-amber-600 border border-amber-100/50';
      case 'faculty': return 'bg-purple-50 text-purple-600 border border-purple-100/50';
      case 'administration': return 'bg-indigo-50 text-indigo-600 border border-indigo-100/50';
      default: return 'bg-slate-50 text-slate-600 border border-slate-200/50';
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
            <div className="max-w-4xl mx-auto">
            {userRole === 'admin' ? (
              // Admin View: Complaints Console
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 mb-8">Complaints Console</h1>
                
                {complaintsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-slate-500 text-sm font-medium">Loading student complaints...</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm font-semibold mb-4 animate-fadeIn">
                    {error}
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="bg-white/60 backdrop-blur-md border border-white/70 shadow-sm rounded-3xl p-12 text-center flex flex-col items-center">
                    <div className="bg-blue-50 text-blue-600 p-4 rounded-3xl mb-4">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No complaints submitted yet</h3>
                    <p className="text-slate-500 text-sm font-medium">All student reports are resolved or clear!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {complaints.map((complaint) => {
                      const date = complaint.createdAt?.seconds 
                        ? new Date(complaint.createdAt.seconds * 1000).toLocaleString() 
                        : (complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : 'N/A');

                      return (
                        <div key={complaint.id} className="bg-white/60 backdrop-blur-md border border-white/70 shadow-sm rounded-2xl hover:bg-white/80 hover:border-slate-300 hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between">
                          <div>
                            <div className="flex flex-wrap justify-between items-start mb-4 gap-2">
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider ${getCategoryBadgeColor(complaint.category)}`}>
                                  {complaint.category || 'other'}
                                </span>
                                <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider ${
                                  complaint.status === 'resolved' 
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' 
                                    : 'bg-rose-50 text-rose-600 border border-rose-100/50'
                                }`}>
                                  {complaint.status || 'pending'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{date}</span>
                              </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 mb-2">{complaint.subject}</h3>
                            <p className="text-sm text-slate-600 mb-4 whitespace-pre-line leading-relaxed">{complaint.description}</p>
                          </div>

                          <div className="border-t border-slate-100 pt-4 flex flex-wrap justify-between items-center gap-4">
                            <div className="flex items-center text-xs text-slate-500">
                              <svg className="w-4 h-4 text-slate-400 shrink-0 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>Submitted by: <strong className="text-slate-700 font-semibold">{complaint.userEmail}</strong></span>
                            </div>
                            <div className="flex space-x-2">
                              {complaint.status !== 'resolved' && (
                                <button
                                  onClick={() => handleResolve(complaint.id)}
                                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs px-4 py-2 rounded-xl font-semibold shadow-[0_4px_12px_rgba(16,185,129,0.15)] transition-all duration-300"
                                >
                                  Mark Resolved
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(complaint.id)}
                                className="bg-red-50/50 text-red-600 hover:bg-red-50 border border-red-200 text-xs px-4 py-2 rounded-xl font-semibold hover:border-red-300 transition-all duration-300"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              // Student View: Submit a Complaint
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 mb-8">Submit a Complaint</h1>
                
                <div className="bg-white/60 backdrop-blur-md border border-white/70 shadow-sm rounded-3xl p-8">
                  {success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-2xl text-sm font-semibold mb-6 animate-fadeIn">
                      Complaint submitted successfully! We will look into it.
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm font-semibold mb-6 animate-fadeIn">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="category" className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm transition-all"
                      >
                        <option value="">Select a category</option>
                        <option value="academic">Academic</option>
                        <option value="infrastructure">Infrastructure</option>
                        <option value="faculty">Faculty</option>
                        <option value="administration">Administration</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Subject
                      </label>
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm transition-all"
                        placeholder="Brief description of the issue"
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        required
                        value={formData.description}
                        onChange={handleChange}
                        rows="6"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm transition-all"
                        placeholder="Provide detailed information about your complaint"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(37,99,235,0.15)] text-sm disabled:opacity-50"
                    >
                      {loading ? 'Submitting Complaint...' : 'Submit Complaint'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
        </div>
      </div>
    </div>
  );
};

export default Complaint;





