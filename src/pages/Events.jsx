import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  arrayUnion, 
  arrayRemove,
  deleteDoc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { stripHtml, validateLength, validateInputFormat, validateFileSize } from '../utils/validation';

const Events = () => {
  const { currentUser, userRole } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    date: '', 
    location: '', 
    type: 'free', 
    fee: '', 
    bankName: '', 
    accountTitle: '', 
    accountNumber: '' 
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Payment & Registration modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [activeRegEvent, setActiveRegEvent] = useState(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [payError, setPayError] = useState('');
  const [payLoading, setPayLoading] = useState(false);

  // Custom dialog states
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: 'confirm', // 'confirm' | 'alert'
    title: '',
    message: '',
    onConfirm: null
  });

  const triggerConfirm = (title, message, onConfirm) => {
    setDialogState({
      isOpen: true,
      type: 'confirm',
      title,
      message,
      onConfirm
    });
  };

  const triggerAlert = (title, message) => {
    setDialogState({
      isOpen: true,
      type: 'alert',
      title,
      message,
      onConfirm: null
    });
  };

  // Admin view registrations modal state
  const [showRegsListModal, setShowRegsListModal] = useState(false);
  const [activeViewEvent, setActiveViewEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [regsLoading, setRegsLoading] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [userRegDetails, setUserRegDetails] = useState({});

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'events'));
      let eventsList = [];
      querySnapshot.forEach((doc) => {
        eventsList.push({ id: doc.id, ...doc.data() });
      });
      
      setEvents(eventsList);
      setError('');

      if (currentUser) {
        const details = {};
        for (const ev of eventsList) {
          const registeredUsers = ev.registeredUsers || [];
          if (ev.type === 'paid' && registeredUsers.includes(currentUser.uid)) {
            try {
              const regDocRef = doc(db, 'events', ev.id, 'registrations', currentUser.uid);
              const regDocSnap = await getDoc(regDocRef);
              if (regDocSnap.exists()) {
                details[ev.id] = regDocSnap.data();
              }
            } catch (err) {
              console.error('Error fetching registration status:', err);
            }
          }
        }
        setUserRegDetails(details);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events from database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser !== undefined) {
      fetchEvents();
    }
  }, [currentUser]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');

    const sanitizedTitle = stripHtml(newEvent.title.trim());
    const sanitizedDate = stripHtml(newEvent.date.trim());
    const sanitizedLocation = stripHtml(newEvent.location.trim());
    const sanitizedType = stripHtml(newEvent.type.trim());
    const sanitizedFee = newEvent.type === 'paid' ? stripHtml(String(newEvent.fee).trim()) : '';
    const sanitizedBankName = newEvent.type === 'paid' ? stripHtml(newEvent.bankName.trim()) : '';
    const sanitizedAccountTitle = newEvent.type === 'paid' ? stripHtml(newEvent.accountTitle.trim()) : '';
    const sanitizedAccountNumber = newEvent.type === 'paid' ? stripHtml(newEvent.accountNumber.trim()) : '';

    if (!sanitizedTitle || !sanitizedDate || !sanitizedLocation) {
      setAddError('All fields are required');
      return;
    }

    if (sanitizedType === 'paid') {
      if (!sanitizedFee || !sanitizedBankName || !sanitizedAccountTitle || !sanitizedAccountNumber) {
        setAddError('All payment details are required for paid events');
        return;
      }
    }

    // Length check
    if (!validateLength(sanitizedTitle, 500) || !validateLength(sanitizedLocation, 500) ||
        !validateLength(sanitizedBankName, 500) || !validateLength(sanitizedAccountTitle, 500) ||
        !validateLength(sanitizedAccountNumber, 500)) {
      setAddError('Invalid input format.');
      return;
    }

    // Malformed check
    if (!validateInputFormat(sanitizedTitle) || !validateInputFormat(sanitizedLocation) ||
        !validateInputFormat(sanitizedBankName) || !validateInputFormat(sanitizedAccountTitle) ||
        !validateInputFormat(sanitizedAccountNumber)) {
      setAddError('Invalid input format.');
      return;
    }

    try {
      setAddLoading(true);
      
      const eventData = {
        title: sanitizedTitle,
        date: sanitizedDate,
        location: sanitizedLocation,
        type: sanitizedType,
        fee: sanitizedType === 'paid' ? parseFloat(sanitizedFee) : 0,
        bankName: sanitizedType === 'paid' ? sanitizedBankName : '',
        accountTitle: sanitizedType === 'paid' ? sanitizedAccountTitle : '',
        accountNumber: sanitizedType === 'paid' ? sanitizedAccountNumber : '',
        registeredUsers: [],
        createdBy: currentUser?.email || 'Anonymous',
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'events'), eventData);
      
      // Update local state
      setEvents([{ id: docRef.id, ...eventData }, ...events]);
      triggerAlert('Success', 'Event created successfully!');
      
      // Reset form
      setNewEvent({ 
        title: '', 
        date: '', 
        location: '', 
        type: 'free', 
        fee: '', 
        bankName: '', 
        accountTitle: '', 
        accountNumber: '' 
      });
      setShowAddModal(false);
    } catch (err) {
      console.error('Error creating event:', err);
      setAddError('Failed to create event: ' + err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleRegisterClick = (event) => {
    if (!currentUser) return;
    const registeredUsers = event.registeredUsers || [];
    const isRegistered = registeredUsers.includes(currentUser.uid);

    if (isRegistered) {
      triggerConfirm('Unregister Event', 'Are you sure you want to unregister from this event?', () => {
        handleUnregister(event.id);
      });
    } else {
      if (event.type === 'paid') {
        setActiveRegEvent(event);
        setShowPayModal(true);
        setPaymentScreenshot(null);
        setScreenshotPreview('');
        setPayError('');
      } else {
        handleDirectRegister(event.id);
      }
    }
  };

  const handleDirectRegister = async (eventId) => {
    const eventRef = doc(db, 'events', eventId);
    try {
      await updateDoc(eventRef, {
        registeredUsers: arrayUnion(currentUser.uid)
      });
      setEvents(events.map(event => {
        if (event.id === eventId) {
          const registeredUsers = event.registeredUsers || [];
          return { ...event, registeredUsers: [...registeredUsers, currentUser.uid] };
        }
        return event;
      }));
      triggerAlert('Success', 'Registered successfully!');
    } catch (err) {
      console.error('Error registering:', err);
      triggerAlert('Error', 'Failed to register: ' + err.message);
    }
  };

  const handleUnregister = async (eventId) => {
    const eventRef = doc(db, 'events', eventId);
    try {
      await updateDoc(eventRef, {
        registeredUsers: arrayRemove(currentUser.uid)
      });

      // Delete registration doc (for subcollection)
      const regDocRef = doc(db, 'events', eventId, 'registrations', currentUser.uid);
      await deleteDoc(regDocRef).catch(() => {});

      setEvents(events.map(event => {
        if (event.id === eventId) {
          const registeredUsers = event.registeredUsers || [];
          return { ...event, registeredUsers: registeredUsers.filter(uid => uid !== currentUser.uid) };
        }
        return event;
      }));

      setUserRegDetails(prev => {
        const updated = { ...prev };
        delete updated[eventId];
        return updated;
      });

      triggerAlert('Success', 'Unregistered successfully!');
    } catch (err) {
      console.error('Error unregistering:', err);
      triggerAlert('Error', 'Failed to unregister: ' + err.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check absolute size limit of 10MB
    if (!validateFileSize(file, 10 * 1024 * 1024)) {
      setPayError('File is too large.');
      setPaymentScreenshot(null);
      setScreenshotPreview('');
      return;
    }

    if (file.size > 500 * 1024) {
      setPayError('❌ File size exceeds 500KB limit.');
      setPaymentScreenshot(null);
      setScreenshotPreview('');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setPayError('❌ Only image files are allowed.');
      setPaymentScreenshot(null);
      setScreenshotPreview('');
      return;
    }

    setPayError('');
    setPaymentScreenshot(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentScreenshot) {
      setPayError('Please select a payment screenshot.');
      return;
    }

    try {
      setPayLoading(true);
      setPayError('');

      const base64Screenshot = await compressImage(paymentScreenshot);
      const eventId = activeRegEvent.id;
      const regRef = doc(db, 'events', eventId, 'registrations', currentUser.uid);

      const regData = {
        userId: currentUser.uid,
        email: currentUser.email,
        screenshot: base64Screenshot,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await setDoc(regRef, regData);

      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        registeredUsers: arrayUnion(currentUser.uid)
      });

      setEvents(events.map(event => {
        if (event.id === eventId) {
          const registeredUsers = event.registeredUsers || [];
          return { ...event, registeredUsers: [...registeredUsers, currentUser.uid] };
        }
        return event;
      }));

      setUserRegDetails(prev => ({
        ...prev,
        [eventId]: regData
      }));

      triggerAlert('Success', 'Registration submitted! Awaiting admin payment approval.');
      setShowPayModal(false);
      setActiveRegEvent(null);
      setPaymentScreenshot(null);
      setScreenshotPreview('');
    } catch (err) {
      console.error('Error submitting payment:', err);
      setPayError('Failed to submit payment details: ' + err.message);
    } finally {
      setPayLoading(false);
    }
  };

  const handleViewRegistrations = async (event) => {
    setActiveViewEvent(event);
    setShowRegsListModal(true);
    setRegistrations([]);
    setRegsLoading(true);

    try {
      const querySnapshot = await getDocs(collection(db, 'events', event.id, 'registrations'));
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push(doc.data());
      });
      setRegistrations(list);
    } catch (err) {
      console.error('Error fetching registrations:', err);
      triggerAlert('Error', 'Failed to load registrations: ' + err.message);
    } finally {
      setRegsLoading(false);
    }
  };

  const handleApproveRegistration = async (studentId) => {
    const eventId = activeViewEvent.id;
    const regRef = doc(db, 'events', eventId, 'registrations', studentId);
    
    try {
      await updateDoc(regRef, { status: 'approved' });

      setRegistrations(registrations.map(reg => {
        if (reg.userId === studentId) {
          return { ...reg, status: 'approved' };
        }
        return reg;
      }));

      if (studentId === currentUser.uid) {
        setUserRegDetails(prev => ({
          ...prev,
          [eventId]: { ...prev[eventId], status: 'approved' }
        }));
      }

      triggerAlert('Success', 'Registration approved successfully!');
    } catch (err) {
      console.error('Error approving:', err);
      triggerAlert('Error', 'Failed to approve: ' + err.message);
    }
  };

  const handleRejectRegistration = (studentId) => {
    triggerConfirm(
      'Reject Registration',
      'Are you sure you want to reject this registration? It will remove the student from the registered list.',
      async () => {
        const eventId = activeViewEvent.id;
        const regRef = doc(db, 'events', eventId, 'registrations', studentId);
        const eventRef = doc(db, 'events', eventId);

        try {
          await deleteDoc(regRef);
          await updateDoc(eventRef, {
            registeredUsers: arrayRemove(studentId)
          });

          setRegistrations(registrations.filter(reg => reg.userId !== studentId));
          
          setEvents(events.map(event => {
            if (event.id === eventId) {
              const registeredUsers = event.registeredUsers || [];
              return { ...event, registeredUsers: registeredUsers.filter(uid => uid !== studentId) };
            }
            return event;
          }));

          if (studentId === currentUser.uid) {
            setUserRegDetails(prev => {
              const updated = { ...prev };
              delete updated[eventId];
              return updated;
            });
          }

          triggerAlert('Success', 'Registration rejected successfully.');
        } catch (err) {
          console.error('Error rejecting:', err);
          triggerAlert('Error', 'Failed to reject registration: ' + err.message);
        }
      }
    );
  };

  const handleDeleteEvent = (eventId) => {
    triggerConfirm(
      'Delete Event',
      'Are you sure you want to delete this event permanently?',
      async () => {
        try {
          await deleteDoc(doc(db, 'events', eventId));
          setEvents(events.filter(event => event.id !== eventId));
          triggerAlert('Success', 'Event deleted successfully!');
        } catch (err) {
          console.error('Error deleting event:', err);
          triggerAlert('Error', 'Failed to delete event: ' + err.message);
        }
      }
    );
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
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Events</h1>
              {currentUser && userRole === 'admin' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.15)] flex items-center gap-1 text-sm"
                >
                  Add Event
                </button>
              )}
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-500 text-sm">Loading events...</p>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm font-medium">
                {error}
              </div>
            ) : events.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-md border border-white/70 rounded-3xl p-12 text-center shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-2">No upcoming events. Check back later!</h3>
              </div>
            ) : (
              <div className="space-y-6">
                {events.map((event) => {
                  const registeredUsers = event.registeredUsers || [];
                  const isRegistered = registeredUsers.includes(currentUser?.uid);
 
                  return (
                    <div key={event.id} className="bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl p-6 hover:shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all hover:border-slate-300 hover:bg-white/80 group duration-300 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-all duration-300 mb-2">{event.title}</h3>
                        <div className="flex flex-wrap items-center text-slate-500 text-sm gap-x-4 gap-y-1">
                          <span className="flex items-center gap-1">Date: {event.date}</span>
                          <span className="flex items-center gap-1">Location: {event.location}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                            event.type === 'paid' 
                              ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' 
                              : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                          }`}>
                            {event.type === 'paid' ? `Rs. ${event.fee}` : 'Free'}
                          </span>
                          {event.type === 'paid' && (
                            <span className="text-xs text-slate-500 font-medium bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                              Bank: {event.bankName}
                            </span>
                          )}
                        </div>

                        {registeredUsers.length > 0 && (
                          <p className="text-xs text-emerald-600 mt-3 font-semibold flex items-center gap-1">
                            {registeredUsers.length} student{registeredUsers.length > 1 ? 's' : ''} registered
                          </p>
                        )}

                        {currentUser && event.type === 'paid' && registeredUsers.includes(currentUser.uid) && (
                          <div className="mt-3">
                            <span className={`text-xs px-3 py-1 rounded-full font-semibold border inline-flex items-center gap-1.5 ${
                              userRegDetails[event.id]?.status === 'approved'
                                ? 'bg-green-500/10 text-green-700 border-green-500/20'
                                : 'bg-amber-500/10 text-amber-700 border-amber-500/20 animate-pulse'
                            }`}>
                              {userRegDetails[event.id]?.status === 'approved' ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                  Registration Approved
                                </>
                              ) : (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                  Awaiting Payment Approval
                                </>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0">
                        <button 
                          onClick={() => handleRegisterClick(event)}
                          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                            isRegistered 
                              ? 'bg-red-50/50 border border-red-200 text-red-600 hover:bg-red-50' 
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_4px_12px_rgba(37,99,235,0.15)]'
                          }`}
                        >
                          {isRegistered ? 'Unregister' : 'Register'}
                        </button>
                        {currentUser && userRole === 'admin' && (
                          <>
                            <button
                              onClick={() => handleViewRegistrations(event)}
                              className="bg-purple-50/50 border border-purple-200 text-purple-600 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-55 transition-all duration-300 flex items-center gap-1"
                            >
                              View Regs ({registeredUsers.length})
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="bg-red-600/80 hover:bg-red-600 border border-red-500/30 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                            >
                              Delete
                            </button>
                          </>
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

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 text-slate-800 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-6">Add New Event</h2>
              
              <form onSubmit={handleAddSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Tech Talk: AI in Education"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm [color-scheme:light]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Main Auditorium"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Event Type *
                  </label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                  >
                    <option value="free">Free Event</option>
                    <option value="paid">Paid Event</option>
                  </select>
                </div>

                {newEvent.type === 'paid' && (
                  <div className="space-y-4 p-4 bg-slate-50 border border-slate-200/70 rounded-2xl">
                    <p className="text-sm font-semibold text-blue-600">Payment details</p>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Fee (PKR) *
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="e.g., 500"
                        value={newEvent.fee}
                        onChange={(e) => setNewEvent({ ...newEvent, fee: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., HBL, Bank Alfalah"
                        value={newEvent.bankName}
                        onChange={(e) => setNewEvent({ ...newEvent, bankName: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Account Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., FAST Student Council"
                        value={newEvent.accountTitle}
                        onChange={(e) => setNewEvent({ ...newEvent, accountTitle: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Account Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., 1234-5678-9012"
                        value={newEvent.accountNumber}
                        onChange={(e) => setNewEvent({ ...newEvent, accountNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                )}

                {addError && (
                  <p className="text-red-600 text-sm font-semibold">{addError}</p>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 rounded-xl transition-all duration-300 font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.15)] disabled:opacity-50 text-sm"
                  >
                    {addLoading ? 'Creating...' : 'Create Event'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewEvent({ 
                        title: '', 
                        date: '', 
                        location: '', 
                        type: 'free', 
                        fee: '', 
                        bankName: '', 
                        accountTitle: '', 
                        accountNumber: '' 
                      });
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

      {/* Submit Payment Modal */}
      {showPayModal && activeRegEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 text-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">Paid Registration: {activeRegEvent.title}</h2>
            
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-5 text-sm space-y-2">
              <p className="font-semibold text-blue-600 text-base">Registration Fee: Rs. {activeRegEvent.fee}</p>
              <div className="text-slate-600 pt-1.5 border-t border-blue-100">
                <p><strong>Bank Name:</strong> {activeRegEvent.bankName}</p>
                <p><strong>Account Title:</strong> {activeRegEvent.accountTitle}</p>
                <p><strong>Account Number:</strong> {activeRegEvent.accountNumber}</p>
              </div>
              <p className="text-xs text-slate-400 italic pt-1.5 leading-relaxed">
                Please transfer the fee to the bank account above and upload the payment receipt below.
              </p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Upload Payment Screenshot *
                </label>
                <div className="bg-white/90 border border-slate-200 rounded-xl p-2">
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Accepts 1 image only. Maximum file size: 500KB.</p>
              </div>

              {screenshotPreview && (
                <div className="border border-slate-200 rounded-2xl p-2 bg-slate-50 flex justify-center">
                  <img
                    src={screenshotPreview}
                    alt="Screenshot Preview"
                    className="max-h-48 rounded-xl object-contain"
                  />
                </div>
              )}

              {payError && (
                <p className="text-red-600 text-sm font-semibold">{payError}</p>
              )}

              <div className="flex space-x-3 pt-3">
                <button
                  type="submit"
                  disabled={payLoading || !paymentScreenshot}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white py-3 rounded-xl transition-all duration-300 font-semibold disabled:opacity-50 text-sm shadow-[0_4px_12px_rgba(16,185,129,0.15)]"
                >
                  {payLoading ? 'Submitting...' : 'Submit & Register'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPayModal(false);
                    setActiveRegEvent(null);
                    setPaymentScreenshot(null);
                    setScreenshotPreview('');
                  }}
                  className="flex-1 bg-slate-100/80 text-slate-700 hover:bg-slate-100 border border-slate-200 py-3 rounded-xl transition-all duration-300 font-semibold text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin View Registrations Modal */}
      {showRegsListModal && activeViewEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 text-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full p-6 relative max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Registrations: {activeViewEvent.title}</h2>
              <button
                onClick={() => {
                  setShowRegsListModal(false);
                  setActiveViewEvent(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-3xl font-semibold transition-colors"
              >
                &times;
              </button>
            </div>

            {regsLoading ? (
              <div className="text-center py-12 flex-1 flex flex-col justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-500 text-sm">Loading registrations...</p>
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex-1 flex flex-col justify-center">
                <p className="text-lg font-semibold text-slate-500">No students registered yet.</p>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 border border-slate-200/60 rounded-2xl bg-white/40">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200/60">
                    <tr>
                      <th className="px-6 py-3.5 text-left font-semibold uppercase tracking-wider text-xs">Email</th>
                      <th className="px-6 py-3.5 text-left font-semibold uppercase tracking-wider text-xs">Reg Date</th>
                      {activeViewEvent.type === 'paid' && (
                        <>
                          <th className="px-6 py-3.5 text-left font-semibold uppercase tracking-wider text-xs">Receipt</th>
                          <th className="px-6 py-3.5 text-left font-semibold uppercase tracking-wider text-xs">Status</th>
                        </>
                      )}
                      <th className="px-6 py-3.5 text-right font-semibold uppercase tracking-wider text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {registrations.map((reg, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">{reg.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                          {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        {activeViewEvent.type === 'paid' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {reg.screenshot ? (
                                <img
                                  src={reg.screenshot}
                                  alt="Receipt thumbnail"
                                  className="h-10 w-16 object-cover border border-slate-200 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => setFullScreenImage(reg.screenshot)}
                                />
                              ) : (
                                <span className="text-slate-400 italic">No image</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                                reg.status === 'approved' 
                                  ? 'bg-green-500/10 text-green-700 border border-green-500/20' 
                                  : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                              }`}>
                                {reg.status || 'pending'}
                              </span>
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                          {activeViewEvent.type === 'paid' && reg.status !== 'approved' && (
                            <button
                              onClick={() => handleApproveRegistration(reg.userId)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3.5 py-1.5 rounded-lg font-semibold transition-colors text-xs shadow-sm"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleRejectRegistration(reg.userId)}
                            className="bg-red-50/50 border border-red-200 hover:bg-red-50 text-red-600 px-3.5 py-1.5 rounded-lg font-semibold transition-colors text-xs"
                          >
                            Reject / Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview Modal */}
      {fullScreenImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[60] animate-fadeIn">
          <div className="relative max-w-3xl w-full max-h-[85vh] flex flex-col items-center">
            <button
              onClick={() => setFullScreenImage(null)}
              className="absolute -top-12 right-0 text-slate-400 hover:text-white text-3xl font-semibold transition-colors"
            >
              &times; Close
            </button>
            <img
              src={fullScreenImage}
              alt="Receipt Details"
              className="max-w-full max-h-[80vh] object-contain border border-slate-200 bg-white rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Custom Confirmation / Alert Modal */}
      {dialogState.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 transition-opacity">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 p-6 max-w-sm w-full text-slate-800 rounded-2xl shadow-2xl">
            <div className="text-center mb-6">
              {dialogState.type === 'confirm' ? (
                <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-full mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              ) : (
                <div className="flex items-center justify-center w-12 h-12 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              <h3 className="text-lg font-bold text-slate-800 mb-2">{dialogState.title}</h3>
              <p className="text-sm text-slate-500 whitespace-pre-line">{dialogState.message}</p>
            </div>
            
            <div className="flex space-x-3 justify-center">
              {dialogState.type === 'confirm' && (
                <button
                  onClick={() => setDialogState(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2.5 bg-slate-100/80 text-slate-700 hover:bg-slate-100 border border-slate-200 font-semibold rounded-xl transition-colors w-full"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => {
                  if (dialogState.onConfirm) dialogState.onConfirm();
                  setDialogState(prev => ({ ...prev, isOpen: false }));
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-colors w-full shadow-[0_4px_12px_rgba(37,99,235,0.15)]"
              >
                {dialogState.type === 'confirm' ? 'OK' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
