export type EnergyLevel = 'low' | 'medium' | 'high';
export type CommitmentLevel = 'none' | 'soft' | 'hard';
export type PenaltyLevel = 'low' | 'medium' | 'high';
export type Category = 'work' | 'home' | 'health' | 'people' | 'self';

export type Quadrant = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface TaskItem {
  id: string;

  title: string;
  notes?: string;

  dueDate: string;

  importance: number;
  urgencyFeeling: number;

  effortMinutes: number;

  energy: EnergyLevel;
  commitment: CommitmentLevel;
  penalty: PenaltyLevel;

  category?: Category;

  isDone: boolean;
  doneAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface RankedTask {
  task: TaskItem;
  score: number;
  quadrant: Quadrant;

  impact: number;
  deadline: number;
  aging: number;
}
