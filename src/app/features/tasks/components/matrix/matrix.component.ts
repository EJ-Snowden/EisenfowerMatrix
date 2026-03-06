import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { RankedTask, Quadrant } from '../../../../models/task.model';
import { TPipe } from '../../../../core/i18n/t.pipe';

type ViewMode = 'quadrants' | 'plot';

@Component({
  selector: 'app-matrix',
  standalone: true,
  imports: [CommonModule, TPipe],
  templateUrl: './matrix.component.html',
  styleUrl: './matrix.component.css',
})
export class MatrixComponent implements OnChanges {
  @Input() items: RankedTask[] = [];

  @Output() toggleDone = new EventEmitter<string>();
  @Output() deleteTask = new EventEmitter<string>();
  @Output() editTask = new EventEmitter<string>();

  private readonly storageKey = 'em_matrix_view_mode';
  private readonly plotPad = 4;

  viewMode: ViewMode = this.loadViewMode();

  q1: RankedTask[] = [];
  q2: RankedTask[] = [];
  q3: RankedTask[] = [];
  q4: RankedTask[] = [];

  hovered: RankedTask | null = null;
  mouseX = 0;
  mouseY = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) this.rebuild();
  }

  setView(mode: ViewMode): void {
    this.viewMode = mode;
    this.saveViewMode(mode);
  }

  private rebuild(): void {
    this.q1 = this.items.filter((x) => x.quadrant === 'Q1');
    this.q2 = this.items.filter((x) => x.quadrant === 'Q2');
    this.q3 = this.items.filter((x) => x.quadrant === 'Q3');
    this.q4 = this.items.filter((x) => x.quadrant === 'Q4');
  }

  titleKeyOf(q: Quadrant): string {
    switch (q) {
      case 'Q1':
        return 'matrix.q1';
      case 'Q2':
        return 'matrix.q2';
      case 'Q3':
        return 'matrix.q3';
      case 'Q4':
        return 'matrix.q4';
    }
  }

  onToggleDone(id: string): void {
    this.toggleDone.emit(id);
  }

  onDelete(id: string): void {
    this.deleteTask.emit(id);
  }

  onEdit(id: string): void {
    this.editTask.emit(id);
  }

  trackById(_: number, x: RankedTask): string {
    return x.task.id;
  }

  xPos(item: RankedTask): number {
    const urgency = this.clampInt(Number(item.task.urgencyFeeling), 0, 100) / 100;
    const reversedX = 1 - urgency;
    return this.plotPad + reversedX * (100 - 2 * this.plotPad);
  }

  yPos(item: RankedTask): number {
    const importance = this.clampInt(Number(item.task.importance), 0, 100) / 100;
    const reversedY = 1 - importance;
    return this.plotPad + reversedY * (100 - 2 * this.plotPad);
  }

  dotClass(item: RankedTask): string {
    return `dot ${item.quadrant.toLowerCase()}`;
  }

  onPlotMove(ev: MouseEvent, el: HTMLElement): void {
    const r = el.getBoundingClientRect();
    this.mouseX = ev.clientX - r.left;
    this.mouseY = ev.clientY - r.top;
  }

  enterDot(item: RankedTask): void {
    this.hovered = item;
  }

  leaveDot(): void {
    this.hovered = null;
  }

  private clampInt(v: number, min: number, max: number): number {
    if (!Number.isFinite(v)) return min;
    return Math.max(min, Math.min(max, Math.round(v)));
  }

  private loadViewMode(): ViewMode {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved === 'plot' ? 'plot' : 'quadrants';
    } catch {
      return 'quadrants';
    }
  }

  private saveViewMode(mode: ViewMode): void {
    try {
      localStorage.setItem(this.storageKey, mode);
    } catch {}
  }
}
