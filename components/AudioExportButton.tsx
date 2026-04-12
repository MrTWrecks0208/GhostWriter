import React, { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { Download } from 'lucide-react';

interface AudioExportButtonProps {
  audioData: string;
  fileName: string;
}

const FORMATS = ['WAV', 'AIFF', 'FLAC', 'MP3', 'AAC', 'OGG'];

export const AudioExportButton: React.FC<AudioExportButtonProps> = ({ audioData, fileName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const ffmpegRef = useRef(new FFmpeg());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: string) => {
    setIsOpen(false);
    setIsExporting(true);
    setProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;
      
      // Load ffmpeg if not loaded
      if (!ffmpeg.loaded) {
        await ffmpeg.load({
          coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.js',
          wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.wasm',
        });
      }

      ffmpeg.on('progress', ({ progress }) => {
        setProgress(Math.round(progress * 100));
      });

      // Write input file
      const inputName = 'input.webm'; // WebM or WAV is typical for MediaRecorder / Lyria
      await ffmpeg.writeFile(inputName, await fetchFile(audioData));

      // Determine output extension
      const ext = format.toLowerCase();
      const outputName = `output.${ext}`;
      
      // Run conversion
      await ffmpeg.exec(['-i', inputName, outputName]);

      // Read result
      const data = await ffmpeg.readFile(outputName);
      
      // Create download link
      const blob = new Blob([(data as Uint8Array).buffer], { type: `audio/${ext}` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      // Fallback if FFmpeg fails or user cancels
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="p-2 text-white-600 hover:text-pink-500 transition-colors flex items-center gap-1"
        title="Export recording"
      >
        <Download className="w-5 h-5" />
        {isExporting && <span className="text-[10px]">{progress}%</span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-[#1d2951] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="py-1">
            {FORMATS.map(format => (
              <button
                key={format}
                onClick={() => handleExport(format)}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                {format}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
