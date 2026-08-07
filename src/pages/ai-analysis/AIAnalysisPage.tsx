import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Sparkles, AlertTriangle, FileText, 
  MessageSquare, User, GitMerge, FileWarning, 
  Save, RefreshCcw, CheckCircle, Clock 
} from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '@/components/shared/GlassCard';
import { AiBadge } from '@/components/shared/AiBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { analyzeComplaint, analyzeAllComplaints } from '@/lib/gemini';
import { supabaseService } from '@/services/supabaseService';
import type { AIAnalysis, Complaint } from '@/types';
import { cn } from '@/lib/utils';

export default function AIAnalysisPage() {
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<Partial<AIAnalysis> | null>(null);
  const [batchResults, setBatchResults] = useState<any>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  useEffect(() => {
    supabaseService.getAllComplaints().then(setComplaints);
  }, []);
  
  const handleBatchAnalyze = async () => {
    setIsAnalyzing(true);
    setBatchResults(null);
    try {
      const summary = await analyzeAllComplaints(complaints);
      setBatchResults(summary);
      toast.success('Batch analysis complete');
    } catch (error) {
      toast.error('Failed to generate batch summary');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    setResults(null);
    
    try {
      const analysis = await analyzeComplaint(inputText);
      setResults(analysis);
      toast.success('Analysis complete');
    } catch (error) {
      toast.error('Failed to analyze text');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleComplaintSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedComplaintId(id);
    const complaint = complaints.find(c => c.id === id);
    if (complaint) {
      setInputText(complaint.description);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} file(s) uploaded`);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    toast.success('Analysis saved successfully');
  };

  const handleClear = () => {
    setInputText('');
    setResults(null);
    setSelectedComplaintId('');
    setUploadedFiles([]);
  };

  const getSentimentColor = (score: number = 0.5) => {
    if (score < 0.2) return 'bg-red-500';
    if (score < 0.4) return 'bg-orange-500';
    if (score < 0.6) return 'bg-gray-400';
    if (score < 0.8) return 'bg-green-400';
    return 'bg-green-500';
  };

  const getRiskColor = (score: number = 50) => {
    if (score <= 30) return 'text-green-500 stroke-green-500';
    if (score <= 60) return 'text-yellow-500 stroke-yellow-500';
    if (score <= 80) return 'text-orange-500 stroke-orange-500';
    return 'text-red-500 stroke-red-500';
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-6 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Input Section */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white font-inter">AI Analysis</h2>
            <div className="flex bg-[#121212] border border-[#2a2a2a] rounded-lg p-1">
              <button 
                onClick={() => setMode('single')}
                className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-colors', mode === 'single' ? 'bg-[#E11D48] text-white' : 'text-gray-400 hover:text-white')}
              >Single</button>
              <button 
                onClick={() => setMode('batch')}
                className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-colors', mode === 'batch' ? 'bg-[#E11D48] text-white' : 'text-gray-400 hover:text-white')}
              >Batch Summary</button>
            </div>
          </div>
          
          <GlassCard className="p-6 flex flex-col gap-4">
            {mode === 'single' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 font-jetbrains">Input Text</label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste complaint text or describe the issue..."
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-[10px] p-4 text-white focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] outline-none transition-all resize-none min-h-[150px] font-inter"
                    rows={6}
                  />
                </div>

                <div className="border-2 border-dashed border-[#2a2a2a] rounded-[10px] p-8 flex flex-col items-center justify-center bg-[#121212] hover:bg-[#1a1a1a] transition-colors relative">
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.doc,.docx,.jpg,.png,.txt"
                  />
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-gray-400 text-sm font-inter text-center">Drop files here or click to upload</p>
                  <p className="text-gray-500 text-xs mt-1">Accepts .pdf, .doc, .jpg, .png, .txt</p>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {uploadedFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 bg-[#2a2a2a] px-3 py-1.5 rounded-full text-xs text-gray-300">
                        <span className="truncate max-w-[120px]">{file.name}</span>
                        <button onClick={() => removeFile(i)} className="text-gray-500 hover:text-white">&times;</button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 py-2">
                  <div className="h-px bg-[#2a2a2a] flex-1"></div>
                  <span className="text-gray-500 text-sm font-jetbrains">OR</span>
                  <div className="h-px bg-[#2a2a2a] flex-1"></div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 font-jetbrains">Select existing complaint</label>
                  <select
                    value={selectedComplaintId}
                    onChange={handleComplaintSelect}
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-[10px] p-3 text-white focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] outline-none appearance-none"
                  >
                    <option value="">-- Select a complaint --</option>
                    {complaints.map(c => (
                      <option key={c.id} value={c.id}>{c.complaint_number} - {c.title}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={!inputText.trim() || isAnalyzing}
                  className="mt-4 w-full bg-[#1e3a8a] hover:bg-[#1e40af] disabled:opacity-50 disabled:hover:bg-[#1e3a8a] text-white font-medium py-4 px-6 rounded-[10px] flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] group"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCcw className="w-5 h-5 animate-spin" />
                      <span className="animate-pulse">Analyzing with Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 group-hover:animate-pulse text-[#74D8BD]" />
                      Analyze Single Complaint
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#1e3a8a] to-[#E11D48] rounded-full flex items-center justify-center shadow-lg shadow-[#E11D48]/20">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Batch AI Summarization</h3>
                  <p className="text-gray-400 text-sm max-w-md">Generate a comprehensive executive summary of all {complaints.length} currently active complaints. Discover trending issues and critical cases instantly.</p>
                </div>
                <button
                  onClick={handleBatchAnalyze}
                  disabled={isAnalyzing}
                  className="mt-4 w-full bg-[#E11D48] hover:bg-[#E11D48]/90 disabled:opacity-50 disabled:hover:bg-[#E11D48] text-white font-medium py-4 px-6 rounded-[10px] flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:shadow-[0_0_25px_rgba(225,29,72,0.5)] group"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCcw className="w-5 h-5 animate-spin" />
                      <span className="animate-pulse">Generating Batch Summary...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 group-hover:animate-pulse text-white" />
                      Generate Executive Summary
                    </>
                  )}
                </button>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Results Section */}
        <div className="w-full lg:w-1/2">
          <AnimatePresence mode="wait">
            {isAnalyzing && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <LoadingSkeleton className="h-32" />
                <LoadingSkeleton className="h-24" />
                <div className="flex gap-4">
                  <LoadingSkeleton className="h-24 flex-1" />
                  <LoadingSkeleton className="h-24 flex-1" />
                </div>
                <LoadingSkeleton className="h-40" />
              </motion.div>
            )}

            {!isAnalyzing && mode === 'batch' && batchResults && (
              <motion.div
                key="batch-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white font-inter">Executive Summary</h2>
                  <div className="flex gap-2">
                    <button onClick={handleClear} className="p-2 text-gray-400 hover:text-white transition-colors bg-[#121212] rounded-lg border border-[#2a2a2a]">
                      <RefreshCcw size={18} />
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 bg-[#E11D48] hover:bg-[#E11D48]/90 text-white px-3 py-2 rounded-lg transition-colors text-sm">
                      <Save size={16} /> Save Report
                    </button>
                  </div>
                </div>

                <GlassCard className="p-6 border-l-4 border-l-[#E11D48]">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-[#E11D48]" />
                    <h3 className="text-lg font-bold text-white">Overview</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-sm">{batchResults.executive_summary}</p>
                </GlassCard>

                <h3 className="text-lg font-bold text-white mt-6 mb-4">Top Recurring Issues</h3>
                <div className="grid grid-cols-1 gap-4">
                  {batchResults.recurring_issues?.map((issue: any, idx: number) => (
                    <GlassCard key={idx} className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-2 rounded-full", issue.severity === 'High' ? 'bg-red-500' : issue.severity === 'Medium' ? 'bg-orange-500' : 'bg-yellow-500')} />
                        <span className="text-white font-medium">{issue.issue}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-400 bg-[#121212] px-2 py-1 rounded border border-[#2a2a2a]">{issue.count} occurrences</span>
                      </div>
                    </GlassCard>
                  ))}
                </div>

                <h3 className="text-lg font-bold text-white mt-6 mb-4">Critical Cases Requiring Action</h3>
                <div className="space-y-4">
                  {batchResults.critical_cases?.map((caseItem: any, idx: number) => (
                    <GlassCard key={idx} className="p-5 border border-red-500/30 bg-red-500/5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-red-400" />
                          <span className="font-bold text-white">{caseItem.user_name}</span>
                        </div>
                        <AiBadge />
                      </div>
                      <p className="text-sm text-gray-300 mb-3">{caseItem.issue}</p>
                      <div className="bg-[#121212] p-3 rounded-lg border border-[#2a2a2a]">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Recommended Action</span>
                        <p className="text-sm text-[#74D8BD]">{caseItem.recommendation}</p>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </motion.div>
            )}

            {!isAnalyzing && mode === 'single' && results && (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white font-inter">Analysis Results</h2>
                  <div className="flex gap-2">
                    <button onClick={handleClear} className="px-4 py-2 bg-transparent border border-[#2a2a2a] text-gray-300 rounded-[10px] hover:bg-[#2a2a2a] transition-colors text-sm">
                      Clear
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-[#E11D48] text-white rounded-[10px] hover:bg-rose-700 transition-colors flex items-center gap-2 text-sm shadow-[0_0_10px_rgba(225,29,72,0.3)]">
                      <Save className="w-4 h-4" /> Save
                    </button>
                  </div>
                </div>

                <GlassCard className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-medium flex items-center gap-2"><FileText className="w-4 h-4 text-[#3B82F6]" /> Summary</h3>
                    <AiBadge />
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{results.summary}</p>
                </GlassCard>

                <GlassCard className="p-5">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2"><User className="w-4 h-4 text-[#74D8BD]" /> Sentiment Analysis</h3>
                  <div className="relative h-4 bg-[#121212] rounded-full overflow-hidden border border-[#2a2a2a]">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-gray-400 to-green-500 opacity-80"></div>
                    <motion.div 
                      initial={{ left: '50%' }}
                      animate={{ left: `${(results.sentiment_score || 0.5) * 100}%` }}
                      className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_10px_white] -ml-1 border-2 border-[#121212]"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500 font-jetbrains">
                    <span>Very Negative</span>
                    <span>Neutral</span>
                    <span>Very Positive</span>
                  </div>
                  <div className="mt-3 text-center">
                    <span className="text-white font-medium capitalize mr-2">{results.sentiment?.replace('_', ' ')}</span>
                    <span className="text-gray-400 text-sm">({results.sentiment_score?.toFixed(2)})</span>
                  </div>
                </GlassCard>

                <div className="flex gap-4 flex-col sm:flex-row">
                  <GlassCard className="p-4 flex-1">
                    <h3 className="text-gray-400 text-xs font-jetbrains mb-2 uppercase">Predicted Priority</h3>
                    {results.predicted_priority && <PriorityBadge priority={results.predicted_priority} />}
                  </GlassCard>
                  
                  <GlassCard className="p-4 flex-1">
                    <h3 className="text-gray-400 text-xs font-jetbrains mb-2 uppercase">Category</h3>
                    <span className="text-white capitalize inline-block px-3 py-1 bg-[#2a2a2a] rounded-full text-sm">{results.predicted_category}</span>
                  </GlassCard>
                </div>

                <div className="flex gap-4 flex-col sm:flex-row">
                  <GlassCard className="p-5 flex-1 relative overflow-hidden group">
                    <h3 className="text-white font-medium mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-[#E11D48]" /> Risk Score</h3>
                    <div className="flex items-center gap-6 mt-4">
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" className="stroke-[#2a2a2a] stroke-[8px] fill-none" />
                          <motion.circle 
                            initial={{ strokeDasharray: "0, 251" }}
                            animate={{ strokeDasharray: `${(results.risk_score || 0) * 2.51}, 251` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            cx="48" cy="48" r="40" 
                            className={cn("stroke-[8px] fill-none stroke-linecap-round", getRiskColor(results.risk_score))}
                          />
                        </svg>
                        <span className={cn("absolute text-2xl font-bold font-jetbrains", getRiskColor(results.risk_score).split(' ')[0])}>
                          {results.risk_score}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">Potential escalation risk based on language and history.</p>
                      </div>
                    </div>
                  </GlassCard>
                </div>

                <GlassCard className="p-5">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-[#3B82F6]" /> Suggested Reply</h3>
                  <div className="relative">
                    <textarea 
                      className="w-full bg-[#121212] border border-[#2a2a2a] rounded-[10px] p-4 text-sm text-gray-200 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] outline-none min-h-[120px] resize-y font-inter"
                      defaultValue={results.suggested_reply}
                    />
                    <button className="absolute top-2 right-2 p-2 bg-[#2a2a2a] hover:bg-[#333] rounded-md text-gray-400 hover:text-white transition-colors" title="Copy">
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>

                <GlassCard className="p-5">
                  <h3 className="text-white font-medium mb-2 flex items-center gap-2"><GitMerge className="w-4 h-4 text-purple-400" /> Root Cause Analysis</h3>
                  <p className="text-sm text-gray-300 leading-relaxed bg-[#121212] p-4 rounded-[10px] border border-[#2a2a2a]">{results.root_cause}</p>
                </GlassCard>

                {results.duplicate_ids && results.duplicate_ids.length > 0 && (
                  <GlassCard className="p-5 border-[#E11D48]/30 bg-[#E11D48]/5">
                    <h3 className="text-[#E11D48] font-medium mb-2 flex items-center gap-2"><FileWarning className="w-4 h-4" /> Possible Duplicates Detected</h3>
                    <ul className="space-y-2 mt-3">
                      {results.duplicate_ids.map((id, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-[#171717] p-2 rounded-md border border-[#2a2a2a]">
                          <span className="text-sm text-gray-300 font-jetbrains">ID: {id}</span>
                          <span className="text-xs text-[#E11D48]">98% match</span>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
