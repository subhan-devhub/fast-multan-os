import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const CalendarIcon = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UserGroupIcon = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const FacultyIcon = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const AcademicCapIcon = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
  </svg>
);

const Dashboard = () => {
  const stats = [
    { label: 'Events', icon: <CalendarIcon />, color: 'from-blue-50 to-indigo-50 text-blue-600 border-blue-200/50', link: '/events' },
    { label: 'Study Groups', icon: <UserGroupIcon />, color: 'from-emerald-50 to-green-50 text-emerald-600 border-emerald-200/50', link: '/study-groups' },
    { label: 'Study Resources', icon: <DocumentIcon />, color: 'from-purple-50 to-pink-50 text-purple-600 border-purple-200/50', link: '/study-resources' },
    { label: 'Faculty', icon: <FacultyIcon />, color: 'from-orange-50 to-amber-50 text-orange-600 border-orange-200/50', link: '/faculty' },
    { label: 'Alumni', icon: <AcademicCapIcon />, color: 'from-red-50 to-rose-50 text-red-600 border-rose-200/50', link: '/alumni' },
  ];

  return (
    <div className="min-h-screen bg-[#EEF2F6] text-[#0F172A] relative overflow-hidden flex flex-col">
      {/* Background Aurora Glow Effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-400/10 to-indigo-400/10 blur-[120px] pointer-events-none animate-pulse duration-[8000ms]"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-400/8 to-pink-400/8 blur-[130px] pointer-events-none animate-pulse duration-[10000ms]"></div>

      <Navbar />
      <div className="flex flex-1 relative z-10 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-y-auto">
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 mb-8">Dashboard</h1>
              
              {/* Quick Links Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <Link
                    key={index}
                    to={stat.link}
                    className="bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl p-6 shadow-sm hover:shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all hover:border-slate-300/60 hover:bg-white/85 group transform hover:-translate-y-1 cursor-pointer flex flex-col items-center"
                  >
                    <div className={`bg-gradient-to-tr ${stat.color} border rounded-2xl w-16 h-16 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}>
                      {stat.icon}
                    </div>
                    <p className="text-slate-600 group-hover:text-slate-800 font-semibold text-sm transition-colors">{stat.label}</p>
                  </Link>
                ))}
              </div>

              {/* Welcome Section */}
              <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-[80px] pointer-events-none"></div>
                
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-4">
                  Welcome to FAST Multan OS
                </h2>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Your one-stop portal for all university-related activities, events, and resources.
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600">
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Browse and register for upcoming events
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    Join study groups and collaborate with peers
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                    Connect with alumni and faculty members
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                    Submit complaints and feedback
                  </li>
                  <li className="flex items-center gap-3 md:col-span-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                    Navigate the campus with our interactive map
                  </li>
                </ul>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
