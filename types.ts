export interface ModuleInputData {
  schoolName: string;
  teacherName: string;
  teacherNip: string;
  principalName: string;
  principalNip: string;
  subject: string;
  phaseClass: string;
  topic: string;
  meetings: number;
  duration: number;
  studentCharacteristics: string;
  graduateProfileDimensions: string[];
  priorKnowledge: string;
  learningOutcomes: string; // Capaian Pembelajaran (CP)
  learningObjectives: string; // Tujuan Pembelajaran (TP)
  pedagogicalPractice: string;
  teacherNotes: string;
  learningPartnership: string;
  learningEnvironment: string;
  digitalUtilization: string;
}

export interface GeneratedModuleResponse {
  markdown: string;
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}