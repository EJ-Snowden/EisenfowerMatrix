import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { RankedTask, Quadrant } from '../../../../models/task.model';

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

  q1: RankedTask[] = [];
  q2: RankedTask[] = [];
  q3: RankedTask[] = [];
  q4: RankedTask[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.rebuild();
    }
  }

  private rebuild(): void {
    this.q1 = this.items.filter((x) => x.quadrant === 'Q1');
    this.q2 = this.items.filter((x) => x.quadrant === 'Q2');
    this.q3 = this.items.filter((x) => x.quadrant === 'Q3');
    this.q4 = this.items.filter((x) => x.quadrant === 'Q4');
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

  trackById(_: number, x: RankedTask): string {
    return x.task.id;
  }
}
