import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useDialog } from '../context/DialogContext';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

const Faculty = () => {
  const { currentUser, userRole } = useAuth();
  const { alert, confirm } = useDialog();
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFaculty, setNewFaculty] = useState({ name: '', department: '', office: '', email: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'faculty'));
      let facultyList = [];
      querySnapshot.forEach((doc) => {
        facultyList.push({ id: doc.id, ...doc.data() });
      });

      setFaculty(facultyList);
      setError('');
    } catch (err) {
      console.error('Error fetching faculty:', err);
      setError('Failed to fetch faculty: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newFaculty.name || !newFaculty.department || !newFaculty.office || !newFaculty.email) {
      setAddError('All fields are required');
      return;
    }

    try {
      setAddLoading(true);
      setAddError('');
      
      const facultyData = {
        name: newFaculty.name,
        department: newFaculty.department,
        office: newFaculty.office,
        email: newFaculty.email,
        createdBy: currentUser?.email || 'Anonymous',
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'faculty'), facultyData);
      
      // Update local state
      setFaculty([{ id: docRef.id, ...facultyData }, ...faculty]);
      alert('Success', 'Faculty member added successfully!');
      
      // Reset form
      setNewFaculty({ name: '', department: '', office: '', email: '' });
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding faculty:', err);
      setAddError('Failed to add faculty: ' + err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteFaculty = async (facultyId) => {
    const confirmed = await confirm(
      'Delete Faculty Member',
      'Are you sure you want to delete this faculty member permanently?'
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'faculty', facultyId));
      setFaculty(faculty.filter(member => member.id !== facultyId));
      alert('Success', 'Faculty member deleted successfully!');
    } catch (err) {
      console.error('Error deleting faculty:', err);
      alert('Error', 'Failed to delete faculty member: ' + err.message);
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
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Faculty Directory</h1>
              {currentUser && userRole === 'admin' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.15)] text-sm animate-fadeIn"
                >
                  Add Faculty
                </button>
              )}
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-slate-500 text-sm font-medium">Loading faculty directory...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm font-semibold mb-4">
                {error}
              </div>
            ) : faculty.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-md border border-white/70 shadow-sm rounded-3xl p-12 text-center flex flex-col items-center col-span-full">
                <div className="bg-blue-50 text-blue-600 p-4 rounded-3xl mb-4">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No faculty added yet</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {faculty.map((member) => (
                  <div key={member.id} className="bg-white/60 backdrop-blur-md border border-white/70 shadow-sm rounded-2xl hover:bg-white/80 hover:border-slate-300 hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-tr from-blue-50 to-indigo-50 text-blue-600 border border-blue-100/50 w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 shadow-sm">
                        {member.name.split(' ').length > 1 ? member.name.split(' ')[1][0] : member.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-800 truncate mb-2">{member.name}</h3>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="truncate">{member.department}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Office: {member.office}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21.8 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="truncate">{member.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-5">
                      <a 
                        href={`mailto:${member.email}`}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl transition-all duration-300 text-center block font-semibold text-sm shadow-[0_4px_12px_rgba(37,99,235,0.1)]"
                      >
                        Send Email
                      </a>
                      {currentUser && userRole === 'admin' && (
                        <button
                          onClick={() => handleDeleteFaculty(member.id)}
                          className="bg-red-50/50 text-red-600 hover:bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl font-semibold hover:border-red-300 transition-all duration-300 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
        </div>
      </div>

      {/* Add Faculty Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-2xl text-slate-800 rounded-3xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">Add Faculty Member</h2>
              
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Dr. Arshad Ali"
                    value={newFaculty.name}
                    onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Computer Science"
                    value={newFaculty.department}
                    onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Office *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., CS-03"
                    value={newFaculty.office}
                    onChange={(e) => setNewFaculty({ ...newFaculty, office: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g., arshad.ali@nu.edu.pk"
                    value={newFaculty.email}
                    onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm transition-all"
                  />
                </div>

                {addError && (
                  <p className="text-red-600 text-sm font-semibold">{addError}</p>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 rounded-xl transition-all duration-300 font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.15)] text-sm disabled:opacity-50"
                  >
                    {addLoading ? 'Adding...' : 'Add Faculty'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewFaculty({ name: '', department: '', office: '', email: '' });
                      setAddError('');
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
    </div>
  );
};

export default Faculty;
