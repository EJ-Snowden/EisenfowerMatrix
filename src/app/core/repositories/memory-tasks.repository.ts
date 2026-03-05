import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TaskItem } from '../../models/task.model';
import { TasksRepository } from './tasks-repository';

@Injectable()
export class MemoryTasksRepository implements TasksRepository {
  private readonly subject = new BehaviorSubject<TaskItem[]>(this.createDemoTasks());
  readonly tasks$ = this.subject.asObservable();

  add(task: TaskItem): void {
    this.subject.next([task, ...this.subject.value]);
  }

  update(id: string, patch: Partial<TaskItem>): void {
    const nowIso = new Date().toISOString();
    this.subject.next(
      this.subject.value.map((t) =>
        t.id === id ? { ...t, ...patch, updatedAt: nowIso } : t
      )
    );
  }

  setDone(id: string, isDone: boolean): void {
    const nowIso = new Date().toISOString();
    this.subject.next(
      this.subject.value.map((t) =>
        t.id === id ? { ...t, isDone, updatedAt: nowIso } : t
      )
    );
  }

  delete(id: string): void {
    this.subject.next(this.subject.value.filter((t) => t.id !== id));
  }

  private createDemoTasks(): TaskItem[] {
    const now = new Date();

    const addDays = (days: number) => {
      const d = this.dateOnly(now);
      d.setDate(d.getDate() + days);
      return this.toDateOnlyString(d);
    };

    const daysAgoIso = (days: number) => {
      const d = this.dateOnly(now);
      d.setDate(d.getDate() - days);
      return d.toISOString();
    };

    const base = (partial: Partial<TaskItem>): TaskItem => ({
      id: this.newId(),
      title: partial.title ?? 'Untitled',
      notes: partial.notes,
      dueDate: partial.dueDate ?? addDays(0),
      importance: partial.importance ?? 50,
      urgencyFeeling: partial.urgencyFeeling ?? 50,
      effortMinutes: partial.effortMinutes ?? 30,
      energy: partial.energy ?? 'medium',
      commitment: partial.commitment ?? 'none',
      penalty: partial.penalty ?? 'medium',
      category: partial.category,
      isDone: partial.isDone ?? false,
      createdAt: partial.createdAt ?? now.toISOString(),
      updatedAt: partial.updatedAt ?? now.toISOString(),
    });

    return [
      base({
        title: 'Записаться к врачу',
        dueDate: addDays(1),
        importance: 80,
        urgencyFeeling: 35,
        effortMinutes: 15,
        energy: 'low',
        penalty: 'high',
        commitment: 'none',
        createdAt: daysAgoIso(5),
      }),
      base({
        title: 'Сделать отчет по работе',
        dueDate: addDays(0),
        importance: 75,
        urgencyFeeling: 70,
        effortMinutes: 120,
        energy: 'high',
        penalty: 'high',
        commitment: 'hard',
        createdAt: daysAgoIso(1),
      }),
      base({
        title: 'Убрать квартиру',
        dueDate: addDays(3),
        importance: 55,
        urgencyFeeling: 40,
        effortMinutes: 60,
        energy: 'medium',
        penalty: 'low',
        commitment: 'none',
        createdAt: daysAgoIso(10),
      }),
      base({
        title: 'Позвонить маме',
        dueDate: addDays(0),
        importance: 65,
        urgencyFeeling: 30,
        effortMinutes: 5,
        energy: 'low',
        penalty: 'medium',
        commitment: 'soft',
        createdAt: daysAgoIso(7),
      }),
      base({
        title: 'Купить продукты',
        dueDate: addDays(-1),
        importance: 45,
        urgencyFeeling: 70,
        effortMinutes: 30,
        energy: 'low',
        penalty: 'medium',
        commitment: 'none',
        createdAt: daysAgoIso(2),
      }),
    ];
  }

  private newId(): string {
    const anyCrypto = crypto as unknown as { randomUUID?: () => string };
    if (anyCrypto?.randomUUID) return anyCrypto.randomUUID();
    return 't_' + Math.random().toString(16).slice(2) + '_' + Date.now().toString(16);
  }

  private dateOnly(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private toDateOnlyString(d: Date): string {
    const yyyy = String(d.getFullYear());
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
