import React from 'react';

export interface TranslationDisplayProps {
  /** Header text, e.g. "EN Summary" or "UR Translation" */
  label: string;
  /** The text body to display */
  content: string;
  /** If true, applies RTL direction and styling */
  isRTL?: boolean;
}

export default function TranslationDisplay({
  label,
  content,
  isRTL = false,
}: TranslationDisplayProps) {
  return (
    <div className="w-full mt-4 p-4 border border-gray-200 bg-gray-50 rounded-lg">
      <h4 className="text-pink-500 font-semibold mb-2">{label}</h4>
      <p
  className={`text-gray-700 text-sm leading-relaxed break-words text-wrap ${
    isRTL ? 'text-right rtl' : 'text-left'
  }`}
  dir={isRTL ? 'rtl' : 'ltr'}
>
        {content}
      </p>
    </div>
  );
}
