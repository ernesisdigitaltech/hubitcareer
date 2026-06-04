import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { Upload, File, Link2, Trash2, Loader2, ClipboardCheck, FolderOpen } from 'lucide-react';

export default function FileManager() {
  const [filesList, setFilesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = 'hubitcareer_preset';

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'siteAssets'));
      const assets = [];
      querySnapshot.forEach((docSnap) => {
        assets.push({ id: docSnap.id, ...docSnap.data() });
      });
      setFilesList(assets);
    } catch (err) {
      console.error("Failed to read database media index entries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) throw new Error('Cloudinary asset stream upload failure');

      const data = await response.json();
      
      // Log index entry down into Firestore database registry
      await addDoc(collection(db, 'siteAssets'), {
        name: file.name,
        url: data.secure_url,
        publicId: data.public_id,
        uploadedAt: new Date()
      });

      fetchFiles();
    } catch (err) {
      console.error(err);
      alert("Error handling file processing storage stream.");
    } finally {
      setUploading(false);
    }
  };

  const handleCopyLink = (url, index) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDeleteFile = async (assetId) => {
    if (!window.confirm("Remove this asset reference from your dashboard?")) return;
    try {
      await deleteDoc(doc(db, 'siteAssets', assetId));
      fetchFiles();
    } catch (err) {
      alert(`Error cleaning record parameters: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Course Assets & File Manager (Cloudinary)</h2>
          <p className="text-xs text-white/50">Upload and store supplementary graphics, resources, and images securely without CORS friction.</p>
        </div>

        <div>
          {uploading ? (
            <div className="flex items-center gap-2 text-xs text-[#2979FF] font-medium bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Streaming to Cloudinary...</span>
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 bg-[#2979FF] hover:bg-[#1a5fcc] text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition">
              <Upload className="w-4 h-4" />
              Upload New Asset
              <input type="file" onChange={handleUpload} className="hidden" />
            </label>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-white/40 pt-4">
          <Loader2 className="w-4 h-4 animate-spin text-[#2979FF]" />
          <span>Syncing application visual repository metrics...</span>
        </div>
      ) : filesList.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center max-w-xl mx-auto mt-6">
          <FolderOpen className="w-8 h-8 text-white/20 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-white/80">No assets hosted yet</h3>
          <p className="text-xs text-white/40 mt-1">Upload high-performance graphics, backgrounds, or cover vectors to grab secure URLs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filesList.map((file, index) => (
            <div 
              key={file.id} 
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between group hover:border-white/20 transition relative overflow-hidden"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 group-hover:text-[#2979FF] transition-colors flex-shrink-0">
                  <File className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-white truncate pr-6" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[10px] text-white/40 mt-0.5 font-mono truncate">
                    cloudinary://res.cloudinary.com/...
                  </p>
                </div>
              </div>

              {/* Previews images directly if asset is a graphic link element */}
              {file.url && (
                <div className="mt-3 w-full h-24 rounded-lg bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center p-1">
                  <img src={file.url} alt="asset node preview" className="max-w-full max-h-full object-contain rounded" />
                </div>
              )}

              <div className="flex items-center justify-end gap-1.5 border-t border-white/10 mt-4 pt-3">
                <button
                  onClick={() => handleCopyLink(file.url, index)}
                  className={`p-1.5 rounded-lg border transition text-xs flex items-center gap-1.5 ${
                    copiedIndex === index
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {copiedIndex === index ? <ClipboardCheck className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                  <span className="text-[10px] font-medium">{copiedIndex === index ? 'Copied' : 'Copy URL'}</span>
                </button>
                
                <button
                  onClick={() => handleDeleteFile(file.id)}
                  className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}