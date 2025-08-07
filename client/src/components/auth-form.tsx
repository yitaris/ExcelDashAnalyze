import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
}

export default function AuthForm({ mode, onModeChange }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (resetMode) {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Password Reset Email Sent',
            description: 'Check your email for password reset instructions.',
          });
          setResetMode(false);
        }
      } else if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Sign In Error',
            description: error.message,
            variant: 'destructive',
          });
        }
      } else {
        if (!fullName.trim()) {
          toast({
            title: 'Full Name Required',
            description: 'Please enter your full name to create an account.',
            variant: 'destructive',
          });
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({
            title: 'Sign Up Error',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Account Created',
            description: 'Please check your email to confirm your account.',
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (resetMode) return 'Reset Password';
    return mode === 'signin' ? 'Welcome Back' : 'Create Account';
  };

  const getDescription = () => {
    if (resetMode) return 'Enter your email to receive password reset instructions';
    return mode === 'signin' 
      ? 'Sign in to access your Excel analytics dashboard'
      : 'Join thousands of users analyzing their Excel data';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-4">
            <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-primary-600 rounded-sm"></div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {getTitle()}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {getDescription()}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && !resetMode && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-12 border-gray-200 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400"
                    required
                    data-testid="input-fullname"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-gray-200 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400"
                  required
                  data-testid="input-email"
                />
              </div>
            </div>

            {!resetMode && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-gray-200 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400"
                    required
                    minLength={6}
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors duration-200"
              disabled={loading}
              data-testid="button-submit"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>{resetMode ? 'Send Reset Email' : mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </Button>
          </form>

          <div className="space-y-4">
            {!resetMode && (
              <>
                <div className="relative">
                  <Separator className="bg-gray-200 dark:bg-gray-600" />
                  <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-2 text-xs text-gray-500 dark:text-gray-400">
                    or continue with
                  </span>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-12 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  data-testid="button-github-auth"
                >
                  <Github size={18} className="mr-2" />
                  GitHub
                </Button>
              </>
            )}

            <div className="text-center space-y-2">
              {!resetMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => setResetMode(true)}
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                    data-testid="button-forgot-password"
                  >
                    Forgot your password?
                  </button>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                    <button
                      type="button"
                      onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                      data-testid="button-switch-mode"
                    >
                      {mode === 'signin' ? 'Sign up' : 'Sign in'}
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setResetMode(false)}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                  data-testid="button-back-to-signin"
                >
                  Back to sign in
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}