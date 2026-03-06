import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  inject,
} from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

import { TASKS_REPOSITORY } from '../../../../core/repositories/tasks-repository.token';
import { TasksRepository } from '../../../../core/repositories/tasks-repository';
import {
  TaskItem,
  Category,
  EnergyLevel,
  CommitmentLevel,
  PenaltyLevel,
  Quadrant,
  RankedTask,
} from '../../../../models/task.model';
import { TaskFilter } from '../../models/task-filter.model';
import { TaskSort } from '../../models/task-sort.model';
import {
  CreateTaskPayload,
  TaskFormComponent,
  UpdateTaskPayload,
} from '../../components/task-form/task-form.component';
import { FiltersComponent } from '../../components/filters/filters.component';
import { MatrixComponent } from '../../components/matrix/matrix.component';
import { PriorityListComponent } from '../../components/priority-list/priority-list.component';
import { TPipe } from '../../../../core/i18n/t.pipe';
import { I18nService } from '../../../../core/i18n/i18n.service';

interface BackupFile {
  version: number;
  exportedAt: string;
  tasks: TaskItem[];
}

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [
    CommonModule,
    TPipe,
    FiltersComponent,
    MatrixComponent,
    PriorityListComponent,
    TaskFormComponent,
  ],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.css',
})
export class TasksPageComponent {
  private readonly repo = inject(TASKS_REPOSITORY) as TasksRepository;
  readonly i18n = inject(I18nService);

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  filter: TaskFilter = 'today';
  sort: TaskSort = 'priorityDesc';
  search = '';
  selectedDate = this.dateOnly(new Date());

  isFormOpen = false;
  editingId: string | null = null;
  deleteId: string | null = null;
  flashKey: string | null = null;

  private readonly filter$ = new BehaviorSubject<TaskFilter>(this.filter);
  private readonly sort$ = new BehaviorSubject<TaskSort>(this.sort);
  private readonly search$ = new BehaviorSubject<string>(this.search);
  private readonly selectedDate$ = new BehaviorSubject<string>(this.selectedDate);
  private readonly editingId$ = new BehaviorSubject<string | null>(this.editingId);
  private readonly deleteId$ = new BehaviorSubject<string | null>(this.deleteId);

  readonly tasks$ = this.repo.tasks$;

  readonly vm$ = combineLatest([
    this.tasks$,
    this.i18n.lang$,
    this.filter$,
    this.sort$,
    this.search$,
    this.selectedDate$,
    this.editingId$,
    this.deleteId$,
  ]).pipe(
    map(([tasks, _lang, filter, sort, search, selectedDate, editingId, deleteId]) => {
      const ranked = tasks.map((task) => this.rankTask(task));
      const filtered = ranked.filter(
        (x) =>
          this.matchesFilter(x.task, filter, selectedDate) &&
          this.matchesSearch(x.task, search)
      );
      const sorted = [...filtered].sort((a, b) => this.compareRanked(a, b, sort));
      const editingTask = editingId ? tasks.find((x) => x.id === editingId) ?? null : null;
      const deleteTask = deleteId ? tasks.find((x) => x.id === deleteId) ?? null : null;

      return {
        allTasks: tasks,
        items: sorted,
        editingTask,
        deleteTask,
      };
    })
  );

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event): void {
    if (this.deleteId) {
      event.preventDefault();
      this.deleteId = null;
      this.deleteId$.next(null);
      return;
    }

    if (this.isFormOpen) {
      event.preventDefault();
      this.closeForm();
    }
  }

  openCreate(): void {
    this.flashKey = null;
    this.editingId = null;
    this.editingId$.next(null);
    this.isFormOpen = true;
  }

  openEdit(id: string): void {
    this.flashKey = null;
    this.editingId = id;
    this.editingId$.next(id);
    this.isFormOpen = true;
  }

  closeForm(): void {
    this.isFormOpen = false;
    this.editingId = null;
    this.editingId$.next(null);
  }

  requestDelete(id: string): void {
    this.deleteId = id;
    this.deleteId$.next(id);
  }

  confirmDelete(): void {
    if (!this.deleteId) return;
    this.repo.delete(this.deleteId);
    this.deleteId = null;
    this.deleteId$.next(null);
  }

  toggleDone(taskId: string, tasks: TaskItem[]): void {
    const task = tasks.find((x) => x.id === taskId);
    if (!task) return;
    this.repo.setDone(taskId, !task.isDone);
  }

  createTask(payload: CreateTaskPayload): void {
    const now = new Date().toISOString();
    const task: TaskItem = {
      id: this.makeId(),
      title: payload.title,
      notes: payload.notes,
      dueDate: payload.dueDate,
      importance: payload.importance,
      urgencyFeeling: payload.urgencyFeeling,
      effortMinutes: payload.effortMinutes,
      energy: payload.energy,
      commitment: payload.commitment,
      penalty: payload.penalty,
      category: payload.category,
      isDone: false,
      doneAt: undefined,
      createdAt: now,
      updatedAt: now,
    };

    this.repo.add(task);
    this.closeForm();
  }

  updateTask(payload: UpdateTaskPayload): void {
    this.repo.update(payload.id, payload.patch);
    this.closeForm();
  }

  setFilter(filter: TaskFilter): void {
    this.filter = filter;
    this.filter$.next(filter);
  }

  setSort(sort: TaskSort): void {
    this.sort = sort;
    this.sort$.next(sort);
  }

  setSearch(search: string): void {
    this.search = search;
    this.search$.next(search);
  }

  setSelectedDate(date: string): void {
    this.selectedDate = date || this.selectedDate;
    this.selectedDate$.next(this.selectedDate);

    if (date) {
      this.filter = 'date';
      this.filter$.next('date');
    }
  }

  exportJson(tasks: TaskItem[]): void {
    const payload: BackupFile = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks: [...tasks].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

    a.href = url;
    a.download = `${this.i18n.t('backup.export.filename')}-${stamp}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  triggerImport(): void {
    this.fileInput?.nativeElement.click();
  }

  async onImportFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) return;

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as Partial<BackupFile> | TaskItem[];
      const tasks = this.extractTasksFromBackup(parsed);
      await this.repo.upsertMany(tasks);
      this.flashKey = 'tasks.import.success';
    } catch (e) {
      console.error(e);
      this.flashKey = 'tasks.import.error';
    }
  }

  private extractTasksFromBackup(source: Partial<BackupFile> | TaskItem[]): TaskItem[] {
    if (Array.isArray(source)) {
      return source
        .map((x) => this.normalizeImportedTask(x))
        .filter((x): x is TaskItem => !!x);
    }

    if (source.version !== 1 || !Array.isArray(source.tasks)) {
      throw new Error(this.i18n.t('backup.invalid'));
    }

    return source.tasks
      .map((x) => this.normalizeImportedTask(x))
      .filter((x): x is TaskItem => !!x);
  }

  private normalizeImportedTask(input: Partial<TaskItem> | null | undefined): TaskItem | null {
    if (!input) return null;

    const title = String(input.title ?? '').trim();
    const dueDate = this.normalizeDateOnly(String(input.dueDate ?? ''));
    if (title.length < 2 || !dueDate) return null;

    const createdAt = this.normalizeIso(input.createdAt) ?? new Date().toISOString();
    const updatedAt = this.normalizeIso(input.updatedAt) ?? createdAt;
    const isDone = !!input.isDone;
    const doneAt = isDone ? this.normalizeIso(input.doneAt) ?? updatedAt : undefined;

    return {
      id: String(input.id ?? this.makeId()),
      title,
      notes: String(input.notes ?? '').trim() || undefined,
      dueDate,
      importance: this.clamp(Number(input.importance ?? 50), 0, 100),
      urgencyFeeling: this.clamp(Number(input.urgencyFeeling ?? 50), 0, 100),
      effortMinutes: Math.max(1, Math.round(Number(input.effortMinutes ?? 30))),
      energy: this.oneOf<EnergyLevel>(input.energy, ['low', 'medium', 'high'], 'medium'),
      commitment: this.oneOf<CommitmentLevel>(input.commitment, ['none', 'soft', 'hard'], 'none'),
      penalty: this.oneOf<PenaltyLevel>(input.penalty, ['low', 'medium', 'high'], 'medium'),
      category: this.oneOf<Category | undefined>(
        input.category,
        ['work', 'home', 'health', 'people', 'self'],
        undefined
      ),
      isDone,
      doneAt,
      createdAt,
      updatedAt,
    };
  }

  private rankTask(task: TaskItem): RankedTask {
    const impact = this.scoreImpact(task);
    const deadline = this.scoreDeadline(task);
    const aging = this.scoreAging(task);

    const score =
      impact * 0.42 +
      deadline * 0.33 +
      aging * 0.07 +
      task.importance * 0.12 +
      task.urgencyFeeling * 0.06;

    return {
      task,
      score: Math.round(score),
      quadrant: this.getQuadrant(task.importance, task.urgencyFeeling),
      impact,
      deadline,
      aging,
    };
  }

  private scoreImpact(task: TaskItem): number {
    const energyMap: Record<EnergyLevel, number> = { low: 6, medium: 3, high: 0 };
    const commitmentMap: Record<CommitmentLevel, number> = { none: 0, soft: 6, hard: 12 };
    const penaltyMap: Record<PenaltyLevel, number> = { low: 4, medium: 10, high: 18 };
    const categoryMap: Partial<Record<Category, number>> = {
      work: 10,
      health: 11,
      home: 6,
      people: 7,
      self: 5,
    };

    const effortPenalty = Math.min(18, Math.round(task.effortMinutes / 18));

    return this.clamp(
      task.importance +
      commitmentMap[task.commitment] +
      penaltyMap[task.penalty] +
      (task.category ? categoryMap[task.category] ?? 0 : 0) -
      effortPenalty -
      energyMap[task.energy],
      0,
      100
    );
  }

  private scoreDeadline(task: TaskItem): number {
    const today = this.startOfToday();
    const due = this.fromDateOnly(task.dueDate);
    const diffDays = Math.floor((due.getTime() - today.getTime()) / 86400000);

    if (diffDays < 0) return 100;
    if (diffDays === 0) return 96;
    if (diffDays === 1) return 86;
    if (diffDays <= 3) return 72;
    if (diffDays <= 7) return 58;
    if (diffDays <= 14) return 42;
    if (diffDays <= 30) return 26;
    return 14;
  }

  private scoreAging(task: TaskItem): number {
    const created = new Date(task.createdAt);
    const days = Math.max(0, Math.floor((Date.now() - created.getTime()) / 86400000));
    return this.clamp(days * 2, 0, 30);
  }

  private getQuadrant(importance: number, urgency: number): Quadrant {
    if (urgency >= 50 && importance >= 50) return 'Q1';
    if (urgency < 50 && importance >= 50) return 'Q2';
    if (urgency >= 50 && importance < 50) return 'Q3';
    return 'Q4';
  }

  private matchesFilter(task: TaskItem, filter: TaskFilter, selectedDate: string): boolean {
    const today = this.startOfToday();
    const todayStr = this.dateOnly(today);
    const tomorrowStr = this.dateOnly(this.addDays(today, 1));
    const due = task.dueDate;

    if (filter === 'done') return task.isDone;
    if (task.isDone) return false;

    switch (filter) {
      case 'today':
        return due === todayStr;
      case 'tomorrow':
        return due === tomorrowStr;
      case 'week': {
        const dueDate = this.fromDateOnly(due);
        const weekEnd = this.addDays(today, 6);
        return dueDate >= today && dueDate <= weekEnd;
      }
      case 'overdue':
        return due < todayStr;
      case 'date':
        return due === selectedDate;
      case 'all':
      default:
        return true;
    }
  }

  private matchesSearch(task: TaskItem, search: string): boolean {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    const hay = `${task.title} ${task.notes ?? ''}`.toLowerCase();
    return hay.includes(query);
  }

  private compareRanked(a: RankedTask, b: RankedTask, sort: TaskSort): number {
    switch (sort) {
      case 'dueDateAsc':
        return a.task.dueDate.localeCompare(b.task.dueDate) || b.score - a.score;
      case 'dueDateDesc':
        return b.task.dueDate.localeCompare(a.task.dueDate) || b.score - a.score;
      case 'createdAtDesc':
        return b.task.createdAt.localeCompare(a.task.createdAt) || b.score - a.score;
      case 'updatedAtDesc':
        return b.task.updatedAt.localeCompare(a.task.updatedAt) || b.score - a.score;
      case 'doneAtDesc':
        return (b.task.doneAt ?? '').localeCompare(a.task.doneAt ?? '') || b.score - a.score;
      case 'doneAtAsc':
        return (a.task.doneAt ?? '').localeCompare(b.task.doneAt ?? '') || b.score - a.score;
      case 'titleAsc':
        return a.task.title.localeCompare(b.task.title, this.i18n.lang) || b.score - a.score;
      case 'priorityDesc':
      default:
        return b.score - a.score || a.task.dueDate.localeCompare(b.task.dueDate);
    }
  }

  private normalizeDateOnly(value: string): string | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    return value;
  }

  private normalizeIso(value: unknown): string | undefined {
    if (!value) return undefined;
    const d = new Date(String(value));
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  private dateOnly(d: Date): string {
    const yyyy = String(d.getFullYear());
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private fromDateOnly(value: string): Date {
    const [yyyy, mm, dd] = value.split('-').map(Number);
    return new Date(yyyy, (mm || 1) - 1, dd || 1);
  }

  private startOfToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  private addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  private clamp(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) return min;
    return Math.max(min, Math.min(max, Math.round(value)));
  }

  private oneOf<T>(value: unknown, allowed: readonly T[], fallback: T): T {
    return allowed.includes(value as T) ? (value as T) : fallback;
  }

  private makeId(): string {
    const random = globalThis.crypto?.randomUUID?.();
    if (random) return random;
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
