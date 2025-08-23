'use client';

import { useState, useRef } from 'react';
import { Upload, X, File, Image, Video, FileText, ExternalLink } from 'lucide-react';

const FileUploader = ({ onFilesChange, acceptedTypes = '*', maxFiles = 10, maxSize = 100 }) => {
  const [files, setFiles] = useState([]);
  const [youtubeLinks, setYoutubeLinks] = useState(['']);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (newFiles) => {
    const validFiles = Array.from(newFiles).filter(file => {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`);
        return false;
      }
      return true;
    });

    const updatedFiles = [...files, ...validFiles].slice(0, maxFiles);
    setFiles(updatedFiles);
    
    if (onFilesChange) {
      onFilesChange({
        files: updatedFiles,
        youtubeLinks: youtubeLinks.filter(link => link.trim())
      });
    }
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    
    if (onFilesChange) {
      onFilesChange({
        files: updatedFiles,
        youtubeLinks: youtubeLinks.filter(link => link.trim())
      });
    }
  };

  const handleYoutubeLinkChange = (index, value) => {
    const updatedLinks = [...youtubeLinks];
    updatedLinks[index] = value;
    
    // Add new empty field if this is the last one and it's not empty
    if (index === youtubeLinks.length - 1 && value.trim()) {
      updatedLinks.push('');
    }
    
    setYoutubeLinks(updatedLinks);
    
    if (onFilesChange) {
      onFilesChange({
        files,
        youtubeLinks: updatedLinks.filter(link => link.trim())
      });
    }
  };

  const removeYoutubeLink = (index) => {
    const updatedLinks = youtubeLinks.filter((_, i) => i !== index);
    if (updatedLinks.length === 0) {
      updatedLinks.push('');
    }
    setYoutubeLinks(updatedLinks);
    
    if (onFilesChange) {
      onFilesChange({
        files,
        youtubeLinks: updatedLinks.filter(link => link.trim())
      });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    if (file.type.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
    if (file.type === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Files (Images, Videos, PDFs, Documents)
        </label>
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes}
            onChange={(e) => handleFiles(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-sm text-gray-500">
            Maximum {maxFiles} files, up to {maxSize}MB each
          </p>
        </div>

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getFileIcon(file)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* YouTube Links */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          YouTube Video Links
        </label>
        <div className="space-y-3">
          {youtubeLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <ExternalLink className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="url"
                  value={link}
                  onChange={(e) => handleYoutubeLinkChange(index, e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {youtubeLinks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeYoutubeLink(index)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;