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
  arrayUnion, 
  arrayRemove,
  deleteDoc
} from 'firebase/firestore';

const StudyGroups = () => {
  const { currentUser, userRole } = useAuth();
  const { alert, confirm } = useDialog();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSubject, setNewGroupSubject] = useState('CS');
  const [createLoading, setCreateLoading] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'studyGroups'));
      let groupsList = [];
      const now = Date.now();
      const twelveHoursMs = 12 * 60 * 60 * 1000;
      const expiredPromises = [];

      querySnapshot.forEach((document) => {
        const data = document.data();
        let createdTime = 0;
        
        if (data.createdAt) {
          if (data.createdAt.seconds) {
            createdTime = data.createdAt.seconds * 1000;
          } else {
            createdTime = new Date(data.createdAt).getTime();
          }
        }

        // If older than 12 hours, delete from Firestore
        if (createdTime && (now - createdTime >= twelveHoursMs)) {
          expiredPromises.push(deleteDoc(doc(db, 'studyGroups', document.id)));
        } else {
          groupsList.push({ id: document.id, ...data });
        }
      });

      // Execute deletions in the background
      if (expiredPromises.length > 0) {
        Promise.all(expiredPromises).catch(err => 
          console.error('Error deleting expired study groups:', err)
        );
      }

      setGroups(groupsList);
      setError('');
    } catch (err) {
      console.error('Error fetching study groups:', err);
      setError('Failed to fetch study groups from database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleJoinLeave = async (groupId, isMember) => {
    if (!currentUser) return;
    const groupRef = doc(db, 'studyGroups', groupId);
    const memberName = currentUser.email.split('@')[0];
    const memberObj = {
      uid: currentUser.uid,
      email: currentUser.email,
      name: memberName
    };

    try {
      if (isMember) {
        // Leave
        await updateDoc(groupRef, {
          members: arrayRemove(currentUser.uid),
          membersInfo: arrayRemove(memberObj)
        });
      } else {
        // Join
        await updateDoc(groupRef, {
          members: arrayUnion(currentUser.uid),
          membersInfo: arrayUnion(memberObj)
        });
      }

      // Refresh state locally
      setGroups(groups.map(group => {
        if (group.id === groupId) {
          const membersList = group.members || [];
          const membersInfo = group.membersInfo || [];
          return {
            ...group,
            members: isMember 
              ? membersList.filter(uid => uid !== currentUser.uid)
              : [...membersList, currentUser.uid],
            membersInfo: isMember
              ? membersInfo.filter(m => m.uid !== currentUser.uid)
              : [...membersInfo, memberObj]
          };
        }
        return group;
      }));
    } catch (err) {
      console.error('Error joining/leaving group:', err);
      alert('Error', 'Failed to update group membership: ' + err.message);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || !currentUser) return;

    try {
      setCreateLoading(true);
      const creatorName = currentUser.email.split('@')[0];
      const groupData = {
        name: newGroupName,
        subject: newGroupSubject,
        members: [currentUser.uid], // Creator is the first member
        membersInfo: [{
          uid: currentUser.uid,
          email: currentUser.email,
          name: creatorName
        }],
        createdBy: currentUser.uid,
        createdByEmail: currentUser.email,
        creatorName: creatorName,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'studyGroups'), groupData);
      
      setGroups([...groups, { id: docRef.id, ...groupData }]);
      setNewGroupName('');
      setNewGroupSubject('CS');
      setShowModal(false);
    } catch (err) {
      console.error('Error creating study group:', err);
      alert('Error', 'Failed to create group: ' + err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    const confirmed = await confirm(
      'Delete Study Group',
      'Are you sure you want to delete this study group permanently?'
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'studyGroups', groupId));
      setGroups(groups.filter(group => group.id !== groupId));
      alert('Success', 'Study group deleted successfully!');
    } catch (err) {
      console.error('Error deleting study group:', err);
      alert('Error', 'Failed to delete study group: ' + err.message);
    }
  };

  const getSubjectStyles = (subject) => {
    switch (subject) {
      case 'CS':
        return 'bg-blue-500/10 text-blue-700 border border-blue-500/20';
      case 'AI':
        return 'bg-purple-500/10 text-purple-700 border border-purple-500/20';
      case 'EE':
        return 'bg-amber-500/10 text-amber-700 border border-amber-500/20';
      case 'SE':
        return 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20';
      case 'BBA':
        return 'bg-pink-500/10 text-pink-700 border border-pink-500/20';
      default:
        return 'bg-slate-500/10 text-slate-700 border border-slate-500/20';
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
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Study Groups</h1>
              <button 
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl transition-all duration-300 font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.15)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Create New Group
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-500">Loading study groups...</p>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/30 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
                {error}
              </div>
            ) : groups.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl p-12 text-center col-span-full shadow-sm">
                <div className="flex justify-center mb-4">
                  <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No study groups yet. Create one!</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => {
                  const membersList = group.members || [];
                  const membersInfo = group.membersInfo || [];
                  const isMember = membersList.includes(currentUser?.uid);
                  const creatorEmail = group.createdByEmail || 'Anonymous';
                  const creatorName = group.creatorName || creatorEmail.split('@')[0];

                  return (
                    <div key={group.id} className="bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl p-6 hover:shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all hover:border-slate-300 hover:bg-white/80 group duration-300 shadow-sm flex flex-col justify-between relative overflow-hidden">
                      <div>
                        <div className="mb-4">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium border ${getSubjectStyles(group.subject)}`}>
                            {group.subject}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">{group.name}</h3>
                        
                        {/* Creator Info */}
                        <div className="text-xs text-slate-500 mb-4 bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
                          <p className="font-semibold text-slate-700 mb-1">Creator:</p>
                          <p className="truncate text-slate-600">{creatorName} ({creatorEmail})</p>
                        </div>

                        {/* Members List */}
                        <div className="mb-6">
                          <p className="text-xs font-semibold text-slate-700 mb-2">Members ({membersList.length}):</p>
                          {membersInfo.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No members yet</p>
                          ) : (
                            <ul className="text-xs text-slate-500 space-y-1.5 max-h-28 overflow-y-auto pr-1 custom-scrollbar">
                              {membersInfo.map((member, idx) => (
                                <li key={idx} className="border-b border-slate-100 pb-1.5 last:border-0 truncate">
                                  <span className="font-medium text-slate-700">{member.name || member.email.split('@')[0]}</span>
                                  <span className="text-slate-400 ml-1">({member.email})</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleJoinLeave(group.id, isMember)}
                        className={`w-full font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 ${
                          isMember 
                            ? 'bg-red-50/50 border border-red-200 text-red-600 hover:bg-red-50' 
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_4px_12px_rgba(37,99,235,0.15)]'
                        }`}
                      >
                        {isMember ? 'Leave Group' : 'Join Group'}
                      </button>
                      {currentUser && userRole === 'admin' && (
                        <button 
                          onClick={() => handleDeleteGroup(group.id)}
                          className="w-full mt-2.5 font-semibold px-4 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 border border-red-500/30 text-white transition-colors"
                        >
                          Delete Group (Admin)
                        </button>
                      )}
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

      {/* Create Group Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 text-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 relative">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-6">Create Study Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Group Name</label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Data Science Peer Group"
                  className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Subject / Department</label>
                <select
                  value={newGroupSubject}
                  onChange={(e) => setNewGroupSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                >
                  <option value="CS">CS (Computer Science)</option>
                  <option value="AI">AI (Artificial Intelligence)</option>
                  <option value="EE">EE (Electrical Engineering)</option>
                  <option value="SE">SE (Software Engineering)</option>
                  <option value="BBA">BBA (Business)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-slate-100/80 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl transition-all duration-300 disabled:opacity-50 font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.15)]"
                >
                  {createLoading ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGroups;
