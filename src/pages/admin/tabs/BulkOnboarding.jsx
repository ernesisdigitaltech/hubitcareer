// src/pages/admin/tabs/BulkOnboarding.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { GoogleGenAI, Type } from '@google/genai';
import { Sparkles, FileText, HelpCircle, UploadCloud, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function BulkOnboarding() {
  const [skills, setSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [documentText, setDocumentText] = useState('');
  
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Load existing baseline skill tracks so the admin can pick where to attach the text
  useEffect(() => {
    async function loadSkillsList() {
      try {
        const querySnapshot = await getDocs(collection(db, 'skills'));
        const list = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({ id: docSnap.id, dbId: data.id, name: data.name });
        });
        setSkills(list);
        if (list.length > 0) setSelectedSkillId(list[0].dbId);
      } catch (error) {
        console.error("Error loading skill items:", error);
      } finally {
        setLoadingSkills(false);
      }
    }
    loadSkillsList();
  }, []);

  const handleAiProcessingPipeline = async (e) => {
    e.preventDefault();
    if (!selectedSkillId || !documentText.trim()) {
      alert("Please choose a target skill track and paste your source learning manual text.");
      return;
    }

    const apiKeyToUse = geminiApiKey.trim() || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKeyToUse) {
      alert("Please provide a Gemini API Key either in the form input field or inside your local .env file as VITE_GEMINI_API_KEY.");
      return;
    }

    setProcessing(true);
    setSuccessData(null);

    try {
      // 1. Initialize the Google Gen AI Client
      setProcessStep("Initializing Gemini AI Client engine...");
      const ai = new GoogleGenAI({ apiKey: apiKeyToUse });

      // 2. Fetch Generation Request
      setProcessStep("Gemini is reading text, parsing chapters, and writing 20 test questions...");
      
      const promptText = `
        You are an expert curriculum design engineer. Analyze the following source educational text document for the skill code "${selectedSkillId}".
        
        Perform two actions:
        1. Break down the text logically into 4 to 6 sequentially ordered text pages/chapters suitable for standard reading blocks. Format the content fields using clean Markdown style.
        2. Formulate exactly 20 distinct high-quality multiple choice assessment questions directly verified by information present in this text. Provide exactly 4 options per item, along with a 0-indexed correct option identifier.

        You MUST respond with a single, perfectly formed JSON object conforming strictly to the following Schema types. Return only the raw JSON data.

        Schema Specification:
        {
          "chapters": [
            {
              "chapterNumber": 1,
              "title": "Chapter Title Here",
              "content": "Full markdown reading body content here"
            }
          ],
          "quizQuestions": [
            {
              "questionText": "The question string?",
              "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
              "correctOptionIndex": 0
            }
          ]
        }

        Source Document Text Content:
        ${documentText}
      `;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText,
        config: {
          // Force structural output constraints to ensure client parsing safety
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              chapters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    chapterNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    content: { type: Type.STRING }
                  },
                  required: ["chapterNumber", "title", "content"]
                }
              },
              quizQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionText: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctOptionIndex: { type: Type.INTEGER }
                  },
                  required: ["questionText", "options", "correctOptionIndex"]
                }
              }
            },
            required: ["chapters", "quizQuestions"]
          }
        }
      });

      const processedPayload = JSON.parse(aiResponse.text);
      
      // 3. Write parsed Chapter objects into Firestore under the target skill record
      setProcessStep(`Uploading ${processedPayload.chapters?.length} structural text materials directly to database...`);
      const skillDocRef = doc(db, 'skills', selectedSkillId);
      await setDoc(skillDocRef, {
        chapters: processedPayload.chapters,
        hasContent: true,
        contentUpdatedAt: serverTimestamp()
      }, { merge: true });

      // 4. Batch loop the compiled multiple choice questions into your questionBank collection
      setProcessStep(`Injecting ${processedPayload.quizQuestions?.length} custom AI questions straight into your central Question Bank ledger...`);
      
      const questionBankCollection = collection(db, 'questionBank');
      const uploadPromises = processedPayload.quizQuestions.map((qItem) => {
        return addDoc(questionBankCollection, {
          skillId: selectedSkillId,
          questionText: qItem.questionText,
          options: qItem.options,
          correctOptionIndex: qItem.correctOptionIndex,
          createdAt: serverTimestamp(),
          generatedBy: 'Gemini Automated AI Pipeline'
        });
      });
      
      await Promise.all(uploadPromises);

      // Trigger completion success display
      setSuccessData({
        chaptersCount: processedPayload.chapters?.length || 0,
        questionsCount: processedPayload.quizQuestions?.length || 0
      });
      setDocumentText('');

    } catch (error) {
      console.error("Critical onboarding pipeline processing breakdown:", error);
      alert(`Pipeline error: ${error.message || "Execution faulted during synthesis layers."}`);
    } finally {
      setProcessing(false);
      setProcessStep('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Automated AI Pipeline</h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload raw textbooks or training handouts. Gemini will instantly assemble chapters and write matching exam question banks.
        </p>
      </div>

      {loadingSkills ? (
        <div className="flex flex-col items-center justify-center py-12 bg-slate-900/20 border border-slate-800 rounded-xl">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleAiProcessingPipeline} className="space-y-6 max-w-4xl">
          
          {/* Success Summary View block */}
          {successData && (
            <div className="flex gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm animate-scale-in">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Automated Onboarding Complete!</p>
                <p className="text-xs text-emerald-500/80 mt-1">
                  Successfully parsed and deployed <strong>{successData.chaptersCount} chapters</strong> into the skills reader layout, and dynamically added <strong>{successData.questionsCount} evaluation questions</strong> to the quiz bank ledger.
                </p>
              </div>
            </div>
          )}

          {/* Form parameters */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 backdrop-blur-sm space-y-4">
            
            {/* Split row setup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Target Skill Course Track</label>
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {skills.map((s) => (
                    <option key={s.id} value={s.dbId}>{s.name} ({s.dbId})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                  <span>Gemini API Key</span>
                  <span className="text-[10px] text-slate-500 font-mono italic">Optional if set in .env</span>
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors font-mono text-xs placeholder:text-slate-700"
                />
              </div>
            </div>

            {/* Huge document paste textarea component */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-400" /> Source Handout Textbook Document Text
              </label>
              <textarea
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                required
                rows={12}
                disabled={processing}
                placeholder="Paste your raw training manuscript pages, lesson notes, copy-pasted document structures, or course handouts here (up to 40,000 words)..."
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed font-sans"
              />
            </div>
          </div>

          {/* Core Processing Overlay Loader layout blocks */}
          <div className="flex items-center justify-between">
            {processing ? (
              <div className="flex items-center gap-3 text-xs text-blue-400 font-mono">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="animate-pulse">{processStep}</span>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 max-w-md flex items-start gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>Running this pipeline overwrite transforms existing course chapter pages and pushes new exam models down your data stream tree directly.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={processing || !documentText.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl disabled:opacity-40 transition-all shadow-lg shadow-blue-500/10 cursor-pointer flex-shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              Synthesize and Deploy Content
            </button>
          </div>

        </form>
      )}
    </div>
  );
}