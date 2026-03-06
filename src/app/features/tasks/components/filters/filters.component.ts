import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaskFilter } from '../../models/task-filter.model';
import { TaskSort } from '../../models/task-sort.model';
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
  @Input() search = '';
  @Input() selectedDate = '';
  @Input() sort: TaskSort = 'priorityDesc';

  @Output() filterChange = new EventEmitter<TaskFilter>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() dateChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<TaskSort>();
  @Output() exportClick = new EventEmitter<void>();
  @Output() importClick = new EventEmitter<void>();

  readonly sortOptions: TaskSort[] = [
    'priorityDesc',
    'dueDateAsc',
    'dueDateDesc',
    'createdAtDesc',
    'updatedAtDesc',
    'doneAtDesc',
    'doneAtAsc',
    'titleAsc',
  ];

  setFilter(f: TaskFilter): void {
    this.filterChange.emit(f);
  }

  isActive(f: TaskFilter): boolean {
    return this.active === f;
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value ?? '';
    this.searchChange.emit(value);
  }

  onDate(event: Event): void {
    const value = (event.target as HTMLInputElement).value ?? '';
    this.dateChange.emit(value);
    if (value) this.filterChange.emit('date');
  }

  onSort(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as TaskSort;
    this.sortChange.emit(value);
  }

  sortLabelKey(sort: TaskSort): string {
    return `filters.sort.${sort}`;
  }
}
