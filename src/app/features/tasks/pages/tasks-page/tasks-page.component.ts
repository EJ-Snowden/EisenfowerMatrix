import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, map, shareReplay, take } from 'rxjs';

import { RankedTask, TaskItem } from '../../../../models/task.model';
import { PriorityService } from '../../services/priority.service';

import { TASKS_REPOSITORY } from '../../../../core/repositories/tasks-repository.token';
import { TasksRepository } from '../../../../core/repositories/tasks-repository';

import { TaskFormComponent, CreateTaskPayload, UpdateTaskPayload } from '../../components/task-form/task-form.component';
import { FiltersComponent } from '../../components/filters/filters.component';
import { MatrixComponent } from '../../components/matrix/matrix.component';
import { PriorityListComponent } from '../../components/priority-list/priority-list.component';

import { TaskFilter } from '../../models/task-filter.model';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [CommonModule, TaskFormComponent, FiltersComponent, MatrixComponent, PriorityListComponent],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.css',
})
export class TasksPageComponent {
  private readonly repo: TasksRepository = inject(TASKS_REPOSITORY);
  private readonly priority = inject(PriorityService);

  activeFilter: TaskFilter = 'today';
  private readonly activeFilter$ = new BehaviorSubject<TaskFilter>(this.activeFilter);

  private readonly editingId$ = new BehaviorSubject<string | null>(null);

  readonly tasks$ = this.repo.tasks$.pipe(shareReplay({ bufferSize: 1, refCount: true }));

  readonly ranked$ = combineLatest([this.tasks$, this.activeFilter$]).pipe(
    map(([tasks, filter]) => this.priority.toRanked(this.applyFilter(tasks, filter)))
  );

  readonly editingTask$ = combineLatest([this.tasks$, this.editingId$]).pipe(
    map(([tasks, id]) => (id ? tasks.find((t) => t.id === id) ?? null : null))
  );

  onCreateTask(payload: CreateTaskPayload): void {
    const nowIso = new Date().toISOString();

    const task: TaskItem = {
      id: this.newId(),
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
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    this.repo.add(task);
  }

  onUpdateTask(p: UpdateTaskPayload): void {
    this.repo.update(p.id, p.patch);
    this.closeEdit();
  }

  onFilterChange(f: TaskFilter): void {
    this.activeFilter = f;
    this.activeFilter$.next(f);
  }

  onToggleDone(id: string): void {
    this.tasks$.pipe(take(1)).subscribe((tasks) => {
      const t = tasks.find((x) => x.id === id);
      if (t) this.repo.setDone(id, !t.isDone);
    });
  }

  onDeleteTask(id: string): void {
    this.repo.delete(id);
    if (this.editingId$.value === id) this.closeEdit();
  }

  startEdit(id: string): void {
    this.editingId$.next(id);
  }

  closeEdit(): void {
    this.editingId$.next(null);
  }

  private applyFilter(all: TaskItem[], filter: TaskFilter): TaskItem[] {
    const today = this.dateOnly(new Date());
    const todayStr = this.toDateOnlyString(today);

    const tomorrow = this.addDays(today, 1);
    const tomorrowStr = this.toDateOnlyString(tomorrow);

    const weekEnd = this.addDays(today, 7);

    const isDateInRange = (dateStr: string, from: Date, to: Date): boolean => {
      const d = this.parseDateOnly(dateStr);
      return d.getTime() >= from.getTime() && d.getTime() <= to.getTime();
    };

    switch (filter) {
      case 'done':
        return all.filter((t) => t.isDone);

      case 'all':
        return all.filter((t) => !t.isDone);

      case 'today':
        return all.filter((t) => !t.isDone && t.dueDate === todayStr);

      case 'tomorrow':
        return all.filter((t) => !t.isDone && t.dueDate === tomorrowStr);

      case 'week':
        return all.filter((t) => !t.isDone && isDateInRange(t.dueDate, today, weekEnd));
    }
  }

  private newId(): string {
    const anyCrypto = crypto as unknown as { randomUUID?: () => string };
    if (anyCrypto?.randomUUID) return anyCrypto.randomUUID();
    return 't_' + Math.random().toString(16).slice(2) + '_' + Date.now().toString(16);
  }

  private parseDateOnly(s: string): Date {
    const [y, m, d] = s.split('-').map((x) => Number(x));
    return new Date(y, (m || 1) - 1, d || 1);
  }

  private dateOnly(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private addDays(d: Date, days: number): Date {
    const x = new Date(d.getTime());
    x.setDate(x.getDate() + days);
    return x;
  }

  private toDateOnlyString(d: Date): string {
    const yyyy = String(d.getFullYear());
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
