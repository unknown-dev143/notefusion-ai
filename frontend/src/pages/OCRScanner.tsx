import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, FileText, Copy, Download, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotes } from '../features/notes/context/NoteContext';
import { api, handleApiError } from '../lib/api';

const OCRScanner: React.FC = () => {
  const { createNote } = useNotes();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setExtractedText('');
      };
      reader.readAsDataURL(file);
      toast.success('Image uploaded!');
    }
  };

  const performOCR = async () => {
    if (!imageFile) {
      toast.error('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Extracting neural nodes from image...');

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await api.post('/ai/ocr', formData);
      
      if (response.data.content) {
          setExtractedText(response.data.content);
          toast.success('Text extracted successfully!');
      } else {
          throw new Error(response.data.error || 'OCR failed');
      }
    } catch (error) {
      toast.error(handleApiError(error, 'OCR processing failed'));
    } finally {
      setIsProcessing(false);
      toast.dismiss(toastId);
    }
  };

  const saveAsNote = async () => {
    if (!extractedText) {
      toast.error('No text to save');
      return;
    }

    try {
      await createNote({
        title: `OCR Scan - ${new Date().toLocaleDateString()}`,
        content: extractedText,
        tags: ['ocr', 'scan', 'extracted'],
        isPinned: false,
        isArchived: false,
        color: '#e0f2fe'
      } as any);

      toast.success('Saved as note!');
    } catch (error) {
      toast.error('Failed to save note');
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(extractedText);
    toast.success('Text copied to clipboard!');
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr-extract-${Date.now()}.txt`;
    a.click();
    toast.success('Text downloaded!');
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-slide-up">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-[24px] flex items-center justify-center shadow-xl">
            <ImageIcon size={32} className="text-white"/>
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 leading-none">OCR Scanner</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">Extract text from images and scans</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Upload */}
        <div className="bg-white border border-slate-100 rounded-[48px] p-12 shadow-lg">
          <h2 className="text-2xl font-black text-slate-900 mb-8">Upload Image</h2>

          {selectedImage ? (
            <div className="space-y-6">
              <div className="relative rounded-[32px] overflow-hidden border-2 border-slate-200">
                <img 
                  src={selectedImage} 
                  alt="Uploaded" 
                  className="w-full h-auto max-h-[400px] object-contain bg-slate-50"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                >
                  Change Image
                </button>
                <button
                  onClick={performOCR}
                  disabled={isProcessing}
                  className="flex-1 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-cyan-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader size={18} className="animate-spin"/>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileText size={18}/>
                      Extract Text
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-[32px] p-16 text-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50/30 transition-all"
            >
              <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload size={32} className="text-cyan-600"/>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                Upload an Image
              </h3>
              <p className="text-sm text-slate-600 font-medium mb-6">
                Click to browse or drag and drop
              </p>
              <p className="text-xs text-slate-400 font-medium">
                Supports: JPG, PNG, PDF, HEIC
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Supported Features */}
          <div className="mt-8 p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 rounded-[32px]">
            <p className="text-sm font-black text-cyan-900 mb-3">Supported Content</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-600 rounded-full"></span>
                <span className="text-cyan-700 font-medium">Printed text</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-600 rounded-full"></span>
                <span className="text-cyan-700 font-medium">Handwriting</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-600 rounded-full"></span>
                <span className="text-cyan-700 font-medium">Textbooks</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-600 rounded-full"></span>
                <span className="text-cyan-700 font-medium">Documents</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-600 rounded-full"></span>
                <span className="text-cyan-700 font-medium">Whiteboards</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-600 rounded-full"></span>
                <span className="text-cyan-700 font-medium">Screenshots</span>
              </div>
            </div>
          </div>
        </div>

        {/* Extracted Text */}
        <div className="bg-white border border-slate-100 rounded-[48px] p-12 shadow-lg">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-900">Extracted Text</h2>
            {extractedText && (
              <div className="flex gap-2">
                <button
                  onClick={copyText}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-200 transition-all flex items-center gap-2"
                >
                  <Copy size={14}/>
                  Copy
                </button>
                <button
                  onClick={downloadText}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-xs font-black hover:bg-blue-200 transition-all flex items-center gap-2"
                >
                  <Download size={14}/>
                  Download
                </button>
              </div>
            )}
          </div>

          {extractedText ? (
            <div className="space-y-6">
              <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-200 max-h-[500px] overflow-y-auto">
                <pre className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed text-sm">
                  {extractedText}
                </pre>
              </div>

              <button
                onClick={saveAsNote}
                className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-cyan-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <FileText size={18}/>
                Save as Note
              </button>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText size={32} className="text-slate-400"/>
              </div>
              <p className="text-slate-600 font-medium mb-2">
                No text extracted yet
              </p>
              <p className="text-sm text-slate-400 font-medium">
                Upload an image and click "Extract Text"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-8 p-8 bg-white border border-slate-100 rounded-[48px] shadow-lg">
        <h3 className="text-xl font-black text-slate-900 mb-6">How OCR Works</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📸</span>
            </div>
            <p className="text-sm font-black text-slate-900 mb-2">1. Upload</p>
            <p className="text-xs text-slate-600 font-medium">
              Take a photo or upload an image
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <p className="text-sm font-black text-slate-900 mb-2">2. Process</p>
            <p className="text-xs text-slate-600 font-medium">
              AI analyzes and recognizes text
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-sm font-black text-slate-900 mb-2">3. Extract</p>
            <p className="text-xs text-slate-600 font-medium">
              Get editable, searchable text
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💾</span>
            </div>
            <p className="text-sm font-black text-slate-900 mb-2">4. Save</p>
            <p className="text-xs text-slate-600 font-medium">
              Create notes from extracted text
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OCRScanner;
