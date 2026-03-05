export type EnergyLevel = 'low' | 'medium' | 'high';
export type CommitmentLevel = 'none' | 'soft' | 'hard';
export type PenaltyLevel = 'low' | 'medium' | 'high';
export type Category = 'work' | 'home' | 'health' | 'people' | 'self';

export type Quadrant = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface TaskItem {
  id: string;

  title: string;
  notes?: string;

  // Date only in format YYYY-MM-DD
  dueDate: string;

  // 0..100
  importance: number;

  // 0..100 (feeling)
  urgencyFeeling: number;

  // one of: 5,15,30,60,120,240,480
  effortMinutes: number;

  energy: EnergyLevel;
  commitment: CommitmentLevel;
  penalty: PenaltyLevel;

  category?: Category;

  isDone: boolean;

  // ISO datetime strings
  createdAt: string;
  updatedAt: string;
}

export interface RankedTask {
  task: TaskItem;
  score: number; // 0..100
  quadrant: Quadrant;

  // debug values (полезно видеть в UI)
  impact: number;
  deadline: number;
  aging: number;
}
