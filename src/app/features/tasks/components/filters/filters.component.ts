import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaskFilter } from '../../models/task-filter.model';
import { TPipe } from '../../../../core/i18n/t.pipe';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, TPipe],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css',
})
export class FiltersComponent {
  @Input() active: TaskFilter = 'today';
  @Output() filterChange = new EventEmitter<TaskFilter>();

  setFilter(f: TaskFilter): void {
    this.filterChange.emit(f);
  }

  isActive(f: TaskFilter): boolean {
    return this.active === f;
  }
}
