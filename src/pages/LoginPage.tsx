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
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from '../lib/auth';

interface LoginPageProps {
  inviteCode?: string | null;
}

export function LoginPage({ inviteCode }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setCurrentUser } = useTripStore();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let user;
      if (isSignUp) {
        if (!name.trim()) {
          setError('Please enter your name');
          setIsLoading(false);
          return;
        }
        user = await signUpWithEmail(email, password, name.trim());
      } else {
        user = await signInWithEmail(email, password);
      }
      setCurrentUser(user);
    } catch (err: any) {
      console.error('Auth error:', err);
      // Handle common Firebase auth errors
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const user = await signInWithGoogle();
      setCurrentUser(user);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed the popup, don't show an error
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
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
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="text-white space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur rounded-xl">
                <Map size={28} className="text-white sm:w-8 sm:h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">TripBord</h1>
                <p className="text-white/80 text-sm sm:text-base">Plan together, travel together</p>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Group trips planned.
              <span className="text-white/80 block">Without the group chat chaos.</span>
            </h2>

            <p className="text-base sm:text-xl text-white/90">
              Stop drowning in "where should we stay?" texts. TripBord gives everyone a place
              to share ideas, vote on favorites, and actually make decisions.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between sm:justify-start sm:gap-8 pt-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xl sm:text-2xl font-bold">{stat.value}</span>
                    {stat.icon && <stat.icon size={14} className="text-yellow-300 fill-yellow-300 sm:w-4 sm:h-4" />}
                  </div>
                  <p className="text-xs sm:text-sm text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 border-t border-white/20">
              <div className="flex items-center gap-2 text-white/80">
                <Shield size={16} />
                <span className="text-xs sm:text-sm">Free to use</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Zap size={16} />
                <span className="text-xs sm:text-sm">Real-time sync</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle size={16} />
                <span className="text-xs sm:text-sm">Any device</span>
              </div>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h3>
            <p className="text-gray-500 mb-6">
              {isSignUp ? 'Sign up to start planning trips' : 'Sign in to access your trips'}
            </p>

            {/* Invite code message */}
            {inviteCode && (
              <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="text-sm text-primary-800">
                  <span className="font-medium">You've been invited to join a trip!</span>
                  <br />
                  Sign in or create an account to join.
                </p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium text-gray-700">Continue with Google</span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {isSignUp && (
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
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder={isSignUp ? 'At least 6 characters' : 'Your password'}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>

            <p className="text-xs text-center text-gray-400 mt-4">
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
            Whether it's a wild weekend or a relaxing retreat, TripBord keeps everyone organized and on the same page
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
            <span className="font-bold text-xl">TripBord</span>
          </div>
          <p className="text-gray-400 text-sm">
            Making group travel planning simple since 2024
          </p>
        </div>
      </div>
    </div>
  );
}
