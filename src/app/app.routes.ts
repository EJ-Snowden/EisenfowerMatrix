import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tasks' },

  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/pages/auth-page/auth-page.component').then(
        (m) => m.AuthPageComponent
      ),
  },

  {
    path: 'tasks',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tasks/pages/tasks-page/tasks-page.component').then(
        (m) => m.TasksPageComponent
      ),
  },

  { path: '**', redirectTo: 'tasks' },
];
