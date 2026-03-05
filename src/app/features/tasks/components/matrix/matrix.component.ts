import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { RankedTask, Quadrant } from '../../../../models/task.model';

type ViewMode = 'quadrants' | 'plot';

@Component({
  selector: 'app-matrix',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './matrix.component.html',
  styleUrl: './matrix.component.css',
})
export class MatrixComponent implements OnChanges {
  @Input() items: RankedTask[] = [];

  @Output() toggleDone = new EventEmitter<string>();
  @Output() deleteTask = new EventEmitter<string>();
  @Output() editTask = new EventEmitter<string>();

  viewMode: ViewMode = 'quadrants';

  q1: RankedTask[] = [];
  q2: RankedTask[] = [];
  q3: RankedTask[] = [];
  q4: RankedTask[] = [];

  private readonly plotPad = 4

  hovered: RankedTask | null = null;
  mouseX = 0;
  mouseY = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) this.rebuild();
  }

  setView(mode: ViewMode): void {
    this.viewMode = mode;
  }

  private rebuild(): void {
    const byScoreDesc = (a: RankedTask, b: RankedTask) => b.score - a.score;

    this.q1 = this.items.filter((x) => x.quadrant === 'Q1').sort(byScoreDesc);
    this.q2 = this.items.filter((x) => x.quadrant === 'Q2').sort(byScoreDesc);
    this.q3 = this.items.filter((x) => x.quadrant === 'Q3').sort(byScoreDesc);
    this.q4 = this.items.filter((x) => x.quadrant === 'Q4').sort(byScoreDesc);
  }

  titleOf(q: Quadrant): string {
    switch (q) {
      case 'Q1':
        return 'Q1 - Urgent and Important';
      case 'Q2':
        return 'Q2 - Not Urgent and Important';
      case 'Q3':
        return 'Q3 - Urgent and Not Important';
      case 'Q4':
        return 'Q4 - Not Urgent and Not Important';
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
    const u = this.clampInt(Number(item.task.urgencyFeeling), 0, 100) / 100;
    return this.plotPad + u * (100 - 2 * this.plotPad);
  }

  yPos(item: RankedTask): number {
    const imp = this.clampInt(Number(item.task.importance), 0, 100) / 100;
    const y = 1 - imp; // 1 => bottom, 0 => top
    return this.plotPad + y * (100 - 2 * this.plotPad);
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
}
