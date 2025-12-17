import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Download, Copy, RefreshCw, CheckCircle2, FileText } from 'lucide-react';

interface ModuleOutputProps {
  content: string;
  onReset: () => void;
}

const ModuleOutput: React.FC<ModuleOutputProps> = ({ content, onReset }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Modul Ajar Deep Learning</title>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; color: #000; }
              h1 { font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
              h2 { font-size: 18px; font-weight: bold; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; }
              h3 { font-size: 16px; font-weight: bold; margin-top: 15px; margin-bottom: 5px; }
              h4 { font-size: 14px; font-weight: bold; margin-top: 10px; }
              p, li { font-size: 12pt; margin-bottom: 4px; }
              table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              th, td { border: 1px solid #000; padding: 10px; text-align: left; vertical-align: top; }
              th { background-color: #f2f2f2; font-weight: bold; }
              ul, ol { padding-left: 20px; margin-top: 5px; margin-bottom: 5px; }
              blockquote { border-left: 3px solid #ccc; padding-left: 10px; font-style: italic; margin: 10px 0; }
              .page-break { page-break-before: always; }
              @page { margin: 2cm; }
            </style>
          </head>
          <body>
            ${document.getElementById('markdown-content')?.innerHTML || ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      // Allow time for styles to apply before printing
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleExportWord = () => {
    const element = document.getElementById('markdown-content');
    if (!element) return;

    // Clean up content specifically for Word export if needed
    // Word handles <br> well generally
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Modul Ajar</title>
        <style>
          body { font-family: 'Times New Roman', serif; }
          h1, h2, h3, h4 { color: #000000; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
          td, th { border: 1px solid #000000; padding: 8px; text-align: left; vertical-align: top; }
          th { background-color: #f2f2f2; }
          br { mso-data-placement:same-cell; } 
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Modul_Ajar_${new Date().toISOString().slice(0, 10)}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Function to process children and replace <br> string with <br /> element
  const renderWithLineBreaks = (children: React.ReactNode): React.ReactNode => {
    if (typeof children === 'string') {
      // Split by <br> or <br/> or <br /> case insensitive
      const parts = children.split(/<br\s*\/?>/gi);
      return parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && <br />}
        </React.Fragment>
      ));
    }
    
    if (Array.isArray(children)) {
      return children.map((child, index) => (
        <React.Fragment key={index}>{renderWithLineBreaks(child)}</React.Fragment>
      ));
    }
    
    // If it's an object (React Element), try to process its children prop if it exists
    if (React.isValidElement(children)) {
      const element = children as React.ReactElement<any>;
      if (element.props.children) {
        return React.cloneElement(element, {
          ...element.props,
          children: renderWithLineBreaks(element.props.children)
        });
      }
    }

    return children;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-full">
      <div className="bg-gray-800 p-4 flex justify-between items-center text-white sticky top-0 z-10 flex-wrap gap-2">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          Hasil Modul Ajar
        </h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-1 text-sm"
            title="Salin Teks"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin'}</span>
          </button>
           <button
            onClick={handleExportWord}
            className="p-2 hover:bg-blue-700 bg-blue-600 rounded-lg transition-colors flex items-center gap-1 text-sm"
            title="Download Word (.doc)"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Word</span>
          </button>
          <button
            onClick={handlePrint}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-1 text-sm"
            title="Cetak PDF via Browser"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">PDF/Cetak</span>
          </button>
          <button
            onClick={onReset}
            className="p-2 hover:bg-red-900/50 text-red-200 hover:text-red-100 rounded-lg transition-colors flex items-center gap-1 text-sm ml-2 border border-red-900/50"
          >
            <RefreshCw className="w-4 h-4" />
            Buat Baru
          </button>
        </div>
      </div>

      <div className="p-8 overflow-y-auto max-h-[800px] prose prose-blue max-w-none bg-white" id="markdown-content">
        <ReactMarkdown
           remarkPlugins={[remarkGfm]}
           components={{
            h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-blue-900 border-b-2 border-blue-100 pb-4 mb-6" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-indigo-800 mt-8 mb-4 flex items-center gap-2" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 text-gray-700" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-2 text-gray-700" {...props} />,
            li: ({node, ...props}) => <li className="pl-1" {...props} />,
            table: ({node, ...props}) => <div className="overflow-x-auto my-6"><table className="min-w-full divide-y divide-gray-200 border border-gray-300" {...props} /></div>,
            thead: ({node, ...props}) => <thead className="bg-gray-100" {...props} />,
            th: ({node, ...props}) => <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300" {...props} />,
            // Updated td renderer to handle <br>
            td: ({node, children, ...props}) => (
              <td className="px-6 py-4 whitespace-normal text-sm text-gray-600 border border-gray-300 align-top leading-relaxed" {...props}>
                {renderWithLineBreaks(children)}
              </td>
            ),
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 text-blue-800 italic rounded-r" {...props} />,
            strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ModuleOutput;