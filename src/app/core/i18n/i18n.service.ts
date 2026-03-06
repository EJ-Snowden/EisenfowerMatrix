import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Lang = 'en' | 'ru';

const STORAGE_KEY = 'em_lang';

const DICT: Record<Lang, Record<string, string>> = {
  en: {
    'app.title': 'Eisenhower Matrix',
    'app.subtitle': 'Urgency x Importance',
    'app.login': 'Login',
    'app.logout': 'Logout',
    'app.close': 'Close',

    'lang.en': 'EN',
    'lang.ru': 'RU',
    'lang.title': 'Language',

    'auth.signin.title': 'Sign in',
    'auth.signup.title': 'Create account',
    'auth.tagline': 'Private tasks, synced in the cloud',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.email.placeholder': 'name@email.com',
    'auth.password.placeholder': 'min 6 chars',
    'auth.btn.signin': 'Sign in',
    'auth.btn.signup': 'Sign up',
    'auth.btn.toSignup': 'Create account',
    'auth.btn.toSignin': 'I already have an account',

    'auth.err.invalidCredential': 'Invalid email or password',
    'auth.err.emailInUse': 'Email already in use',
    'auth.err.weakPassword': 'Password is too weak',
    'auth.err.unknown': 'Unknown error',

    'filters.today': 'Today',
    'filters.tomorrow': 'Tomorrow',
    'filters.week': 'Week',
    'filters.all': 'All',
    'filters.done': 'Done',

    'tasks.title': 'Tasks',
    'tasks.subtitle': 'Matrix + priority score',
    'tasks.create.title': 'Create',
    'tasks.create.hint': 'Simple or Advanced',
    'tasks.edit.title': 'Edit',

    'actions.edit': 'Edit',
    'actions.delete': 'Delete',
    'actions.done': 'Done',
    'actions.undone': 'Undone',

    'matrix.title': 'Eisenhower Matrix',
    'matrix.count': '{count} tasks',
    'matrix.view.quadrants': 'Quadrants',
    'matrix.view.plot': 'Plot',
    'matrix.hint': 'Quadrant lines are at 50/50. Click a dot to edit.',
    'matrix.axis.urgency': 'Urgency',
    'matrix.axis.importance': 'Importance',
    'matrix.empty': 'Empty',
    'matrix.q1': 'Q1 - Urgent and Important',
    'matrix.q2': 'Q2 - Not Urgent and Important',
    'matrix.q3': 'Q3 - Urgent and Not Important',
    'matrix.q4': 'Q4 - Not Urgent and Not Important',
    'matrix.tooltip.i': 'I {i}',
    'matrix.tooltip.u': 'U {u}',
    'matrix.tooltip.effort': '{m}m',

    'plist.title': 'Priority list',
    'plist.count': '{count} items',
    'plist.empty': 'No tasks for this filter.',

    'form.add': 'Add task',
    'form.edit': 'Edit task',
    'form.simple': 'Simple',
    'form.advanced': 'Advanced',

    'form.title': 'Title',
    'form.title.placeholder': 'What to do?',
    'form.title.error': 'Title is required (min 2 chars)',

    'form.duedate': 'Due date',
    'form.today': 'Today',
    'form.tomorrow': 'Tomorrow',

    'form.importance': 'Importance: {v}',
    'form.urgency': 'Urgency feeling: {v}',

    'form.effort': 'Effort',
    'form.energy': 'Energy',
    'form.commitment': 'Commitment',
    'form.penalty': 'Penalty',
    'form.category': 'Category',
    'form.notes': 'Notes',
    'form.none': 'None',

    'energy.low': 'Low',
    'energy.medium': 'Medium',
    'energy.high': 'High',

    'commitment.none': 'None',
    'commitment.soft': 'Soft',
    'commitment.hard': 'Hard',

    'penalty.low': 'Low',
    'penalty.medium': 'Medium',
    'penalty.high': 'High',

    'category.work': 'Work',
    'category.home': 'Home',
    'category.health': 'Health',
    'category.people': 'People',
    'category.self': 'Self',

    'form.btn.add': 'Add',
    'form.btn.save': 'Save',
    'form.btn.clear': 'Clear',
    'form.btn.cancel': 'Cancel',
  },

  ru: {
    'app.title': 'Матрица Эйзенхауэра',
    'app.subtitle': 'Срочность x Важность',
    'app.login': 'Войти',
    'app.logout': 'Выйти',
    'app.close': 'Закрыть',

    'lang.en': 'EN',
    'lang.ru': 'RU',
    'lang.title': 'Язык',

    'auth.signin.title': 'Вход',
    'auth.signup.title': 'Регистрация',
    'auth.tagline': 'Личные задачи, синхронизация в облаке',
    'auth.email': 'Email',
    'auth.password': 'Пароль',
    'auth.email.placeholder': 'name@email.com',
    'auth.password.placeholder': 'мин 6 символов',
    'auth.btn.signin': 'Войти',
    'auth.btn.signup': 'Создать аккаунт',
    'auth.btn.toSignup': 'Создать аккаунт',
    'auth.btn.toSignin': 'У меня уже есть аккаунт',

    'auth.err.invalidCredential': 'Неверный email или пароль',
    'auth.err.emailInUse': 'Email уже используется',
    'auth.err.weakPassword': 'Слишком слабый пароль',
    'auth.err.unknown': 'Неизвестная ошибка',

    'filters.today': 'Сегодня',
    'filters.tomorrow': 'Завтра',
    'filters.week': 'Неделя',
    'filters.all': 'Все',
    'filters.done': 'Готово',

    'tasks.title': 'Задачи',
    'tasks.subtitle': 'Матрица + приоритет',
    'tasks.create.title': 'Добавить',
    'tasks.create.hint': 'Простой или расширенный режим',
    'tasks.edit.title': 'Редактирование',

    'actions.edit': 'Изменить',
    'actions.delete': 'Удалить',
    'actions.done': 'Готово',
    'actions.undone': 'Вернуть',

    'matrix.title': 'Матрица Эйзенхауэра',
    'matrix.count': '{count} задач',
    'matrix.view.quadrants': 'Квадранты',
    'matrix.view.plot': 'График',
    'matrix.hint': 'Линии квадрантов на 50/50. Клик по точке - редактирование.',
    'matrix.axis.urgency': 'Срочность',
    'matrix.axis.importance': 'Важность',
    'matrix.empty': 'Пусто',
    'matrix.q1': 'Q1 - Срочно и важно',
    'matrix.q2': 'Q2 - Не срочно и важно',
    'matrix.q3': 'Q3 - Срочно и не важно',
    'matrix.q4': 'Q4 - Не срочно и не важно',
    'matrix.tooltip.i': 'В {i}',
    'matrix.tooltip.u': 'С {u}',
    'matrix.tooltip.effort': '{m}м',

    'plist.title': 'Список приоритетов',
    'plist.count': '{count} задач',
    'plist.empty': 'Нет задач для этого фильтра.',

    'form.add': 'Добавить задачу',
    'form.edit': 'Редактировать задачу',
    'form.simple': 'Просто',
    'form.advanced': 'Расширенно',

    'form.title': 'Название',
    'form.title.placeholder': 'Что нужно сделать?',
    'form.title.error': 'Название обязательно (мин 2 символа)',

    'form.duedate': 'Дата',
    'form.today': 'Сегодня',
    'form.tomorrow': 'Завтра',

    'form.importance': 'Важность: {v}',
    'form.urgency': 'Срочность: {v}',

    'form.effort': 'Время',
    'form.energy': 'Энергия',
    'form.commitment': 'Обязательность',
    'form.penalty': 'Штраф',
    'form.category': 'Категория',
    'form.notes': 'Заметки',
    'form.none': 'Нет',

    'energy.low': 'Низкая',
    'energy.medium': 'Средняя',
    'energy.high': 'Высокая',

    'commitment.none': 'Нет',
    'commitment.soft': 'Мягко',
    'commitment.hard': 'Жестко',

    'penalty.low': 'Низкий',
    'penalty.medium': 'Средний',
    'penalty.high': 'Высокий',

    'category.work': 'Работа',
    'category.home': 'Дом',
    'category.health': 'Здоровье',
    'category.people': 'Люди',
    'category.self': 'Себе',

    'form.btn.add': 'Добавить',
    'form.btn.save': 'Сохранить',
    'form.btn.clear': 'Очистить',
    'form.btn.cancel': 'Отмена',
  },
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly langSubject = new BehaviorSubject<Lang>(this.detectInitialLang());
  readonly lang$ = this.langSubject.asObservable();

  get lang(): Lang {
    return this.langSubject.value;
  }

  setLang(lang: Lang): void {
    if (lang === this.lang) return;
    this.langSubject.next(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  }

  toggle(): void {
    this.setLang(this.lang === 'en' ? 'ru' : 'en');
  }

  t(key: string, params?: Record<string, string | number>): string {
    const table = DICT[this.lang];
    let s = table[key] ?? DICT.en[key] ?? key;

    if (params) {
      for (const [k, v] of Object.entries(params)) {
        s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }

    return s;
  }

  private detectInitialLang(): Lang {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'ru') return saved;
    } catch {}

    const nav = (typeof navigator !== 'undefined' ? navigator.language : 'en').toLowerCase();
    return nav.startsWith('ru') ? 'ru' : 'en';
  }
}
