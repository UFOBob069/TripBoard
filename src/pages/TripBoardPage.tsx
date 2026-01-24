import { useState } from 'react';
import { useTripStore } from '../store/tripStore';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { Canvas } from '../components/canvas/Canvas';
import { FinalPlan } from '../components/trip/FinalPlan';

export function TripBoardPage() {
  const [showFinalPlan, setShowFinalPlan] = useState(false);

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
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          onShowFinalPlan={toggleFinalPlan}
          showingFinalPlan={showFinalPlan}
          onBack={handleBack}
        />

        <main className="flex-1 overflow-hidden p-6">
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
