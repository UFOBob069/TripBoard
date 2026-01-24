import { useState } from 'react';
import { Map, Users, ArrowRight, Sparkles } from 'lucide-react';
import { useTripStore } from '../store/tripStore';

export function LoginPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { createUser } = useTripStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    createUser(name.trim(), email.trim());
  };

  const features = [
    {
      icon: Users,
      title: 'Collaborate with Friends',
      description: 'Plan trips together in real-time',
    },
    {
      icon: Sparkles,
      title: 'Pinterest-style Boards',
      description: 'Drop ideas and vote on favorites',
    },
    {
      icon: Map,
      title: 'Organized Planning',
      description: 'Separate boards for dates, stays, activities & more',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-accent-500 to-primary-600 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Hero */}
        <div className="text-white space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
              <Map size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">TripBoard</h1>
              <p className="text-white/80">Plan together, travel together</p>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            The collaborative way to plan your next adventure
          </h2>

          <p className="text-lg text-white/80">
            Create shared boards, collect ideas, vote on favorites, and build the perfect trip plan with your friends and family.
          </p>

          <div className="space-y-4 pt-4">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="p-2 bg-white/20 backdrop-blur rounded-lg">
                  <feature.icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-white/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Get Started</h3>
          <p className="text-gray-500 mb-6">
            Enter your details to start planning your next trip
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="john@example.com"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Start Planning
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="text-xs text-center text-gray-400 mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
