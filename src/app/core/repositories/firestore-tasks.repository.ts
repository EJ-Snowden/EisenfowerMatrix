import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap, filter, firstValueFrom } from 'rxjs';
import { TaskItem } from '../../models/task.model';
import { TasksRepository } from './tasks-repository';
import { AuthService } from '../auth/auth.service';

import {
  Firestore,
  collection,
  collectionData,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from '@angular/fire/firestore';

@Injectable()
export class FirestoreTasksRepository implements TasksRepository {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(AuthService);

  readonly tasks$: Observable<TaskItem[]> = this.auth.user$.pipe(
    switchMap((u) => {
      if (!u) return of([]);
      const col = collection(this.firestore, `users/${u.uid}/tasks`);
      return collectionData(col, { idField: 'id' }) as Observable<TaskItem[]>;
    })
  );

  add(task: TaskItem): void {
    void this.runWithUid(async (uid) => {
      const ref = doc(this.firestore, `users/${uid}/tasks/${task.id}`);
      const clean = this.stripUndefined(task);
      await setDoc(ref, clean, { merge: false });
    });
  }

  update(id: string, patch: Partial<TaskItem>): void {
    void this.runWithUid(async (uid) => {
      const ref = doc(this.firestore, `users/${uid}/tasks/${id}`);
      const nowIso = new Date().toISOString();
      const clean = this.stripUndefined({ ...patch, updatedAt: nowIso } as Partial<TaskItem>);
      await updateDoc(ref, clean as any);
    });
  }

  setDone(id: string, isDone: boolean): void {
    void this.runWithUid(async (uid) => {
      const ref = doc(this.firestore, `users/${uid}/tasks/${id}`);
      const nowIso = new Date().toISOString();
      await updateDoc(
        ref,
        this.stripUndefined({
          isDone,
          doneAt: isDone ? nowIso : undefined,
          updatedAt: nowIso,
        }) as any
      );
    });
  }

  delete(id: string): void {
    void this.runWithUid(async (uid) => {
      const ref = doc(this.firestore, `users/${uid}/tasks/${id}`);
      await deleteDoc(ref);
    });
  }

  async upsertMany(tasks: TaskItem[]): Promise<void> {
    await this.runWithUid(async (uid) => {
      const chunkSize = 400;

      for (let i = 0; i < tasks.length; i += chunkSize) {
        const chunk = tasks.slice(i, i + chunkSize);
        const batch = writeBatch(this.firestore);

        for (const task of chunk) {
          const ref = doc(this.firestore, `users/${uid}/tasks/${task.id}`);
          batch.set(ref, this.stripUndefined(task) as any, { merge: false });
        }

        await batch.commit();
      }
    });
  }

  private async runWithUid(fn: (uid: string) => Promise<void>): Promise<void> {
    const u = await firstValueFrom(this.auth.user$.pipe(filter((x) => !!x)));
    const uid = (u as any)?.uid as string | undefined;
    if (!uid) return;

    try {
      await fn(uid);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  private stripUndefined<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  }
}
