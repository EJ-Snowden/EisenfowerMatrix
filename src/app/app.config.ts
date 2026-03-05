import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { TASKS_REPOSITORY } from './core/repositories/tasks-repository.token';
import { MemoryTasksRepository } from './core/repositories/memory-tasks.repository';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: TASKS_REPOSITORY, useClass: MemoryTasksRepository },
    provideRouter(routes)
  ]
};
