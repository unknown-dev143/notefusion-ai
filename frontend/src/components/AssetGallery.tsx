import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Image as ImageIcon, FileText, Film, Music, X, Plus, Download, Link, Loader2, FolderOpen } from 'lucide-react';
import { uploadFile } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Asset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'video' | 'audio' | 'other';
  size: number;
  uploadedAt: string;
}

interface AssetGalleryProps {
  /** Called when user clicks "Embed" on an asset so the parent can insert it. */
  onEmbed?: (asset: Asset) => void;
  /** If true, shows as a slide-in panel; otherwise renders inline */
  isPanel?: boolean;
  onClose?: () => void;
}

const ASSET_STORAGE_KEY = 'notefusion_assets';

const formatBytes = (b: number) =>
  b < 1024 ? `${b} B` : b < 1024 ** 2 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 ** 2).toFixed(1)} MB`;

const typeIcon = (type: Asset['type']) => {
  switch (type) {
    case 'image': return <ImageIcon size={20} className="text-blue-500" />;
    case 'pdf': return <FileText size={20} className="text-rose-500" />;
    case 'video': return <Film size={20} className="text-purple-500" />;
    case 'audio': return <Music size={20} className="text-emerald-500" />;
    default: return <FileText size={20} className="text-slate-400" />;
  }
};

const mimeToType = (mime: string): Asset['type'] => {
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  return 'other';
};

const AssetGallery: React.FC<AssetGalleryProps> = ({ onEmbed, isPanel = false, onClose }) => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState<string[]>([]);
  const [preview, setPreview] = useState<Asset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load persisted assets from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ASSET_STORAGE_KEY);
      if (raw) setAssets(JSON.parse(raw));
    } catch {/* ignore */}
  }, []);

  const persistAssets = (next: Asset[]) => {
    setAssets(next);
    try { localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify(next)); } catch {/* ignore */}
  };

  const uploadAssets = useCallback(async (files: FileList | File[]) => {
    const uid = (user as any)?.uid || (user as any)?.id || 'local';
    const fileArr = Array.from(files);

    for (const file of fileArr) {
      const tempId = `tmp-${Date.now()}-${Math.random()}`;
      setUploading(prev => [...prev, tempId]);
      try {
        const path = `users/${uid}/assets/${Date.now()}_${file.name}`;
        const url = await uploadFile(file, path);
        const asset: Asset = {
          id: `asset-${Date.now()}`,
          name: file.name,
          url,
          type: mimeToType(file.type),
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };
        setAssets(prev => {
          const next = [asset, ...prev];
          try { localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify(next)); } catch {/* ignore */}
          return next;
        });
        toast.success(`${file.name} uploaded!`);
      } catch (err) {
        // Fallback: create an object URL so the user still sees the asset locally
        const url = URL.createObjectURL(file);
        const asset: Asset = {
          id: `local-${Date.now()}`,
          name: file.name,
          url,
          type: mimeToType(file.type),
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };
        setAssets(prev => {
          const next = [asset, ...prev];
          try { localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify(next)); } catch {/* ignore */}
          return next;
        });
        toast.success(`${file.name} saved locally`);
      } finally {
        setUploading(prev => prev.filter(id => id !== tempId));
      }
    }
  }, [user]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) uploadAssets(e.dataTransfer.files);
  }, [uploadAssets]);

  const handleDelete = (id: string) => {
    persistAssets(assets.filter(a => a.id !== id));
    if (preview?.id === id) setPreview(null);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied!');
  };

  const wrapperClass = isPanel
    ? 'fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-slate-100 animate-slide-right'
    : 'flex flex-col gap-4';

  return (
    <div className={wrapperClass}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <FolderOpen size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-black text-slate-900 text-sm">Asset Gallery</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{assets.length} files</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
            title="Upload files"
          >
            <Plus size={18} />
          </button>
          {isPanel && onClose && (
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className={`mx-4 mt-4 border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer select-none ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
        }`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={28} className={`mx-auto mb-2 transition-colors ${isDragging ? 'text-blue-500' : 'text-slate-300'}`} />
        <p className="text-xs font-bold text-slate-500">Drop files or <span className="text-blue-600 underline">browse</span></p>
        <p className="text-[10px] text-slate-400 mt-1">Images, PDFs, videos, audio</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,video/*,audio/*"
          className="hidden"
          onChange={e => e.target.files && uploadAssets(e.target.files)}
        />
      </div>

      {/* Upload progress indicators */}
      {uploading.length > 0 && (
        <div className="mx-4 flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">
          <Loader2 size={14} className="animate-spin" />
          Uploading {uploading.length} file{uploading.length > 1 ? 's' : ''}…
        </div>
      )}

      {/* Asset Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
        {assets.length === 0 && uploading.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <ImageIcon size={36} className="text-slate-200 mb-3" />
            <p className="text-sm font-bold text-slate-400">No assets yet</p>
            <p className="text-xs text-slate-300 mt-1">Upload files to start your gallery</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-3">
            {assets.map(asset => (
              <div
                key={asset.id}
                className="group relative bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer"
                onClick={() => setPreview(asset)}
              >
                {/* Thumbnail */}
                {asset.type === 'image' ? (
                  <img src={asset.url} alt={asset.name} className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28 flex items-center justify-center bg-slate-100">
                    {typeIcon(asset.type)}
                  </div>
                )}

                {/* Info overlay */}
                <div className="p-2">
                  <p className="text-[11px] font-bold text-slate-700 truncate">{asset.name}</p>
                  <p className="text-[10px] text-slate-400">{formatBytes(asset.size)}</p>
                </div>

                {/* Hover actions */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 rounded-2xl">
                  {onEmbed && (
                    <button
                      onClick={e => { e.stopPropagation(); onEmbed(asset); toast.success('Embedded!'); }}
                      className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-lg hover:bg-blue-500 transition-all uppercase tracking-widest"
                    >
                      Embed
                    </button>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); copyUrl(asset.url); }}
                    className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all"
                    title="Copy URL"
                  >
                    <Link size={14} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(asset.id); }}
                    className="p-2 bg-rose-500/80 text-white rounded-lg hover:bg-rose-600 transition-all"
                    title="Delete"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full-screen Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-8" onClick={() => setPreview(null)}>
          <div className="max-w-3xl w-full bg-white rounded-[32px] overflow-hidden shadow-3xl animate-slide-up" onClick={e => e.stopPropagation()}>
            {preview.type === 'image' && (
              <img src={preview.url} alt={preview.name} className="w-full max-h-[60vh] object-contain bg-slate-100" />
            )}
            {preview.type === 'pdf' && (
              <iframe src={preview.url} title={preview.name} className="w-full h-[60vh]" />
            )}
            {preview.type === 'video' && (
              <video src={preview.url} controls className="w-full max-h-[60vh]" />
            )}
            {preview.type === 'audio' && (
              <div className="p-10 bg-slate-50 flex items-center justify-center">
                <audio src={preview.url} controls className="w-full" />
              </div>
            )}
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="font-black text-slate-900">{preview.name}</p>
                <p className="text-xs text-slate-400">{formatBytes(preview.size)} · {new Date(preview.uploadedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-3">
                {onEmbed && (
                  <button
                    onClick={() => { onEmbed(preview); setPreview(null); toast.success('Embedded into note!'); }}
                    className="px-5 py-2.5 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition-all uppercase tracking-widest"
                  >
                    Embed in Note
                  </button>
                )}
                <a
                  href={preview.url}
                  download={preview.name}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-black rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 uppercase tracking-widest"
                >
                  <Download size={14} /> Download
                </a>
                <button onClick={() => setPreview(null)} className="p-2.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all">
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetGallery;
