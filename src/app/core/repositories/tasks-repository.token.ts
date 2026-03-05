import { InjectionToken } from '@angular/core';
import { TasksRepository } from './tasks-repository';

export const TASKS_REPOSITORY = new InjectionToken<TasksRepository>('TASKS_REPOSITORY');
