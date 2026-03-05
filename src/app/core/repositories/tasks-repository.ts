import { Observable } from 'rxjs';
import { TaskItem } from '../../models/task.model';

export interface TasksRepository {
  readonly tasks$: Observable<TaskItem[]>;

  add(task: TaskItem): void;
  update(id: string, patch: Partial<TaskItem>): void;
  toggleDone(id: string): void;
  delete(id: string): void;
}
