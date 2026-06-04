import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../firebase/config';
import { Globe, Upload, Save, Link2, CheckCircle2, Loader2 } from 'lucide-react';

export default function SiteBrandingSetup() {
  const [branding, setBranding] = useState({
    logoUrl: '',
    faviconUrl: '',
    siteName: 'Hubitcareer',
    tagline: ''
  });
  const [loading, setLoading] = useState(true);
  const [uploadingField, setUploadingField] = useState(null); // 'logo' | 'favicon'
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function loadBrandingData() {
      try {
        const snap = await getDoc(doc(db, 'siteContent', 'branding'));
        if (snap.exists()) {
          setBranding(prev => ({ ...prev, ...snap.data() }));
        }
      } catch (err) {
        console.error("Failed to fetch branding data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBrandingData();
  }, []);

  const handleInputChange = (e) => {
    setBranding({ ...branding, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e, fieldType) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingField(fieldType);
    setProgress(0);

    const storagePath = `branding/${fieldType}-${Date.now()}-${file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const p = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(p);
      },
      (error) => {
        console.error(error);
        setUploadingField(null);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        setBranding(prev => {
          const updated = { ...prev, [fieldType === 'logo' ? 'logoUrl' : 'faviconUrl']: downloadUrl };
          // If updating favicon dynamically in real-time on admin side:
          if (fieldType === 'favicon') updateFaviconInDOM(downloadUrl);
          return updated;
        });
        setUploadingField(null);
      }
    );
  };

  const updateFaviconInDOM = (url) => {
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'icon';
    link.href = url;
    document.getElementsByTagName('head')[0].appendChild(link);
  };

  const handleSaveBranding = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'siteContent', 'branding'), branding, { merge: true });
      updateFaviconInDOM(branding.faviconUrl);
      setStatus('Branding assets configurations updated globally!');
      setTimeout(() => setStatus(''), 4000);
    } catch (err) {
      alert(`Error saving configurations: ${err.message}`);
    }
  };

  if (loading) return <div className="text-white/50 text-xs">Loading identity parameters...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <Globe className="text-[#2979FF] w-5 h-5" />
        <div>
          <h2 className="text-lg font-semibold text-white">Identity & Media Setup</h2>
          <p className="text-xs text-white/50">Manage your digital platform assets links, typography branding, and system icon configurations.</p>
        </div>
      </div>

      {status && (
        <div className="flex gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs items-center">
          <CheckCircle2 className="w-4 h-4" />
          <span>{status}</span>
        </div>
      )}

      <form onSubmit={handleSaveBranding} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: FIELDS */}
        <div className="space-y-4">
          <div>
            <label className="text-white/70 text-xs mb-1 block">Platform Name</label>
            <input 
              type="text" name="siteName" value={branding.siteName} onChange={handleInputChange}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2979FF]"
            />
          </div>

          <div>
            <label className="text-white/70 text-xs mb-1 block">Tagline / Platform Subtitle</label>
            <input 
              type="text" name="tagline" value={branding.tagline} onChange={handleInputChange} placeholder="Your tech gateway"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2979FF]"
            />
          </div>

          {/* Logo URL Input Container */}
          <div>
            <label className="text-white/70 text-xs mb-1 block">Logo Image URL Link</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
                <input 
                  type="text" name="logoUrl" value={branding.logoUrl} onChange={handleInputChange} placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#2979FF]"
                />
              </div>
              <label className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 transition">
                <Upload className="w-3.5 h-3.5" />
                Upload
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} className="hidden" />
              </label>
            </div>
          </div>

          {/* Favicon URL Input Container */}
          <div>
            <label className="text-white/70 text-xs mb-1 block">Favicon (.ico / .png) URL Link</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
                <input 
                  type="text" name="faviconUrl" value={branding.faviconUrl} onChange={handleInputChange} placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#2979FF]"
                />
              </div>
              <label className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 transition">
                <Upload className="w-3.5 h-3.5" />
                Upload
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'favicon')} className="hidden" />
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="inline-flex items-center gap-2 bg-[#2979FF] hover:bg-[#1a5fcc] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition"
          >
            <Save className="w-4 h-4" />
            Save Identity Configurations
          </button>
        </div>

        {/* RIGHT COLUMN: PREVIEWS */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-6 flex flex-col justify-center">
          {uploadingField && (
            <div className="space-y-1.5 bg-[#2979FF]/10 border border-[#2979FF]/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-[#2979FF] font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing media asset upload field [{uploadingField}]: {progress}%</span>
              </div>
            </div>
          )}

          {/* Logo Visualizer */}
          <div className="space-y-2">
            <span className="text-[11px] font-medium text-white/40 tracking-wider uppercase block">Live Sidebar Logo Preview</span>
            <div className="h-16 bg-[#060B1F] border border-white/10 rounded-lg p-3 flex items-center justify-start overflow-hidden">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo preview" className="max-h-10 w-auto object-contain" />
              ) : (
                <span className="text-sm font-bold text-white">{branding.siteName}</span>
              )}
            </div>
          </div>

          {/* Favicon Visualizer */}
          <div className="space-y-2">
            <span className="text-[11px] font-medium text-white/40 tracking-wider uppercase block">Browser Tab Tab-Icon Preview</span>
            <div className="bg-[#0A0F2C] border border-white/10 rounded-lg p-3 flex items-center gap-2 max-w-xs">
              <div className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-0.5">
                {branding.faviconUrl ? (
                  <img src={branding.faviconUrl} alt="Favicon preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-[#2979FF]" />
                )}
              </div>
              <span className="text-xs text-white/70 truncate">{branding.siteName} | Dashboard</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}