import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from './components/ChatMessage';
import { TemplateSelector } from './components/TemplateSelector';
import { CVPreviewModal } from './components/CVPreviewModal';
import { generateCVHtml } from './services/geminiService';
import { Message, MessageRole, CVStep, CVData } from './types';

const INITIAL_MESSAGE: Message = {
  id: 'init-1',
  role: MessageRole.Assistant,
  content: `Здраво! Јас сум **CV Master**. Ќе ти помогнам да креираш професионално CV.

Процесот е краток и се состои од **7 прашања**.

Дали си подготвен/а да започнеме?`,
  timestamp: new Date()
};

function App() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [currentStep, setCurrentStep] = useState<CVStep>(CVStep.Introduction);
  const [cvData, setCvData] = useState<CVData>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on step change (unless it's template selection or completed)
  useEffect(() => {
    if (currentStep !== CVStep.Template && currentStep !== CVStep.Completed && !isProcessing) {
      inputRef.current?.focus();
    }
  }, [messages, currentStep, isProcessing]);

  const addMessage = (role: MessageRole, content: string, isThinking = false) => {
    const newMessage: Message = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date(),
      isThinking
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const handleStepLogic = async (userResponse: string) => {
    // 1. Store User Response for current step
    const updatedData = { ...cvData };
    
    switch (currentStep) {
      case CVStep.Introduction:
        // Transition from Intro to Contact
        break;
      case CVStep.Contact:
        updatedData.contactInfo = userResponse;
        break;
      case CVStep.Role:
        updatedData.targetRole = userResponse;
        break;
      case CVStep.Experience:
        updatedData.experience = userResponse;
        break;
      case CVStep.Education:
        updatedData.education = userResponse;
        break;
      case CVStep.Skills:
        updatedData.skills = userResponse;
        break;
      case CVStep.Photo:
        updatedData.photoUrl = userResponse.trim().toUpperCase() === 'SKIP' 
          ? 'https://via.placeholder.com/150' 
          : userResponse;
        break;
      case CVStep.Template:
        const num = parseInt(userResponse);
        if (num >= 1 && num <= 5) {
             updatedData.templateChoice = userResponse;
        } else {
             addMessage(MessageRole.Assistant, "Ве молам изберете број од 1 до 5 од опциите погоре.");
             return; 
        }
        break;
    }

    setCvData(updatedData);

    // 2. Advance Step and Ask Next Question
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);

    // Small artificial delay for natural feel
    setIsProcessing(true);
    setTimeout(async () => {
      setIsProcessing(false);
      
      switch (nextStep) {
        case CVStep.Contact:
          addMessage(MessageRole.Assistant, "**Чекор 1: Контакт.**\n\nВе молам напишете го вашето: **Име и Презиме, Телефон, Е-mail, Град/Држава** и опционално LinkedIn линк.");
          break;
        case CVStep.Role:
          addMessage(MessageRole.Assistant, "**Чекор 2: Целна Позиција.**\n\nЗа која специфична работна позиција аплицирате?");
          break;
        case CVStep.Experience:
          addMessage(MessageRole.Assistant, "**Чекор 3: Искуство.** (Најважниот дел)\n\nНаведете ги последните 2-3 работни искуства.\n\n*Формат:* Име на компанија, Позиција, Години.\n*Важно:* Наведете по 1 клучно достигнување за секоја позиција.");
          break;
        case CVStep.Education:
          addMessage(MessageRole.Assistant, "**Чекор 4: Образование.**\n\nКој е вашиот највисок степен на образование, име на факултет/училиште и година на дипломирање?");
          break;
        case CVStep.Skills:
          addMessage(MessageRole.Assistant, "**Чекор 5: Вештини.**\n\nНабројте 5 клучни **технички вештини** (алатки, јазици) и 3 **меки вештини** (soft skills).");
          break;
        case CVStep.Photo:
          addMessage(MessageRole.Assistant, "**Чекор 6: Фотографија.**\n\nВе молам залепете URL линк до вашата фотографија.\n\nАко немате, напишете **SKIP** и јас ќе ставам привремена слика.");
          break;
        case CVStep.Template:
          addMessage(MessageRole.Assistant, "**Чекор 7: Избор на Шаблон.**\n\nВе молам одберете еден од стиловите подолу:");
          // UI will show buttons via TemplateSelector check in render
          break;
        case CVStep.Generating:
           // Logic handled in handleTemplateSelect
          break;
      }
    }, 600);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const text = inputValue;
    setInputValue('');
    addMessage(MessageRole.User, text);

    handleStepLogic(text);
  };

  const handleTemplateSelect = async (id: number) => {
    if (currentStep !== CVStep.Template) return;

    const updatedData = { ...cvData, templateChoice: id.toString() };
    setCvData(updatedData);
    
    // Add User selection bubble
    addMessage(MessageRole.User, `Избрав опција бр. ${id}`);

    // Move to generation
    setCurrentStep(CVStep.Generating);
    setIsProcessing(true);
    
    const loadingMsg = addMessage(MessageRole.Assistant, "", true); // Thinking bubble

    try {
      const htmlCode = await generateCVHtml(updatedData);
      
      // Remove thinking bubble
      setMessages(prev => prev.filter(m => m.id !== loadingMsg.id));
      setIsProcessing(false);
      setGeneratedHtml(htmlCode);

      // Final success message
      addMessage(MessageRole.Assistant, `Готово! Твоето CV е подготвено.\n\nКликни на копчето "Отвори Преглед" подолу за да го видиш и зачуваш.`);
      
      setCurrentStep(CVStep.Completed);
      setShowPreview(true); // Automatically open preview on success
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== loadingMsg.id));
      setIsProcessing(false);
      addMessage(MessageRole.Assistant, "Се појави грешка при генерирањето. Ве молам обидете се повторно со освежување на страницата.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 relative">
      {/* Modal Overlay */}
      {showPreview && generatedHtml && (
        <CVPreviewModal 
          htmlContent={generatedHtml} 
          onClose={() => setShowPreview(false)} 
        />
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg text-white">
            <i className="fa-solid fa-file-contract text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">CV Master</h1>
            <p className="text-xs text-gray-500 font-medium">AI Resume Builder (Macedonian)</p>
          </div>
        </div>
        <div className="hidden md:block">
             <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
               Gemini 3 Pro Powered
             </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
        <div className="max-w-3xl mx-auto flex flex-col">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          
          {/* Template Selector triggers when on Template step */}
          {currentStep === CVStep.Template && !isProcessing && (
            <div className="flex justify-start w-full mb-4 pl-2 md:pl-12">
               <TemplateSelector onSelect={handleTemplateSelect} />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto relative">
          {currentStep === CVStep.Completed ? (
            <div className="flex gap-3">
              <button 
                onClick={() => setShowPreview(true)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-3 font-semibold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-eye"></i>
                <span>Отвори Преглед / Зачувај PDF</span>
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-6 py-3 font-semibold transition-all shadow-sm"
              >
                <i className="fa-solid fa-rotate-right mr-2"></i> Ново CV
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Внеси го твојот одговор..."
                    disabled={isProcessing || currentStep === CVStep.Template}
                    className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isProcessing || currentStep === CVStep.Template}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl px-6 py-3 font-semibold transition-all shadow-sm flex items-center gap-2"
                >
                  <span>Испрати</span>
                  <i className="fa-solid fa-paper-plane text-sm"></i>
                </button>
              </form>
              <div className="text-center mt-2">
                <p className="text-[10px] text-gray-400">
                  Чекор {Math.min(currentStep, 7)} од 7 &bull; Powered by Google Gemini
                </p>
              </div>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}

export default App;