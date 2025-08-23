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
  Palette
} from 'lucide-react';

const RichTextEditor = ({ value = '', onChange, placeholder = 'Start typing...', className = '' }) => {
  const editorRef = useRef(null);
  const [isActive, setIsActive] = useState({
    bold: false,
    italic: false,
    underline: false
  });

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    updateContent();
    updateActiveStates();
  };

  const updateContent = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const updateActiveStates = () => {
    setIsActive({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline')
    });
  };

  const handleKeyUp = () => {
    updateContent();
    updateActiveStates();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    updateContent();
  };

  const toolbarButtons = [
    { command: 'bold', icon: Bold, active: isActive.bold },
    { command: 'italic', icon: Italic, active: isActive.italic },
    { command: 'underline', icon: Underline, active: isActive.underline },
    { command: 'justifyLeft', icon: AlignLeft },
    { command: 'justifyCenter', icon: AlignCenter },
    { command: 'justifyRight', icon: AlignRight },
    { command: 'insertUnorderedList', icon: List },
    { command: 'insertOrderedList', icon: ListOrdered }
  ];

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        {/* Font Size */}
        <select
          onChange={(e) => handleCommand('fontSize', e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 rounded"
        >
          <option value="1">Small</option>
          <option value="3" selected>Normal</option>
          <option value="5">Large</option>
          <option value="7">Extra Large</option>
        </select>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Formatting Buttons */}
        {toolbarButtons.map(({ command, icon: Icon, active }) => (
          <button
            key={command}
            type="button"
            onClick={() => handleCommand(command)}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              active ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Text Color */}
        <input
          type="color"
          onChange={(e) => handleCommand('foreColor', e.target.value)}
          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          title="Text Color"
        />

        {/* Background Color */}
        <input
          type="color"
          onChange={(e) => handleCommand('backColor', e.target.value)}
          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          title="Background Color"
        />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateContent}
        onKeyUp={handleKeyUp}
        onMouseUp={updateActiveStates}
        onPaste={handlePaste}
        className="p-4 min-h-[200px] focus:outline-none"
        style={{ minHeight: '200px' }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;