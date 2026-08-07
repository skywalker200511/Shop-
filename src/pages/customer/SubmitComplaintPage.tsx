import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, Sparkles, Send, ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';

import { GlassCard } from '@/components/shared/GlassCard';
import { AiBadge } from '@/components/shared/AiBadge';
import { ComplaintCategory, ComplaintPriority } from '@/types';
import { analyzeComplaint } from '@/lib/gemini';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseService } from '@/services/supabaseService';

const schema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(100, 'Subject is too long'),
  category: z.nativeEnum(ComplaintCategory, { errorMap: () => ({ message: 'Please select a category' }) }),
  priority: z.nativeEnum(ComplaintPriority).optional(),
  description: z.string().min(20, 'Please provide more details (min 20 characters)')
});

type FormData = z.infer<typeof schema>;

export default function SubmitComplaintPage() {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    category?: ComplaintCategory;
    priority?: ComplaintPriority;
    duplicates?: number;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: undefined,
      priority: undefined
    }
  });

  const description = watch('description');

  useEffect(() => {
    const analyzeText = async () => {
      if (description && description.length > 50) {
        setIsAnalyzing(true);
        try {
          const results = await analyzeComplaint(description);
          setAiSuggestions({
            category: results.predicted_category,
            priority: results.predicted_priority,
            duplicates: results.duplicate_ids?.length || 0
          });
        } catch (error) {
          console.error(error);
        } finally {
          setIsAnalyzing(false);
        }
      } else {
        setAiSuggestions(null);
      }
    };

    const timeoutId = setTimeout(analyzeText, 1000);
    return () => clearTimeout(timeoutId);
  }, [description]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const applySuggestions = () => {
    if (aiSuggestions?.category) {
      setValue('category', aiSuggestions.category);
    }
    if (aiSuggestions?.priority) {
      setValue('priority', aiSuggestions.priority);
    }
    setAiSuggestions(null);
    toast.success('Suggestions applied');
  };

  const { user } = useAuth();

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error('You must be logged in to submit a complaint');
      return;
    }

    setIsSubmitting(true);
    try {
      const profile = await supabaseService.getCustomerProfile(user.id);
      if (!profile) throw new Error("Customer profile not found");

      await supabaseService.createComplaint({
        title: data.subject,
        description: data.description,
        category: data.category,
        customer_id: profile.id, // Use actual customer record ID, not auth user ID
        priority: 'medium',
        status: 'open',
      });
      
      toast.success('Complaint submitted successfully');
      navigate('/customer/dashboard');
    } catch (error: any) {
      console.error("Complaint Submission Error:", error);
      toast.error(`Failed to submit complaint: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-3xl">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm font-inter"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 font-inter">Submit a Complaint</h1>
        <p className="text-gray-400 font-inter">We'll get back to you within 24 hours</p>
      </div>

      <GlassCard className="p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-inter">Subject *</label>
            <input
              {...register('subject')}
              className={cn(
                "w-full bg-[#121212] border rounded-[10px] p-3 text-white focus:outline-none transition-colors",
                errors.subject ? "border-[#E11D48] focus:border-[#E11D48]" : "border-[#2a2a2a] focus:border-[#3B82F6]"
              )}
              placeholder="Brief summary of the issue"
            />
            {errors.subject && <p className="text-[#E11D48] text-xs mt-1">{errors.subject.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-inter">Issue Type *</label>
              <select
                {...register('category')}
                className={cn(
                  "w-full bg-[#121212] border rounded-[10px] p-3 text-white focus:outline-none transition-colors appearance-none",
                  errors.category ? "border-[#E11D48] focus:border-[#E11D48]" : "border-[#2a2a2a] focus:border-[#3B82F6]"
                )}
              >
                <option value="">Select issue type</option>
                {Object.values(ComplaintCategory).map(cat => (
                  <option key={cat} value={cat} className="capitalize">{cat.replace('_', ' ')}</option>
                ))}
              </select>
              {errors.category && <p className="text-[#E11D48] text-xs mt-1">{errors.category.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-inter">Description *</label>
            <textarea
              {...register('description')}
              rows={8}
              className={cn(
                "w-full bg-[#121212] border rounded-[10px] p-4 text-white focus:outline-none transition-colors resize-y",
                errors.description ? "border-[#E11D48] focus:border-[#E11D48]" : "border-[#2a2a2a] focus:border-[#3B82F6]"
              )}
              placeholder="Please provide as much detail as possible..."
            />
            {errors.description && <p className="text-[#E11D48] text-xs mt-1">{errors.description.message}</p>}
          </div>

          {/* AI Suggestions Box */}
          <AnimatePresence>
            {aiSuggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-[#1e3a8a]/10 border border-[#1e3a8a]/30 rounded-[10px] p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-[#3B82F6]" />
                      <span className="text-sm font-medium text-[#3B82F6]">AI Suggestion</span>
                      <AiBadge />
                    </div>
                    <p className="text-xs text-gray-300">
                      Based on your description, this seems like a <strong className="text-white capitalize">{aiSuggestions.priority}</strong> priority <strong className="text-white capitalize">{aiSuggestions.category}</strong> issue.
                    </p>
                    {aiSuggestions.duplicates && aiSuggestions.duplicates > 0 && (
                      <button type="button" className="text-xs text-[#E11D48] mt-1 hover:underline">
                        We found {aiSuggestions.duplicates} similar complaints
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setAiSuggestions(null)}
                      className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Ignore
                    </button>
                    <button
                      type="button"
                      onClick={applySuggestions}
                      className="px-3 py-1.5 bg-[#3B82F6] hover:bg-blue-600 text-white rounded text-xs transition-colors"
                    >
                      Apply Auto-fill
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-inter">Attachments (Optional)</label>
            <div className="border-2 border-dashed border-[#2a2a2a] rounded-[10px] p-6 flex flex-col items-center justify-center bg-[#121212] hover:bg-[#1a1a1a] transition-colors relative">
              <input 
                type="file" 
                multiple 
                onChange={handleFileUpload} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 text-gray-400 mb-2" />
              <p className="text-gray-400 text-sm">Drop files here or click to upload</p>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#2a2a2a] px-3 py-1.5 rounded-full text-xs text-gray-300">
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-gray-500 hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#2a2a2a]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-[#E11D48] hover:bg-rose-700 disabled:opacity-50 text-white px-8 py-3 rounded-[10px] font-medium flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:shadow-[0_0_25px_rgba(225,29,72,0.5)]"
            >
              {isSubmitting ? (
                <span className="animate-pulse flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </span>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submit Complaint
                </>
              )}
            </button>
          </div>

        </form>
      </GlassCard>
    </div>
  );
}
