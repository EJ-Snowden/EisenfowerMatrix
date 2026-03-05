import { Injectable } from '@angular/core';
import { Quadrant, RankedTask, TaskItem } from '../../../models/task.model';

@Injectable({ providedIn: 'root' })
export class PriorityService {
  // thresholds
  private readonly importantThreshold = 0.5;
  private readonly urgentDeadlineThreshold = 0.5;
  private readonly urgentFeelingThreshold = 0.6;

  // weights (можно будет вынести в settings)
  private readonly wImpact = 0.35;
  private readonly wDeadline = 0.25;
  private readonly wFeeling = 0.10;
  private readonly wPenalty = 0.10;
  private readonly wCommitment = 0.10;
  private readonly wAging = 0.10;
  private readonly wQuickWin = 0.05;

  private readonly wEffortCost = 0.12;
  private readonly wEnergyCost = 0.08;

  toRanked(tasks: TaskItem[], now: Date = new Date()): RankedTask[] {
    const ranked = tasks.map((t) => this.rankOne(t, now));
    return ranked.sort((a, b) => this.compareRanked(a, b));
  }

  rankOne(task: TaskItem, now: Date = new Date()): RankedTask {
    const impact = this.clamp01(task.importance / 100);
    const uFeeling = this.clamp01(task.urgencyFeeling / 100);

    const daysUntilDue = this.daysUntilDue(task.dueDate, now);
    const ageDays = this.ageDays(task.createdAt, now);

    const deadline = this.deadlinePressure(daysUntilDue);
    const aging = this.agingBoost(ageDays);

    const penalty = this.penaltyValue(task.penalty);
    const commitment = this.commitmentValue(task.commitment);

    const effortCost = this.effortCost(task.effortMinutes);
    const energyCost = this.energyCost(task.energy);

    const quickWin = task.effortMinutes <= 15 ? 1 : 0;

    const raw =
      this.wImpact * impact +
      this.wDeadline * deadline +
      this.wFeeling * uFeeling +
      this.wPenalty * penalty +
      this.wCommitment * commitment +
      this.wAging * aging +
      this.wQuickWin * quickWin -
      this.wEffortCost * effortCost -
      this.wEnergyCost * energyCost;

    const score = this.clamp(100 * raw, 0, 100);

    const quadrant = this.getQuadrant(impact, deadline, uFeeling);

    return {
      task,
      score,
      quadrant,
      impact,
      deadline,
      aging,
    };
  }

  getQuadrant(impact: number, deadline: number, uFeeling: number): Quadrant {
    const isImportant = impact >= this.importantThreshold;
    const isUrgent = deadline >= this.urgentDeadlineThreshold || uFeeling >= this.urgentFeelingThreshold;

    if (isUrgent && isImportant) return 'Q1';
    if (!isUrgent && isImportant) return 'Q2';
    if (isUrgent && !isImportant) return 'Q3';
    return 'Q4';
  }

  private compareRanked(a: RankedTask, b: RankedTask): number {
    const qo = (q: Quadrant) => {
      switch (q) {
        case 'Q1':
          return 1;
        case 'Q2':
          return 2;
        case 'Q3':
          return 3;
        case 'Q4':
          return 4;
      }
    };

    const qDiff = qo(a.quadrant) - qo(b.quadrant);
    if (qDiff !== 0) return qDiff;

    const scoreDiff = b.score - a.score;
    if (Math.abs(scoreDiff) > 0.0001) return scoreDiff;

    // dueDate asc
    const dueDiff = a.task.dueDate.localeCompare(b.task.dueDate);
    if (dueDiff !== 0) return dueDiff;

    // updatedAt desc
    return b.task.updatedAt.localeCompare(a.task.updatedAt);
  }

  private deadlinePressure(daysUntilDue: number): number {
    // logistic: 1 / (1 + exp((daysUntilDue - 2) / 1.2))
    if (daysUntilDue < 0) return 1.2;

    const x = (daysUntilDue - 2) / 1.2;
    const v = 1 / (1 + Math.exp(x));
    return this.clamp(v, 0, 1.2);
  }

  private agingBoost(ageDays: number): number {
    // min(1, log(1+ageDays)/log(1+14))
    const denom = Math.log(1 + 14);
    const v = denom === 0 ? 0 : Math.log(1 + Math.max(0, ageDays)) / denom;
    return this.clamp01(v);
  }

  private effortCost(effortMinutes: number): number {
    const hours = Math.max(0, effortMinutes) / 60;
    const ratio = Math.min(1, hours / 8);
    return this.clamp01(Math.sqrt(ratio));
  }

  private energyCost(energy: TaskItem['energy']): number {
    switch (energy) {
      case 'low':
        return 0.1;
      case 'medium':
        return 0.35;
      case 'high':
        return 0.7;
    }
  }

  private commitmentValue(c: TaskItem['commitment']): number {
    switch (c) {
      case 'none':
        return 0;
      case 'soft':
        return 0.3;
      case 'hard':
        return 0.7;
    }
  }

  private penaltyValue(p: TaskItem['penalty']): number {
    switch (p) {
      case 'low':
        return 0.2;
      case 'medium':
        return 0.5;
      case 'high':
        return 0.9;
    }
  }

  private daysUntilDue(dueDate: string, now: Date): number {
    const due = this.parseDateOnly(dueDate);
    const today = this.dateOnly(now);
    const ms = due.getTime() - today.getTime();
    return Math.floor(ms / (24 * 60 * 60 * 1000));
  }

  private ageDays(createdAtIso: string, now: Date): number {
    const created = new Date(createdAtIso);
    const createdDay = this.dateOnly(created);
    const today = this.dateOnly(now);
    const ms = today.getTime() - createdDay.getTime();
    return Math.floor(ms / (24 * 60 * 60 * 1000));
  }

  private parseDateOnly(s: string): Date {
    // s: YYYY-MM-DD
    const [y, m, d] = s.split('-').map((x) => Number(x));
    return new Date(y, (m || 1) - 1, d || 1);
  }

  private dateOnly(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private clamp01(v: number): number {
    return this.clamp(v, 0, 1);
  }

  private clamp(v: number, min: number, max: number): number {
    if (Number.isNaN(v)) return min;
    return Math.max(min, Math.min(max, v));
  }
}
