import { useState } from 'react';
import {
  Map,
  Users,
  ArrowRight,
  MessageCircle,
  ThumbsUp,
  CheckCircle,
  Star,
  Shield,
  Zap,
  Heart,
  PartyPopper,
  Plane,
  Trophy,
  Home,
} from 'lucide-react';
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

  const useCases = [
    {
      icon: PartyPopper,
      title: 'Bachelor & Bachelorette',
      description: 'Vegas? Miami? Cabo? Let the squad decide together',
      color: 'bg-pink-500',
    },
    {
      icon: Home,
      title: 'Family Reunions',
      description: 'Get everyone aligned, from kids to grandparents',
      color: 'bg-blue-500',
    },
    {
      icon: Users,
      title: 'Friend Group Trips',
      description: 'Turn "we should totally go somewhere" into reality',
      color: 'bg-green-500',
    },
    {
      icon: Trophy,
      title: 'Golf & Sports Trips',
      description: 'Coordinate the boys\' trip: courses, lodging, tee times',
      color: 'bg-amber-500',
    },
    {
      icon: Heart,
      title: 'Couples Getaways',
      description: 'Plan romantic escapes with friends or family pairs',
      color: 'bg-red-500',
    },
    {
      icon: Plane,
      title: 'Destination Weddings',
      description: 'Organize travel plans for all your guests',
      color: 'bg-purple-500',
    },
  ];

  const features = [
    {
      icon: MessageCircle,
      title: 'Collect Ideas',
      description: 'Everyone drops their suggestions for dates, places, and activities',
    },
    {
      icon: ThumbsUp,
      title: 'Vote & Discuss',
      description: 'Limited votes keep it fair. Comments keep it fun.',
    },
    {
      icon: CheckCircle,
      title: 'Make Decisions',
      description: 'Move from chaos to a finalized plan everyone agrees on',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Trips Planned' },
    { value: '50,000+', label: 'Happy Travelers' },
    { value: '4.9', label: 'App Rating', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="text-white space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                <Map size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">TripBoard</h1>
                <p className="text-white/80">Plan together, travel together</p>
              </div>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Group trips planned.
              <span className="text-white/80 block">Without the group chat chaos.</span>
            </h2>

            <p className="text-xl text-white/90">
              Stop drowning in "where should we stay?" texts. TripBoard gives everyone a place
              to share ideas, vote on favorites, and actually make decisions—so you spend less
              time planning and more time packing.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    {stat.icon && <stat.icon size={16} className="text-yellow-300 fill-yellow-300" />}
                  </div>
                  <p className="text-sm text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Trust signals */}
            <div className="flex items-center gap-6 pt-4 border-t border-white/20">
              <div className="flex items-center gap-2 text-white/80">
                <Shield size={18} />
                <span className="text-sm">Free to use</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Zap size={18} />
                <span className="text-sm">No signup required</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle size={18} />
                <span className="text-sm">Works on any device</span>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Start Planning</h3>
            <p className="text-gray-500 mb-6">
              Enter your details to create or join a trip
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
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="text-xs text-center text-gray-400 mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="bg-white/10 backdrop-blur-sm py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-white text-center mb-4">
            Perfect for every type of group trip
          </h3>
          <p className="text-white/80 text-center mb-12 max-w-2xl mx-auto">
            Whether it's a wild weekend or a relaxing retreat, TripBoard keeps everyone organized and on the same page
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur rounded-xl p-6 text-white hover:bg-white/20 transition-colors"
              >
                <div className={`p-3 ${useCase.color} rounded-lg w-fit mb-4`}>
                  <useCase.icon size={24} className="text-white" />
                </div>
                <h4 className="text-lg font-semibold mb-2">{useCase.title}</h4>
                <p className="text-white/80 text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-4">
            How it works
          </h3>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            From "where should we go?" to "I'll see you there!" in three simple steps
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                  <feature.icon size={28} className="text-primary-600" />
                </div>
                <div className="text-sm text-primary-600 font-medium mb-2">
                  Step {idx + 1}
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-12">
            What trip planners are saying
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Planned our bachelor party for 12 guys across 3 time zones. Everyone got to vote on activities and we actually agreed on something!"
              </p>
              <p className="text-sm font-medium text-gray-800">— Mike T., Best Man</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Our annual family reunion used to be a nightmare to plan. Now everyone adds their ideas and we vote. No more 50-email chains!"
              </p>
              <p className="text-sm font-medium text-gray-800">— Sarah K., Family Organizer</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Used this for our annual golf trip. Picking courses, houses, and restaurants was actually fun instead of frustrating."
              </p>
              <p className="text-sm font-medium text-gray-800">— Dave R., Golf Trip Captain</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Map size={24} />
            <span className="font-bold text-xl">TripBoard</span>
          </div>
          <p className="text-gray-400 text-sm">
            Making group travel planning simple since 2024
          </p>
        </div>
      </div>
    </div>
  );
}
