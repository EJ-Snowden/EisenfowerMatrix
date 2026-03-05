import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, OnChanges, SimpleChanges } from '@angular/core';
import {ReactiveFormsModule, Validators, FormBuilder, FormsModule} from '@angular/forms';
import {
  Category,
  CommitmentLevel,
  EnergyLevel,
  PenaltyLevel,
  TaskItem,
} from '../../../../models/task.model';

export interface CreateTaskPayload {
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
}

export interface UpdateTaskPayload {
  id: string;
  patch: Partial<TaskItem>;
}

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css',
})
export class TaskFormComponent implements OnChanges {
  @Input() editTask: TaskItem | null = null;

  @Output() createTask = new EventEmitter<CreateTaskPayload>();
  @Output() updateTask = new EventEmitter<UpdateTaskPayload>();
  @Output() cancelEdit = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  isAdvanced = false;

  readonly effortOptions = [5, 15, 30, 60, 120, 240, 480];

  readonly energyOptions: { value: EnergyLevel; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  readonly commitmentOptions: { value: CommitmentLevel; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'soft', label: 'Soft' },
    { value: 'hard', label: 'Hard' },
  ];

  readonly penaltyOptions: { value: PenaltyLevel; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  readonly categoryOptions: { value: Category; label: string }[] = [
    { value: 'work', label: 'Work' },
    { value: 'home', label: 'Home' },
    { value: 'health', label: 'Health' },
    { value: 'people', label: 'People' },
    { value: 'self', label: 'Self' },
  ];

  form = this.fb.group({
    title: this.fb.control('', [Validators.required, Validators.minLength(2)]),
    dueDate: this.fb.control(this.todayDateOnly(), [Validators.required]),

    importance: this.fb.control(50, [Validators.min(0), Validators.max(100)]),
    urgencyFeeling: this.fb.control(50, [Validators.min(0), Validators.max(100)]),

    effortMinutes: this.fb.control(30, [Validators.required]),

    energy: this.fb.control<EnergyLevel>('medium', [Validators.required]),
    commitment: this.fb.control<CommitmentLevel>('none', [Validators.required]),
    penalty: this.fb.control<PenaltyLevel>('medium', [Validators.required]),
    category: this.fb.control<Category | ''>(''),

    notes: this.fb.control(''),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editTask']) {
      const t = this.editTask;
      if (!t) return;

      this.isAdvanced = true;

      this.form.reset({
        title: t.title ?? '',
        dueDate: t.dueDate ?? this.todayDateOnly(),
        importance: t.importance ?? 50,
        urgencyFeeling: t.urgencyFeeling ?? 50,
        effortMinutes: t.effortMinutes ?? 30,
        energy: t.energy ?? 'medium',
        commitment: t.commitment ?? 'none',
        penalty: t.penalty ?? 'medium',
        category: (t.category ?? '') as any,
        notes: t.notes ?? '',
      });
    }
  }

  toggleAdvanced(): void {
    this.isAdvanced = !this.isAdvanced;
  }

  setToday(): void {
    this.form.controls.dueDate.setValue(this.todayDateOnly());
  }

  setTomorrow(): void {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    this.form.controls.dueDate.setValue(this.toDateOnlyString(d));
  }

  setEffort(minutes: number): void {
    this.form.controls.effortMinutes.setValue(minutes);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    const common: CreateTaskPayload = {
      title: (v.title ?? '').trim(),
      dueDate: v.dueDate!,
      importance: Number(v.importance ?? 0),
      urgencyFeeling: Number(v.urgencyFeeling ?? 0),
      effortMinutes: Number(v.effortMinutes ?? 30),
      energy: v.energy!,
      commitment: v.commitment!,
      penalty: v.penalty!,
      notes: (v.notes ?? '').trim() || undefined,
      category: v.category ? (v.category as Category) : undefined,
    };

    if (this.editTask) {
      this.updateTask.emit({
        id: this.editTask.id,
        patch: {
          title: common.title,
          dueDate: common.dueDate,
          importance: common.importance,
          urgencyFeeling: common.urgencyFeeling,
          effortMinutes: common.effortMinutes,
          energy: common.energy,
          commitment: common.commitment,
          penalty: common.penalty,
          category: common.category,
          notes: common.notes,
        },
      });
      return;
    }

    this.createTask.emit(common);

    this.form.reset({
      title: '',
      dueDate: this.todayDateOnly(),
      importance: 50,
      urgencyFeeling: 50,
      effortMinutes: 30,
      energy: 'medium',
      commitment: 'none',
      penalty: 'medium',
      category: '',
      notes: '',
    });
  }

  clear(): void {
    if (this.editTask) {
      this.cancelEdit.emit();
      return;
    }

    this.form.reset({
      title: '',
      dueDate: this.todayDateOnly(),
      importance: 50,
      urgencyFeeling: 50,
      effortMinutes: 30,
      energy: 'medium',
      commitment: 'none',
      penalty: 'medium',
      category: '',
      notes: '',
    });
  }

  get titleInvalid(): boolean {
    const c = this.form.controls.title;
    return c.touched && c.invalid;
  }

  private todayDateOnly(): string {
    return this.toDateOnlyString(new Date());
  }

  private toDateOnlyString(d: Date): string {
    const yyyy = String(d.getFullYear());
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
