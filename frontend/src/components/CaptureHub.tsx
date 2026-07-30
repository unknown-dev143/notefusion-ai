import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { 
  Camera, 
  Video, 
  Square, 
  Download, 
  Trash2, 
  Monitor,
  Mic,
  MicOff,
  Settings,
  X
} from 'lucide-react';

const CaptureHub: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [useMic, setUseMic] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<any>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const takeScreenshot = async () => {
        try {
            const canvas = await html2canvas(document.body, {
                useCORS: true,
                scale: 2,
                ignoreElements: (el) => el.id === 'capture-hub-floating'
            });
            const imgData = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `notefusion-capture-${new Date().getTime()}.png`;
            link.href = imgData;
            link.click();
            toast.success('Screenshot Captured & Optimized');
        } catch (err) {
            toast.error('Screenshot failed');
        }
    };

    const startRecording = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { frameRate: { ideal: 30 } }
            });

            let finalStream = screenStream;

            if (useMic) {
                try {
                    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const tracks = [...screenStream.getTracks(), ...audioStream.getAudioTracks()];
                    finalStream = new MediaStream(tracks);
                } catch (e) {
                    toast.error("Microphone access denied. Recording screen only.");
                }
            }

            streamRef.current = finalStream;
            const recorder = new MediaRecorder(finalStream, { mimeType: 'video/webm' });
            const chunks: BlobPart[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                setRecordedBlob(blob);
                setShowPreview(true);
                streamRef.current?.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

            toast.success("Neural Recording Initiated");
        } catch (err) {
            toast.error("Recording failed to initialize");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
            toast.success("Recording Finalized");
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <>
            {/* Floating Control Bar */}
            <div id="capture-hub-floating" className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
                <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-full p-2 px-4 shadow-2xl flex items-center gap-4">
                    <div className="flex items-center gap-2 pr-4 border-r border-white/10">
                        <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest min-w-[60px]">
                            {isRecording ? formatTime(recordingTime) : 'Ready'}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button 
                            onClick={takeScreenshot}
                            className="w-12 h-12 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-all"
                            title="Take Screenshot"
                        >
                            <Camera size={20}/>
                        </button>
                        
                        <button 
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${isRecording ? 'bg-rose-600 text-white animate-pulse' : 'text-white hover:bg-white/10'}`}
                            title={isRecording ? 'Stop Recording' : 'Record Screen'}
                        >
                            {isRecording ? <Square size={20} fill="currentColor"/> : <Video size={20}/>}
                        </button>

                        <button 
                            onClick={() => setUseMic(!useMic)}
                            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${useMic ? 'text-blue-400' : 'text-slate-500'}`}
                        >
                            {useMic ? <Mic size={20}/> : <MicOff size={20}/>}
                        </button>
                    </div>

                    <div className="w-px h-8 bg-white/10 mx-2"></div>

                    <div className="flex items-center gap-1">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Capture v2.4</span>
                        <Settings size={14} className="text-slate-500 hover:text-white cursor-pointer rotate-0 hover:rotate-90 transition-all"/>
                    </div>
                </div>
            </div>

            {/* Video Preview Modal */}
            {showPreview && recordedBlob && (
                <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-8 animate-fade-in">
                    <div className="bg-slate-900 border border-white/10 rounded-[48px] p-12 max-w-4xl w-full shadow-3xl">
                        <div className="flex justify-between items-center mb-8">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl">📽️</div>
                              <div>
                                 <h2 className="text-2xl font-black text-white italic">Recording Synthesis</h2>
                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Capture Optimized</p>
                              </div>
                           </div>
                           <button onClick={() => setShowPreview(false)} className="w-12 h-12 rounded-full hover:bg-white/5 flex items-center justify-center text-white transition-all"><X size={24}/></button>
                        </div>

                        <video 
                            src={URL.createObjectURL(recordedBlob)} 
                            controls 
                            className="w-full rounded-[32px] border border-white/5 shadow-2xl mb-10 overflow-hidden"
                        />

                        <div className="flex gap-4">
                            <button 
                                onClick={() => {
                                    const url = URL.createObjectURL(recordedBlob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `neural-capture-${new Date().getTime()}.webm`;
                                    a.click();
                                }}
                                className="flex-1 py-6 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                <Download size={18}/> Export Recording
                            </button>
                            <button 
                                onClick={() => { setRecordedBlob(null); setShowPreview(false); }}
                                className="px-10 py-6 bg-white/5 text-slate-400 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-rose-500/10 hover:text-rose-400 transition-all flex items-center justify-center gap-3 border border-white/5"
                            >
                                <Trash2 size={18}/> Discard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CaptureHub;
