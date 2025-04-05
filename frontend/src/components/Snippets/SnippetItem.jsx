import React from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Code2, Trash2, Tag, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const SnippetItem = ({ snippet, onDelete }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:shadow-sm transition-all">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[#6366F1]" />
              <h3 className="font-medium text-gray-900">{snippet.title}</h3>
            </div>
            {snippet.description && (
              <p className="text-gray-600 text-sm pl-6">{snippet.description}</p>
            )}
          </div>
          <button
            onClick={() => onDelete(snippet._id)}
            className="p-2 text-gray-600 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors"
            title="Delete snippet"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Code */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <button
              onClick={handleCopyCode}
              className="p-1 text-gray-500 hover:text-[#6366F1] rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1 text-sm"
              title="Copy code"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="relative">
            <SyntaxHighlighter
              language="javascript"
              style={docco}
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: 'white',
                fontSize: '0.875rem',
                lineHeight: '1.5',
              }}
              wrapLines={true}
              showLineNumbers={true}
              lineNumberStyle={{
                minWidth: '2.5em',
                paddingRight: '1em',
                color: '#a0aec0',
                textAlign: 'right',
                userSelect: 'none',
              }}
            >
              {snippet.code}
            </SyntaxHighlighter>
          </div>
        </div>

        {/* Tags */}
        {snippet.tags && snippet.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-gray-400" />
            {snippet.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SnippetItem;