import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        toast.success('Successfully logged in');
        // Navigation is handled by AuthRedirect / ProtectedRoute
        // but we can just redirect to the default dashboard
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Failed to login');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090909] flex flex-col items-center justify-center p-4 sm:p-8 font-inter text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">NEXUS AI</h1>
          <p className="text-[#a1a1aa] text-lg">Enterprise AI-Powered CRM</p>
        </div>

        <div className="bg-[#171717] border border-[#2a2a2a] rounded-[10px] p-6 sm:p-8 shadow-2xl relative group overflow-hidden transition-all duration-300 hover:border-[#E11D48]/50 hover:shadow-[#E11D48]/10 hover:shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-medium font-jetbrains text-[#e5bdbe]">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#a1a1aa]" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  className={cn(
                    "block w-full pl-10 pr-3 py-2.5 bg-[#090909] border border-[#2a2a2a] rounded-[10px] text-white placeholder-[#a1a1aa] focus:outline-none focus:ring-1 focus:ring-[#E11D48] focus:border-[#E11D48] transition-colors sm:text-sm",
                    errors.email && "border-red-500 focus:ring-red-500 focus:border-red-500"
                  )}
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium font-jetbrains text-[#e5bdbe]">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#a1a1aa]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={cn(
                    "block w-full pl-10 pr-10 py-2.5 bg-[#090909] border border-[#2a2a2a] rounded-[10px] text-white placeholder-[#a1a1aa] focus:outline-none focus:ring-1 focus:ring-[#E11D48] focus:border-[#E11D48] transition-colors sm:text-sm",
                    errors.password && "border-red-500 focus:ring-red-500 focus:border-red-500"
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#a1a1aa] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  {...register('rememberMe')}
                  className="h-4 w-4 bg-[#090909] border-[#2a2a2a] rounded text-[#E11D48] focus:ring-[#E11D48] focus:ring-offset-[#090909]"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-[#a1a1aa]">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-[#3B82F6] hover:text-[#3B82F6]/80 transition-colors">
                  Forgot Password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-[10px] shadow-sm text-sm font-medium text-white bg-[#E11D48] hover:bg-[#E11D48]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#090909] focus:ring-[#E11D48] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#a1a1aa]">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-[#74D8BD] hover:text-[#74D8BD]/80 transition-colors">
                Register
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
