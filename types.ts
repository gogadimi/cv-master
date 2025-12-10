export enum MessageRole {
  User = 'user',
  System = 'system',
  Assistant = 'model'
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isThinking?: boolean;
}

export interface CVData {
  contactInfo?: string;
  targetRole?: string;
  experience?: string;
  education?: string;
  skills?: string;
  photoUrl?: string;
  templateChoice?: string;
}

export enum CVStep {
  Introduction = 0,
  Contact = 1,
  Role = 2,
  Experience = 3,
  Education = 4,
  Skills = 5,
  Photo = 6,
  Template = 7,
  Generating = 8,
  Completed = 9
}

export interface TemplateOption {
  id: number;
  name: string;
  description: string;
  icon: string;
}