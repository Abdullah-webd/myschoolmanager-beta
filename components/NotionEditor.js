'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered,
  Type,
  Palette,
  Download,
  Save,
  Plus,
  Trash2,
  Search,
  FileText
} from 'lucide-react';

const NotionEditor = ({ note, onSave, onDelete, className = '' }) => {
  const editorRef = useRef(null);
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(note?.updatedAt ? new Date(note.updatedAt) : null);

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title for your note');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        content,
        tags
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const downloadAsPDF = async () => {
    const jsPDF = (await import('jspdf')).default;
    const html2canvas = (await import('html2canvas')).default;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(title, 20, 30);
    
    // Add content (simplified text extraction)
    const textContent = editorRef.current.innerText;
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(textContent, 170);
    doc.text(splitText, 20, 50);
    
    doc.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
  };

  const downloadAsTXT = () => {
    const textContent = `${title}\n\n${editorRef.current.innerText}`;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toolbarButtons = [
    { command: 'bold', icon: Bold, title: 'Bold' },
    { command: 'italic', icon: Italic, title: 'Italic' },
    { command: 'underline', icon: Underline, title: 'Underline' },
    { command: 'justifyLeft', icon: AlignLeft, title: 'Align Left' },
    { command: 'justifyCenter', icon: AlignCenter, title: 'Align Center' },
    { command: 'justifyRight', icon: AlignRight, title: 'Align Right' },
    { command: 'insertUnorderedList', icon: List, title: 'Bullet List' },
    { command: 'insertOrderedList', icon: ListOrdered, title: 'Numbered List' }
  ];

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none flex-1"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={downloadAsTXT}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download as TXT"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={downloadAsPDF}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download as PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            {onDelete && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this note?')) {
                    onDelete();
                  }
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              placeholder="Add tag..."
              className="px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={addTag}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {lastSaved && (
          <p className="text-xs text-gray-500 mt-2">
            Last saved: {lastSaved.toLocaleString()}
          </p>
        )}
      </div>

      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Font Size */}
          <select
            onChange={(e) => handleCommand('fontSize', e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded mr-2"
          >
            <option value="1">Small</option>
            <option value="3" defaultValue>Normal</option>
            <option value="5">Large</option>
            <option value="7">Extra Large</option>
          </select>

          {/* Heading Buttons */}
          <button
            onClick={() => handleCommand('formatBlock', 'h1')}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          >
            H1
          </button>
          <button
            onClick={() => handleCommand('formatBlock', 'h2')}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          >
            H2
          </button>
          <button
            onClick={() => handleCommand('formatBlock', 'h3')}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          >
            H3
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* Formatting Buttons */}
          {toolbarButtons.map(({ command, icon: Icon, title }) => (
            <button
              key={command}
              type="button"
              onClick={() => handleCommand(command)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={title}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* Colors */}
          <input
            type="color"
            onChange={(e) => handleCommand('foreColor', e.target.value)}
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            title="Text Color"
          />
          <input
            type="color"
            onChange={(e) => handleCommand('backColor', e.target.value)}
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            title="Background Color"
          />
        </div>
      </div>

      {/* Editor */}
      <div className="p-8">
        <div
          ref={editorRef}
          contentEditable
          onInput={updateContent}
          className="min-h-[500px] focus:outline-none prose max-w-none"
          style={{ 
            minHeight: '500px',
            lineHeight: '1.6'
          }}
          suppressContentEditableWarning={true}
          data-placeholder="Start writing your note..."
        />
      </div>

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable] h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.8rem 0;
        }
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.6rem 0;
        }
        [contenteditable] ul, [contenteditable] ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        [contenteditable] li {
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
};

export default NotionEditor;