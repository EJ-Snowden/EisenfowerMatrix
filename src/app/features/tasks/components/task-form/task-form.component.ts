import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  OnChanges,
  SimpleChanges,
  HostListener,
} from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';

import {
  Category,
  CommitmentLevel,
  EnergyLevel,
  PenaltyLevel,
  TaskItem,
} from '../../../../models/task.model';

import { TPipe } from '../../../../core/i18n/t.pipe';
import { I18nService } from '../../../../core/i18n/i18n.service';

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

type IntControlName = 'importance' | 'urgencyFeeling';
type PresetName = 'work' | 'home' | 'health';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TPipe],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css',
})
export class TaskFormComponent implements OnChanges {
  @Input() editTask: TaskItem | null = null;

  @Output() createTask = new EventEmitter<CreateTaskPayload>();
  @Output() updateTask = new EventEmitter<UpdateTaskPayload>();
  @Output() cancelEdit = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly i18n = inject(I18nService);

  isAdvanced = false;

  readonly effortOptions = [5, 15, 30, 60, 120, 240, 480];

  readonly energyOptions: EnergyLevel[] = ['low', 'medium', 'high'];
  readonly commitmentOptions: CommitmentLevel[] = ['none', 'soft', 'hard'];
  readonly penaltyOptions: PenaltyLevel[] = ['low', 'medium', 'high'];
  readonly categoryOptions: Category[] = ['work', 'home', 'health', 'people', 'self'];
  readonly presetOptions: PresetName[] = ['work', 'home', 'health'];

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
      if (!t) {
        this.resetForm();
        return;
      }

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

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const tag = target?.tagName?.toLowerCase() ?? '';

    if (event.key === 'Escape') {
      event.preventDefault();
      this.clear();
      return;
    }

    if (event.key === 'Enter' && tag !== 'textarea') {
      event.preventDefault();
      this.submit();
    }
  }

  toggleAdvanced(): void {
    this.isAdvanced = !this.isAdvanced;
  }

  applyPreset(name: PresetName): void {
    this.isAdvanced = true;

    switch (name) {
      case 'work':
        this.form.patchValue({
          category: 'work',
          effortMinutes: 60,
          energy: 'high',
          commitment: 'hard',
          penalty: 'high',
          importance: 78,
          urgencyFeeling: 70,
        });
        break;

      case 'home':
        this.form.patchValue({
          category: 'home',
          effortMinutes: 30,
          energy: 'medium',
          commitment: 'soft',
          penalty: 'medium',
          importance: 55,
          urgencyFeeling: 52,
        });
        break;

      case 'health':
        this.form.patchValue({
          category: 'health',
          effortMinutes: 30,
          energy: 'medium',
          commitment: 'hard',
          penalty: 'high',
          importance: 88,
          urgencyFeeling: 64,
        });
        break;
    }
  }

  setToday(): void {
    this.form.controls.dueDate.setValue(this.todayDateOnly());
  }

  setTomorrow(): void {
    this.setInDays(1);
  }

  setInDays(days: number): void {
    const d = new Date();
    d.setDate(d.getDate() + days);
    this.form.controls.dueDate.setValue(this.toDateOnlyString(d));
  }

  setNextWeek(): void {
    this.setInDays(7);
  }

  setNextMonth(): void {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    this.form.controls.dueDate.setValue(this.toDateOnlyString(d));
  }

  setEffort(minutes: number): void {
    this.form.controls.effortMinutes.setValue(minutes);
  }

  syncInt(controlName: IntControlName, event: Event): void {
    const el = event.target as HTMLInputElement;
    const raw = el.value;

    if (raw === '' || raw == null) return;

    const num = Math.round(Number(raw));
    const clamped = this.clampInt(Number.isFinite(num) ? num : 0, 0, 100);

    this.form.controls[controlName].setValue(clamped);
    el.value = String(clamped);
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
    this.resetForm();
  }

  clear(): void {
    if (this.editTask) {
      this.cancelEdit.emit();
      return;
    }

    this.resetForm();
  }

  close(): void {
    this.cancelEdit.emit();
  }

  get titleInvalid(): boolean {
    const c = this.form.controls.title;
    return c.touched && c.invalid;
  }

  get dueDatePreview(): string {
    const value = this.form.controls.dueDate.value;
    if (!value) return '';

    const date = this.fromDateOnlyString(value);
    return new Intl.DateTimeFormat(this.i18n.lang === 'ru' ? 'ru-RU' : 'en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  private resetForm(): void {
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

  private clampInt(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
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

  private fromDateOnlyString(value: string): Date {
    const [yyyy, mm, dd] = value.split('-').map(Number);
    return new Date(yyyy, (mm || 1) - 1, dd || 1);
  }
}
