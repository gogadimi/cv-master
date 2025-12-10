import React from 'react';

interface CVPreviewModalProps {
  htmlContent: string;
  onClose: () => void;
}

export const CVPreviewModal: React.FC<CVPreviewModalProps> = ({ htmlContent, onClose }) => {
  const handlePrint = () => {
    // Create a hidden iframe to handle the printing of just the CV content
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(htmlContent);
      frameDoc.close();
      
      // Wait for images/styles to load then print
      printFrame.contentWindow?.focus();
      setTimeout(() => {
        printFrame.contentWindow?.print();
        // Cleanup after print dialog closes (or after a delay)
        setTimeout(() => document.body.removeChild(printFrame), 2000);
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full h-full md:w-[210mm] md:h-[95vh] md:rounded-xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Toolbar */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-white z-10 shadow-sm">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <i className="fa-solid fa-file-pdf text-red-500"></i>
            <span>Преглед на CV</span>
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <i className="fa-solid fa-print"></i>
              <span className="hidden sm:inline">Печати / PDF</span>
            </button>
            <button 
              onClick={onClose} 
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm transition-colors"
              title="Затвори"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-gray-500/10 overflow-auto p-0 md:p-6 flex justify-center">
            {/* Using 210mm width to simulate A4 paper on desktop */}
             <iframe 
                title="CV Preview"
                srcDoc={htmlContent}
                className="w-full md:w-[210mm] min-h-[297mm] h-full bg-white shadow-lg md:ring-1 md:ring-gray-200"
                style={{ border: 'none' }}
             />
        </div>
      </div>
    </div>
  );
};