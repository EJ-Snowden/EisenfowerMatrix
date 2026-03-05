import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
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
} from '@angular/fire/firestore';

@Injectable()
export class FirestoreTasksRepository implements TasksRepository {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(AuthService);

  private readonly lastValue = new BehaviorSubject<TaskItem[]>([]);
  readonly tasks$: Observable<TaskItem[]> = this.auth.user$.pipe(
    switchMap((u) => {
      if (!u) return of([]);
      const col = collection(this.firestore, `users/${u.uid}/tasks`);
      return (collectionData(col, { idField: 'id' }) as Observable<TaskItem[]>);
    })
  );

  add(task: TaskItem): void {
    void this.runWithUid(async (uid) => {
      const ref = doc(this.firestore, `users/${uid}/tasks/${task.id}`);
      await setDoc(ref, task, { merge: false });
    });
  }

  update(id: string, patch: Partial<TaskItem>): void {
    void this.runWithUid(async (uid) => {
      const ref = doc(this.firestore, `users/${uid}/tasks/${id}`);
      await updateDoc(ref, { ...patch, updatedAt: new Date().toISOString() } as any);
    });
  }

  setDone(id: string, isDone: boolean): void {
    void this.runWithUid(async (uid) => {
      const ref = doc(this.firestore, `users/${uid}/tasks/${id}`);
      const nowIso = new Date().toISOString();
      await updateDoc(ref, { isDone, updatedAt: nowIso } as any);
    });
  }

  delete(id: string): void {
    void this.runWithUid(async (uid) => {
      const ref = doc(this.firestore, `users/${uid}/tasks/${id}`);
      await deleteDoc(ref);
    });
  }

  private async runWithUid(fn: (uid: string) => Promise<void>): Promise<void> {
    const u = await new Promise<any>((resolve) => {
      const sub = this.auth.user$.subscribe((x) => {
        resolve(x);
        sub.unsubscribe();
      });
    });

    if (!u?.uid) return;

    try {
      await fn(u.uid);
    } catch (e) {
      console.error(e);
    }
  }
}
