import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RankedTask } from '../../../../models/task.model';

@Component({
  selector: 'app-priority-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './priority-list.component.html',
  styleUrl: './priority-list.component.css',
})
export class PriorityListComponent {
  @Input() items: RankedTask[] = [];

  @Output() toggleDone = new EventEmitter<string>();
  @Output() deleteTask = new EventEmitter<string>();

  onToggleDone(id: string): void {
    this.toggleDone.emit(id);
  }

  onDelete(id: string): void {
    this.deleteTask.emit(id);
  }
}
