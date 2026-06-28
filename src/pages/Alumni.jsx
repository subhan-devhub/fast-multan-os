import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useDialog } from '../context/DialogContext';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

const getAvatarIcon = (imageType) => {
  switch (imageType) {
    case 'developer_male':
    case '👨‍💻':
      return (
        <div className="bg-indigo-50/80 p-3 rounded-2xl text-indigo-600 shrink-0">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
      );
    case 'developer_female':
    case '👩‍💻':
      return (
        <div className="bg-pink-50/80 p-3 rounded-2xl text-pink-600 shrink-0">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
      );
    case 'briefcase':
    case '💼':
      return (
        <div className="bg-slate-100 p-3 rounded-2xl text-slate-600 shrink-0">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      );
    case 'rocket':
    case '🚀':
      return (
        <div className="bg-purple-50/80 p-3 rounded-2xl text-purple-600 shrink-0">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
      );
    case 'star':
    case '🌟':
      return (
        <div className="bg-amber-50/80 p-3 rounded-2xl text-amber-600 shrink-0">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.906a1 1 0 00.95-.69l1.519-4.674z" />
          </svg>
        </div>
      );
    case 'graduate':
    case '🎓':
    default:
      return (
        <div className="bg-blue-50/80 p-3 rounded-2xl text-blue-600 shrink-0">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        </div>
      );
  }
};

const Alumni = () => {
  const { currentUser, userRole } = useAuth();
  const { alert, confirm } = useDialog();
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectedIds, setConnectedIds] = useState([]);

  // Admin form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAlumni, setNewAlumni] = useState({ name: '', batch: '', position: '', image: 'graduate', linkedin: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'alumni'));
      let alumniList = [];
      querySnapshot.forEach((doc) => {
        alumniList.push({ id: doc.id, ...doc.data() });
      });

      setAlumni(alumniList);
      setError('');
    } catch (err) {
      console.error('Error fetching alumni:', err);
      setError('Failed to fetch alumni: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const handleConnect = (alumniId, name) => {
    setConnectedIds([...connectedIds, alumniId]);
    alert('Success', `Connection request sent to ${name}!`);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newAlumni.name || !newAlumni.batch || !newAlumni.position) {
      setAddError('All fields are required');
      return;
    }

    try {
      setAddLoading(true);
      setAddError('');
      
      const alumniData = {
        name: newAlumni.name,
        batch: parseInt(newAlumni.batch),
        position: newAlumni.position,
        image: newAlumni.image || 'graduate',
        linkedin: newAlumni.linkedin || 'https://www.linkedin.com',
        createdBy: currentUser?.email || 'Anonymous',
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'alumni'), alumniData);
      
      // Update local state
      setAlumni([{ id: docRef.id, ...alumniData }, ...alumni]);
      alert('Success', 'Alumni profile added successfully!');
      
      // Reset form
      setNewAlumni({ name: '', batch: '', position: '', image: 'graduate', linkedin: '' });
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding alumni:', err);
      setAddError('Failed to add alumni: ' + err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteAlumni = async (alumniId) => {
    const confirmed = await confirm(
      'Delete Alumni Profile',
      'Are you sure you want to delete this alumni profile permanently?'
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'alumni', alumniId));
      setAlumni(alumni.filter(person => person.id !== alumniId));
      alert('Success', 'Alumni profile deleted successfully!');
    } catch (err) {
      console.error('Error deleting alumni:', err);
      alert('Error', 'Failed to delete alumni profile: ' + err.message);
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
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Alumni Network</h1>
              {currentUser && userRole === 'admin' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.15)] text-sm animate-fadeIn"
                >
                  Add Alumni
                </button>
              )}
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-slate-500 text-sm font-medium">Loading alumni directory...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm font-semibold mb-4">
                {error}
              </div>
            ) : alumni.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-md border border-white/70 shadow-sm rounded-3xl p-12 text-center flex flex-col items-center">
                <div className="bg-blue-50 text-blue-600 p-4 rounded-3xl mb-4">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No alumni profiles yet</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {alumni.map((person) => {
                  const isConnected = connectedIds.includes(person.id);
                  return (
                    <div key={person.id} className="bg-white/60 backdrop-blur-md border border-white/70 shadow-sm rounded-2xl hover:bg-white/80 hover:border-slate-300 hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="shrink-0">{getAvatarIcon(person.image)}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-slate-800 truncate">{person.name}</h3>
                          <p className="text-xs text-slate-500 font-medium">Batch of {person.batch}</p>
                          <p className="text-sm text-slate-700 mt-2 font-medium">{person.position}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-5">
                        <a 
                          href={person.linkedin || "https://www.linkedin.com"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleConnect(person.id, person.name)}
                          className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-center text-sm transition-all duration-300 ${
                            isConnected 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default pointer-events-none'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/10'
                          }`}
                        >
                          {isConnected ? 'Requested' : 'Connect'}
                        </a>
                        {currentUser && userRole === 'admin' && (
                          <button
                            onClick={() => handleDeleteAlumni(person.id)}
                            className="bg-red-50/50 text-red-600 hover:bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl font-semibold hover:border-red-300 transition-all duration-300 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
        <Footer />
        </div>
      </div>

      {/* Add Alumni Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-2xl text-slate-800 rounded-3xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">Add Alumni Profile</h2>
              
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Ahmed Ali Khan"
                    value={newAlumni.name}
                    onChange={(e) => setNewAlumni({ ...newAlumni, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Graduation Batch *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g., 2024"
                    value={newAlumni.batch}
                    onChange={(e) => setNewAlumni({ ...newAlumni, batch: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Position *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Software Engineer at Google"
                    value={newAlumni.position}
                    onChange={(e) => setNewAlumni({ ...newAlumni, position: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="e.g., https://www.linkedin.com/in/username"
                    value={newAlumni.linkedin}
                    onChange={(e) => setNewAlumni({ ...newAlumni, linkedin: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Display Avatar
                  </label>
                  <select
                    value={newAlumni.image}
                    onChange={(e) => setNewAlumni({ ...newAlumni, image: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm transition-all"
                  >
                    <option value="graduate">Graduate Cap</option>
                    <option value="developer_male">Developer (Male)</option>
                    <option value="developer_female">Developer (Female)</option>
                    <option value="briefcase">Professional Briefcase</option>
                    <option value="rocket">Rocket</option>
                    <option value="star">Star</option>
                  </select>
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
                    {addLoading ? 'Adding...' : 'Add Alumni'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewAlumni({ name: '', batch: '', position: '', image: 'graduate' });
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

export default Alumni;
