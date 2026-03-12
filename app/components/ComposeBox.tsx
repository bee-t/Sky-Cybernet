'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageIcon, VideoIcon, X, Loader2 } from 'lucide-react';
import { compressImage, formatFileSize, validateFile } from '../lib/clientCompression';

type MediaPreview = {
  file: File;
  url: string;
  type: 'image' | 'video';
  originalSize?: number;
  compressedSize?: number;
};

export default function ComposeBox({ onSuccess, hideHeader }: { onSuccess?: () => void; hideHeader?: boolean } = {}) {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsCompressing(true);
    const newPreviews: MediaPreview[] = [];

    try {
      for (const file of files) {
        // Validate file
        const validation = validateFile(file, {
          maxSizeMB: 50, // 50MB max before compression
          allowedTypes: ['image/*', 'video/*'],
        });

        if (!validation.valid) {
          alert(validation.error);
          continue;
        }

        const originalSize = file.size;
        let processedFile = file;

        // Compress images on client-side before upload
        if (file.type.startsWith('image/')) {
          try {
            processedFile = await compressImage(file, {
              maxWidth: 2048,
              maxHeight: 2048,
              quality: 0.85,
              maxSizeMB: 10,
            });
          } catch (error) {
            console.error('Compression failed, using original:', error);
          }
        }

        newPreviews.push({
          file: processedFile,
          url: URL.createObjectURL(processedFile),
          type: file.type.startsWith('video/') ? 'video' : 'image',
          originalSize,
          compressedSize: processedFile.size,
        });
      }

      setMediaFiles(prev => [...prev, ...newPreviews].slice(0, 4)); // Max 4 files
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].url);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) return;

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('content', content);
    
    mediaFiles.forEach(media => {
      formData.append('media', media.file);
    });

    const { createPost } = await import('../actions');
    const result = await createPost(formData);
    
    if (result.success) {
      setContent('');
      mediaFiles.forEach(media => URL.revokeObjectURL(media.url));
      setMediaFiles([]);
      router.refresh();
      onSuccess?.();
    } else {
      console.error('Failed to create post:', result.error);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="border-2 border-[#00ff41]/40 bg-black/70 backdrop-blur-sm rounded overflow-hidden shadow-lg shadow-[#00ff41]/10">
      {/* Terminal Header */}
      {!hideHeader && (
        <div className="bg-[#00ff41]/10 border-b border-[#00ff41]/40 px-2 sm:px-4 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#00ff41] animate-pulse flex-shrink-0"></div>
            <span className="text-[#00ff41] font-mono text-xs sm:text-sm font-bold tracking-wide sm:tracking-wider truncate">▸ NEW TRANSMISSION</span>
          </div>
          <span className="text-[#00ff41]/60 font-mono text-[10px] sm:text-xs whitespace-nowrap flex-shrink-0">PRIORITY: STANDARD</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
          {/* Terminal-style input */}
          <div className="flex gap-1.5 sm:gap-2">
            <span className="text-[#00ff41] font-mono text-xs sm:text-sm flex-shrink-0 mt-1">&gt;</span>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter transmission content..."
              className="w-full resize-none overflow-hidden bg-transparent border-none text-xs sm:text-sm leading-relaxed outline-none placeholder:text-[#00ff41]/40 text-[#00ff41] font-mono"
              rows={1}
              style={{ minHeight: '24px' }}
              disabled={isSubmitting}
            />
          </div>
          
          {/* Media preview grid */}
          {mediaFiles.length > 0 && (
            <div className={`grid gap-2 rounded-2xl overflow-hidden ${
              mediaFiles.length === 1 ? 'grid-cols-1' : 
              mediaFiles.length === 2 ? 'grid-cols-2' : 
              'grid-cols-2'
            }`}>
              {mediaFiles.map((media, index) => (
                <div key={index} className="relative group aspect-video bg-black rounded overflow-hidden border border-[#00ff41]/20">
                  {media.type === 'image' ? (
                    <img 
                      src={media.url} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video 
                      src={media.url} 
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute top-2 right-2 w-7 h-7 rounded bg-red-500/90 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[#00ff41]/20 gap-2">
            <div className="flex gap-1 sm:gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={mediaFiles.length >= 4 || isSubmitting}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={mediaFiles.length >= 4 || isSubmitting}
                className="px-2 sm:px-3 py-1 sm:py-1.5 rounded border border-[#00ff41]/40 hover:border-[#00ff41] bg-[#00ff41]/5 hover:bg-[#00ff41]/10 text-[#00ff41]/70 hover:text-[#00ff41] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-[10px] sm:text-xs flex items-center gap-1 sm:gap-1.5"
                title="Attach media files"
              >
                <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">ATTACH</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (!content.trim() && mediaFiles.length === 0)}
              className="px-3 sm:px-6 py-1.5 sm:py-2 bg-[#00ff41]/10 border-2 border-[#00ff41] text-[#00ff41] rounded font-mono text-[10px] sm:text-xs tracking-wide sm:tracking-widest hover:bg-[#00ff41]/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#00ff41]/10 disabled:hover:text-[#00ff41] font-bold military-glow"
            >
              {isSubmitting ? '◢ TRANSMITTING ◣' : '◢ TRANSMIT ◣'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
