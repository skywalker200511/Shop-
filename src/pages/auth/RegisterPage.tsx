import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  company: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      company: '',
      password: '',
      confirm_password: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const result = await registerUser({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        company: data.company,
      });
      
      if (result.success) {
        if (result.error === 'verification_required') {
          toast.success('Registration successful! Please check your email to verify your account.');
          navigate('/login');
        } else {
          toast.success('Account created successfully');
          navigate('/customer/dashboard');
        }
      } else {
        toast.error(result.error || 'Failed to register account');
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
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="bg-white px-5 py-2.5 rounded-2xl shadow-lg mb-4 inline-flex items-center justify-center">
            <img src="/logo.png" alt="Shop+" className="h-10 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-white">Shop+</h1>
          <p className="text-[#a1a1aa] text-base">Create your account</p>
        </div>

        <div className="bg-[#171717] border border-[#2a2a2a] rounded-[10px] p-6 sm:p-8 shadow-2xl relative group overflow-hidden transition-all duration-300 hover:border-[#E11D48]/50 hover:shadow-[#E11D48]/10 hover:shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-sm font-medium font-jetbrains text-[#e5bdbe]">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#a1a1aa]" />
                </div>
                <input
                  type="text"
                  {...register('full_name')}
                  className={cn(
                    "block w-full pl-10 pr-3 py-2.5 bg-[#090909] border border-[#2a2a2a] rounded-[10px] text-white placeholder-[#a1a1aa] focus:outline-none focus:ring-1 focus:ring-[#E11D48] focus:border-[#E11D48] transition-colors sm:text-sm",
                    errors.full_name && "border-red-500 focus:ring-red-500 focus:border-red-500"
                  )}
                  placeholder="John Doe"
                />
              </div>
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

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
              <label className="text-sm font-medium font-jetbrains text-[#e5bdbe]">Company (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-[#a1a1aa]" />
                </div>
                <input
                  type="text"
                  {...register('company')}
                  className={cn(
                    "block w-full pl-10 pr-3 py-2.5 bg-[#090909] border border-[#2a2a2a] rounded-[10px] text-white placeholder-[#a1a1aa] focus:outline-none focus:ring-1 focus:ring-[#E11D48] focus:border-[#E11D48] transition-colors sm:text-sm"
                  )}
                  placeholder="Tech Corp Inc."
                />
              </div>
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

            <div className="space-y-1">
              <label className="text-sm font-medium font-jetbrains text-[#e5bdbe]">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#a1a1aa]" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirm_password')}
                  className={cn(
                    "block w-full pl-10 pr-10 py-2.5 bg-[#090909] border border-[#2a2a2a] rounded-[10px] text-white placeholder-[#a1a1aa] focus:outline-none focus:ring-1 focus:ring-[#E11D48] focus:border-[#E11D48] transition-colors sm:text-sm",
                    errors.confirm_password && "border-red-500 focus:ring-red-500 focus:border-red-500"
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#a1a1aa] hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-[10px] shadow-sm text-sm font-medium text-white bg-[#E11D48] hover:bg-[#E11D48]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#090909] focus:ring-[#E11D48] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#a1a1aa]">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-[#3B82F6] hover:text-[#3B82F6]/80 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
