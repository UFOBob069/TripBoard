import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { Canvas } from '../components/canvas/Canvas';
import { FinalPlan } from '../components/trip/FinalPlan';

export function TripBoardPage() {
  const [showFinalPlan, setShowFinalPlan] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const { trips, activeTripId, activeCanvas, setActiveTrip, users } =
    useTripStore();

  const trip = activeTripId ? trips[activeTripId] : null;

  if (!trip) {
    return null;
  }

  const handleBack = () => {
    setActiveTrip(null);
  };

  const toggleFinalPlan = () => {
    setShowFinalPlan(!showFinalPlan);
    setShowMobileSidebar(false);
  };

  const handleCanvasSelect = () => {
    setShowMobileSidebar(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Mobile header bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <button
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {showMobileSidebar ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="font-medium text-gray-700 truncate flex-1 text-center">
          {trip.name}
        </span>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        {showMobileSidebar && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Sidebar - hidden on mobile unless toggled */}
        <div
          className={`
            fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
            transform transition-transform duration-300 ease-in-out
            ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <Sidebar
            onShowFinalPlan={toggleFinalPlan}
            showingFinalPlan={showFinalPlan}
            onBack={handleBack}
            onCanvasSelect={handleCanvasSelect}
          />
        </div>

        <main className="flex-1 overflow-hidden p-3 sm:p-6">
          {showFinalPlan ? (
            <FinalPlan tripId={trip.id} users={users} />
          ) : (
            <Canvas
              tripId={trip.id}
              canvasType={activeCanvas}
              users={users}
            />
          )}
        </main>
      </div>
    </div>
  );
}
