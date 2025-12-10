import React from 'react';
import { TemplateOption } from '../types';

interface TemplateSelectorProps {
  onSelect: (id: number) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect }) => {
  const templates: TemplateOption[] = [
    { id: 1, name: "Modern Blue", description: "Чист дизајн, сини заглавија, странична лента.", icon: "fa-file-lines" },
    { id: 2, name: "Classic Minimalist", description: "Црно-бело, serif фонт, многу формално.", icon: "fa-align-left" },
    { id: 3, name: "Creative", description: "Бои, уникатен распоред, за дизајнери.", icon: "fa-palette" },
    { id: 4, name: "Tech/Code", description: "Моноспејс фонт, 'dark mode' стил.", icon: "fa-code" },
    { id: 5, name: "Executive", description: "Елегантно, центрирано, многу празен простор.", icon: "fa-user-tie" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 w-full max-w-xl">
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className="flex items-start p-3 bg-white border border-gray-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left shadow-sm group"
        >
          <div className="bg-gray-100 p-2 rounded-md group-hover:bg-emerald-200 transition-colors mr-3">
             <i className={`fa-solid ${t.icon} text-gray-600 group-hover:text-emerald-800`}></i>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 text-sm group-hover:text-emerald-900">{t.id}. {t.name}</h4>
            <p className="text-xs text-gray-500 mt-1">{t.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
};