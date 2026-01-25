import { useState } from 'react';
import {
  Map,
  Users,
  Lightbulb,
  Vote,
  CheckCircle,
  Share2,
  ArrowRight,
  Calendar,
  MapPin,
  Home,
  Compass,
  Utensils,
  Plane,
  ThumbsUp,
  MessageCircle,
  Star,
  Crown,
  X,
} from 'lucide-react';
import { Header } from '../components/layout/Header';

interface AboutPageProps {
  onBack: () => void;
  isFirstVisit?: boolean;
}

const STEPS = [
  {
    icon: Users,
    title: 'Create a Trip & Invite Friends',
    description: 'Start by creating a new trip and sharing the invite link with your travel companions. Everyone can join and contribute ideas.',
    color: 'bg-blue-500',
    tips: [
      'Give your trip a memorable name',
      'Add a cover photo to make it stand out',
      'Share the invite link or code with friends',
    ],
  },
  {
    icon: Lightbulb,
    title: 'Add Ideas to Each Board',
    description: 'The trip is organized into 6 planning boards: Dates, Destination, Stay, Activities, Food & Dining, and Transportation.',
    color: 'bg-purple-500',
    tips: [
      'Paste links from booking sites to auto-fill details',
      'Add images to make ideas more appealing',
      'Include notes about why you like each option',
    ],
  },
  {
    icon: Vote,
    title: 'Vote on Your Favorites',
    description: 'Everyone can upvote or downvote ideas. The voting system helps the group reach consensus on what to do.',
    color: 'bg-orange-500',
    tips: [
      'You have limited votes per board - use them wisely!',
      'Leave comments to discuss options',
      'Trip owners can shortlist top choices',
    ],
  },
  {
    icon: CheckCircle,
    title: 'Select & Finalize',
    description: 'The trip owner selects the winning ideas for each category. Once all 6 boards have selections, your trip plan is complete!',
    color: 'bg-green-500',
    tips: [
      'Selected items appear with a green checkmark',
      'View the Final Plan to see everything together',
      'You can change selections anytime before finalizing',
    ],
  },
  {
    icon: Share2,
    title: 'Share Your Plan',
    description: 'Once finalized, share your complete trip plan with the group. Everyone has access to dates, bookings, and details.',
    color: 'bg-cyan-500',
    tips: [
      'The Final Plan shows all selected options',
      'Links to bookings are preserved',
      'Keep the trip open to add more details later',
    ],
  },
];

const BOARDS = [
  { icon: Calendar, label: 'Dates', description: 'When should we go?', color: 'bg-blue-500' },
  { icon: MapPin, label: 'Destination', description: 'Where should we go?', color: 'bg-green-500' },
  { icon: Home, label: 'Stay', description: 'Where should we stay?', color: 'bg-purple-500' },
  { icon: Compass, label: 'Activities', description: 'What should we do?', color: 'bg-orange-500' },
  { icon: Utensils, label: 'Food & Dining', description: 'Where should we eat?', color: 'bg-red-500' },
  { icon: Plane, label: 'Transportation', description: 'How do we get there?', color: 'bg-cyan-500' },
];

export function AboutPage({ onBack, isFirstVisit = false }: AboutPageProps) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        {!isFirstVisit && (
          <button
            onClick={onBack}
            className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <X size={20} />
            Back
          </button>
        )}

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary-500 rounded-xl">
              <Map size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">TripBord</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plan trips together with friends and family. Collect ideas, vote on favorites, and create the perfect travel plan.
          </p>
          {isFirstVisit && (
            <div className="mt-6">
              <button
                onClick={onBack}
                className="btn-primary text-lg px-8 py-3 flex items-center gap-2 mx-auto"
              >
                Get Started
                <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="card p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">How It Works</h2>

          {/* Step Navigation */}
          <div className="flex justify-center gap-2 mb-8">
            {STEPS.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  activeStep === idx
                    ? `${step.color} text-white`
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Active Step Content */}
          <div className="text-center">
            {(() => {
              const step = STEPS[activeStep];
              const StepIcon = step.icon;
              return (
                <div className="max-w-lg mx-auto">
                  <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <StepIcon size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <p className="text-sm font-medium text-gray-700 mb-2">Tips:</p>
                    <ul className="space-y-1">
                      {step.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setActiveStep(Math.min(STEPS.length - 1, activeStep + 1))}
              disabled={activeStep === STEPS.length - 1}
              className="btn-primary"
            >
              Next
            </button>
          </div>
        </div>

        {/* The 6 Planning Boards */}
        <div className="card p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">The 6 Planning Boards</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {BOARDS.map((board) => {
              const BoardIcon = board.icon;
              return (
                <div key={board.label} className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className={`w-12 h-12 ${board.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    <BoardIcon size={24} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800">{board.label}</h3>
                  <p className="text-sm text-gray-500">{board.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Voting System */}
        <div className="card p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">The Voting System</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ThumbsUp size={24} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Upvote</h3>
              <p className="text-sm text-gray-600">Vote for ideas you love. You have limited upvotes per board.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <MessageCircle size={24} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Comment</h3>
              <p className="text-sm text-gray-600">Discuss ideas with your group. Ask questions or share thoughts.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Star size={24} className="text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Shortlist</h3>
              <p className="text-sm text-gray-600">Trip owners can shortlist top ideas before final selection.</p>
            </div>
          </div>
        </div>

        {/* Roles */}
        <div className="card p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Trip Roles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3 mb-3">
                <Crown size={24} className="text-yellow-600" />
                <h3 className="font-semibold text-gray-800">Trip Owner</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-yellow-600 mt-0.5" />
                  Create and delete the trip
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-yellow-600 mt-0.5" />
                  Shortlist and select final ideas
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-yellow-600 mt-0.5" />
                  Lock boards to stop new ideas
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-yellow-600 mt-0.5" />
                  Change trip status and settings
                </li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <Users size={24} className="text-blue-600" />
                <h3 className="font-semibold text-gray-800">Participants</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-blue-600 mt-0.5" />
                  Add ideas to any board
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-blue-600 mt-0.5" />
                  Vote and comment on ideas
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-blue-600 mt-0.5" />
                  Delete their own ideas
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-blue-600 mt-0.5" />
                  View the final trip plan
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Get Started CTA */}
        {isFirstVisit && (
          <div className="text-center py-8">
            <button
              onClick={onBack}
              className="btn-primary text-lg px-8 py-3 flex items-center gap-2 mx-auto"
            >
              Start Planning Your Trip
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
