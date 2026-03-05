import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideFirebaseApp, FirebaseApp } from '@angular/fire/app';
import { initializeApp } from 'firebase/app';

import { provideAuth, getAuth } from '@angular/fire/auth';

import { provideFirestore } from '@angular/fire/firestore';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from 'firebase/firestore';

import { environment } from '../environments/environment';

import { TASKS_REPOSITORY } from './core/repositories/tasks-repository.token';
import { FirestoreTasksRepository } from './core/repositories/firestore-tasks.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideFirebaseApp(() => initializeApp(environment.firebase)),

    provideAuth(() => getAuth(inject(FirebaseApp))),

    provideFirestore(() => {
      const app = inject(FirebaseApp);
      return initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentSingleTabManager({}),
        }),
      });
    }),

    { provide: TASKS_REPOSITORY, useClass: FirestoreTasksRepository },
  ],
};
