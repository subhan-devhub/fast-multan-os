import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const CampusMap = () => {
  const [activeFloor, setActiveFloor] = useState('ground'); // 'basement', 'ground', 'first'
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const basementRooms = [
    { id: 'cslab1', name: 'CS Lab 1', type: 'Computer Lab', capacity: '30 students', floor: 'Basement', description: 'Main programming lab for CS students', x: 10, y: 10, width: 280, height: 150, fill: '#DBEAFE', stroke: '#3B82F6' },
    { id: 'cslab2', name: 'CS Lab 2', type: 'Computer Lab', capacity: '30 students', floor: 'Basement', description: 'Advanced computing and programming lab', x: 310, y: 10, width: 280, height: 150, fill: '#DBEAFE', stroke: '#3B82F6' },
    { id: 'dldlab', name: 'DLD Lab', type: 'Digital Logic Design Lab', capacity: '25 students', floor: 'Basement', description: 'Hardware and circuit design lab', x: 10, y: 180, width: 280, height: 150, fill: '#DBEAFE', stroke: '#3B82F6' },
    { id: 'library', name: 'Library', type: 'Library', capacity: '50 students', floor: 'Basement', description: 'University library with study area', x: 310, y: 180, width: 280, height: 150, fill: '#EDE9FE', stroke: '#8B5CF6' }
  ];

  const groundRooms = [
    { id: 'mainentrance', name: 'Main Entrance / Reception', type: 'Reception', capacity: 'N/A', floor: 'Ground Floor', description: 'Main entrance foyer and security check desk', x: 10, y: 10, width: 580, height: 60, fill: '#F3F4F6', stroke: '#D1D5DB' },
    { id: 'classroom1', name: 'Classroom 1', type: 'Classroom', capacity: '40 students', floor: 'Ground Floor', description: 'Lecture hall with audio-visual equipment', x: 10, y: 85, width: 185, height: 75, fill: '#DCFCE7', stroke: '#10B981' },
    { id: 'classroom2', name: 'Classroom 2', type: 'Classroom', capacity: '40 students', floor: 'Ground Floor', description: 'Standard lecture classroom', x: 207, y: 85, width: 185, height: 75, fill: '#DCFCE7', stroke: '#10B981' },
    { id: 'classroom3', name: 'Classroom 3', type: 'Classroom', capacity: '40 students', floor: 'Ground Floor', description: 'Standard lecture classroom', x: 405, y: 85, width: 185, height: 75, fill: '#DCFCE7', stroke: '#10B981' },
    { id: 'classroom4', name: 'Classroom 4', type: 'Classroom', capacity: '40 students', floor: 'Ground Floor', description: 'Standard lecture classroom', x: 10, y: 175, width: 185, height: 75, fill: '#DCFCE7', stroke: '#10B981' },
    { id: 'hallway', name: 'Hallway', type: 'Hallway', capacity: 'N/A', floor: 'Ground Floor', description: 'Ground floor main corridor', x: 207, y: 175, width: 185, height: 155, fill: '#F3F4F6', stroke: '#D1D5DB' },
    { id: 'office1', name: 'Teacher Office 1', type: 'Faculty Office', capacity: 'N/A', floor: 'Ground Floor', description: 'Faculty offices — check faculty directory for specific room assignments', x: 405, y: 175, width: 185, height: 75, fill: '#FEF3C7', stroke: '#F59E0B' },
    { id: 'office2', name: 'Teacher Office 2', type: 'Faculty Office', capacity: 'N/A', floor: 'Ground Floor', description: 'Faculty offices — check faculty directory for specific room assignments', x: 10, y: 255, width: 185, height: 75, fill: '#FEF3C7', stroke: '#F59E0B' },
    { id: 'office3', name: 'Teacher Office 3', type: 'Faculty Office', capacity: 'N/A', floor: 'Ground Floor', description: 'Faculty offices — check faculty directory for specific room assignments', x: 405, y: 255, width: 185, height: 75, fill: '#FEF3C7', stroke: '#F59E0B' }
  ];

  const firstRooms = [
    { id: 'corridor', name: 'Corridor', type: 'Corridor', capacity: 'N/A', floor: 'First Floor', description: 'First floor main corridor', x: 10, y: 10, width: 580, height: 60, fill: '#F3F4F6', stroke: '#D1D5DB' },
    { id: 'classroom5', name: 'Classroom 5', type: 'Classroom', capacity: '40 students', floor: 'First Floor', description: 'Standard lecture classroom', x: 10, y: 85, width: 185, height: 110, fill: '#DCFCE7', stroke: '#10B981' },
    { id: 'classroom6', name: 'Classroom 6', type: 'Classroom', capacity: '40 students', floor: 'First Floor', description: 'Standard lecture classroom', x: 207, y: 85, width: 185, height: 110, fill: '#DCFCE7', stroke: '#10B981' },
    { id: 'cafe', name: 'Cafe / Canteen', type: 'Food Court', capacity: 'N/A', floor: 'First Floor', description: 'University cafe — open during university hours', x: 405, y: 85, width: 185, height: 110, fill: '#FEF9C3', stroke: '#EAB308' },
    { id: 'classroom7', name: 'Classroom 7', type: 'Classroom', capacity: '40 students', floor: 'First Floor', description: 'Standard lecture classroom', x: 10, y: 210, width: 185, height: 110, fill: '#DCFCE7', stroke: '#10B981' },
    { id: 'hallway1', name: 'Hallway', type: 'Hallway', capacity: 'N/A', floor: 'First Floor', description: 'First floor secondary corridor', x: 207, y: 210, width: 185, height: 110, fill: '#F3F4F6', stroke: '#D1D5DB' },
    { id: 'classroom8', name: 'Classroom 8', type: 'Classroom', capacity: '40 students', floor: 'First Floor', description: 'Standard lecture classroom', x: 405, y: 210, width: 185, height: 110, fill: '#DCFCE7', stroke: '#10B981' }
  ];

  const getRoomsForFloor = () => {
    switch (activeFloor) {
      case 'basement': return basementRooms;
      case 'ground': return groundRooms;
      case 'first': return firstRooms;
      default: return groundRooms;
    }
  };

  const isHighlighted = (room) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const name = room.name.toLowerCase();
    const type = room.type.toLowerCase();
    const desc = (room.description || '').toLowerCase();

    if (query === 'lab') {
      return type.includes('lab') || name.includes('lab');
    }
    if (query === 'class' || query === 'classroom') {
      return type.includes('classroom') || name.includes('classroom') || name.includes('class');
    }
    if (query === 'library') {
      return type.includes('library') || name.includes('library');
    }
    if (query === 'cafe' || query === 'canteen') {
      return type.includes('food') || name.includes('cafe') || name.includes('canteen');
    }
    if (query === 'office') {
      return type.includes('office') || name.includes('office');
    }

    return name.includes(query) || type.includes(query) || desc.includes(query);
  };

  const activeRooms = getRoomsForFloor();

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
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">FAST Multan Campus Map</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">FAST University Multan — Block A</p>
            </div>

            {/* Warning Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800 text-sm font-semibold flex items-start gap-3 mb-6 shadow-sm animate-fadeIn">
              <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-bold">Placeholder map</p>
                <p className="text-amber-700 text-xs mt-0.5">Real building photos coming soon. Layout may not be 100% accurate.</p>
              </div>
            </div>

            {/* Search & Tabs Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-6">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search any room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm transition-all"
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex gap-2 p-1 bg-slate-200/50 border border-slate-200/20 rounded-xl self-start">
                <button
                  onClick={() => { setActiveFloor('basement'); setSelectedRoom(null); }}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    activeFloor === 'basement'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Basement
                </button>
                <button
                  onClick={() => { setActiveFloor('ground'); setSelectedRoom(null); }}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    activeFloor === 'ground'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Ground Floor
                </button>
                <button
                  onClick={() => { setActiveFloor('first'); setSelectedRoom(null); }}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    activeFloor === 'first'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  First Floor
                </button>
              </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Map Column */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-white/60 backdrop-blur-md border border-white/70 shadow-sm rounded-3xl p-6 overflow-hidden">
                  <div className="overflow-x-auto pb-2 scrollbar-thin">
                    <svg viewBox="0 0 600 340" className="w-full h-auto min-w-[550px] select-none">
                      {/* Outer Map boundary */}
                      <rect x="0" y="0" width="600" height="340" rx="16" fill="rgba(248, 250, 252, 0.5)" stroke="#E2E8F0" strokeWidth="1" />

                      {/* Render rooms */}
                      {activeRooms.map((room) => {
                        const highlighted = isHighlighted(room);
                        const isSelected = selectedRoom?.id === room.id;
                        return (
                          <g
                            key={room.id}
                            onClick={() => setSelectedRoom(room)}
                            className="transition-all duration-300"
                            style={{ opacity: highlighted ? 1 : 0.2 }}
                          >
                            <rect
                              x={room.x}
                              y={room.y}
                              width={room.width}
                              height={room.height}
                              rx="12"
                              fill={room.fill}
                              stroke={isSelected ? '#2563EB' : room.stroke}
                              strokeWidth={isSelected ? 3.5 : 2}
                              className="cursor-pointer transition-all duration-200 hover:brightness-95 hover:stroke-[3px]"
                              style={{
                                filter: isSelected ? 'drop-shadow(0 0 8px rgba(37,99,235,0.25))' : 'none'
                              }}
                            />
                            <text
                              x={room.x + room.width / 2}
                              y={room.y + room.height / 2}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="fill-slate-700 font-extrabold text-[11px] pointer-events-none select-none"
                            >
                              {room.name}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Colors Legend */}
                <div className="bg-white/60 backdrop-blur-md border border-white/70 shadow-sm rounded-3xl px-6 py-4 flex flex-wrap gap-4 justify-between items-center text-xs text-slate-600 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#DBEAFE] border border-[#3B82F6]" />
                    <span>Labs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#EDE9FE] border border-[#8B5CF6]" />
                    <span>Library</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#DCFCE7] border border-[#10B981]" />
                    <span>Classrooms</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#FEF3C7] border border-[#F59E0B]" />
                    <span>Offices</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#FEF9C3] border border-[#EAB308]" />
                    <span>Cafe</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#F3F4F6] border border-[#D1D5DB]" />
                    <span>Hallway</span>
                  </div>
                </div>
              </div>

              {/* Room Details Side Panel */}
              <div className="lg:col-span-1">
                {selectedRoom ? (
                  <div className="bg-white/70 backdrop-blur-md border border-white/80 shadow-md rounded-3xl p-6 animate-slideIn">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold text-slate-800">{selectedRoom.name}</h2>
                      <button
                        onClick={() => setSelectedRoom(null)}
                        className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Room Type</span>
                        <span className="block mt-1 w-fit bg-blue-50 text-blue-600 border border-blue-100 text-xs px-2.5 py-1 rounded-full font-semibold">
                          {selectedRoom.type}
                        </span>
                      </div>

                      {selectedRoom.capacity !== 'N/A' && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Capacity</span>
                          <p className="text-sm font-semibold text-slate-700 mt-0.5">{selectedRoom.capacity}</p>
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Floor</span>
                        <span className="block mt-1 w-fit bg-slate-100 text-slate-700 border border-slate-200 text-xs px-2.5 py-1 rounded-full font-semibold">
                          {selectedRoom.floor}
                        </span>
                      </div>

                      {selectedRoom.description && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</span>
                          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{selectedRoom.description}</p>
                        </div>
                      )}

                      <div className="pt-2">
                        <button
                          onClick={() => setSelectedRoom(null)}
                          className="w-full bg-slate-100/80 text-slate-700 hover:bg-slate-100 border border-slate-200 py-2.5 rounded-xl transition-all duration-300 font-semibold text-xs"
                        >
                          Clear Selection
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/60 backdrop-blur-md border border-white/70 shadow-sm rounded-3xl p-8 text-center flex flex-col items-center">
                    <div className="bg-blue-50 text-blue-600 p-4 rounded-3xl mb-4">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-2">Room Details</h3>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">
                      Select any room on the map grid to view details such as capacities and categories.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
        </div>
      </div>
    </div>
  );
};

export default CampusMap;
