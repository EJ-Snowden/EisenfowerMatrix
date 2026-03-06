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
    'filters.overdue': 'Overdue',
    'filters.date': 'Date',
    'filters.all': 'All',
    'filters.done': 'Done',
    'filters.search': 'Search',
    'filters.search.placeholder': 'Search title or notes',
    'filters.pickDate': 'Pick date',
    'filters.sort': 'Sort',
    'filters.sort.priorityDesc': 'Priority - high to low',
    'filters.sort.dueDateAsc': 'Due date - nearest first',
    'filters.sort.dueDateDesc': 'Due date - latest first',
    'filters.sort.createdAtDesc': 'Created - newest first',
    'filters.sort.updatedAtDesc': 'Updated - newest first',
    'filters.sort.doneAtDesc': 'Completed - newest first',
    'filters.sort.doneAtAsc': 'Completed - oldest first',
    'filters.sort.titleAsc': 'Title - A to Z',

    'tasks.title': 'Tasks',
    'tasks.subtitle': 'Matrix + priority score',
    'tasks.create.title': 'Create',
    'tasks.create.hint': 'Simple or Advanced',
    'tasks.edit.title': 'Edit',
    'tasks.openCreate': 'New task',
    'tasks.import.success': 'Backup imported successfully',
    'tasks.import.error': 'Import failed. Check JSON format.',

    'actions.edit': 'Edit',
    'actions.delete': 'Delete',
    'actions.done': 'Done',
    'actions.undone': 'Undone',
    'actions.export': 'Export JSON',
    'actions.import': 'Import JSON',
    'actions.confirm': 'Confirm',
    'actions.create': 'Create',

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
    'matrix.doneAt': 'Done',

    'plist.title': 'Priority list',
    'plist.count': '{count} items',
    'plist.empty': 'No tasks for this filter.',
    'plist.doneAt': 'Done',

    'form.add': 'Add task',
    'form.edit': 'Edit task',
    'form.simple': 'Simple',
    'form.advanced': 'Advanced',
    'form.hotkeys': 'Enter submit, Esc close',

    'form.presets': 'Presets',
    'form.preset.work': 'Work',
    'form.preset.home': 'Home',
    'form.preset.health': 'Health',

    'form.title': 'Title',
    'form.title.placeholder': 'What to do?',
    'form.title.error': 'Title is required (min 2 chars)',

    'form.duedate': 'Due date',
    'form.today': 'Today',
    'form.tomorrow': 'Tomorrow',
    'form.plus3': '+3 days',
    'form.nextWeek': 'Next week',
    'form.nextMonth': 'Next month',
    'form.datePreview': 'Selected: {value}',

    'form.importance': 'Importance: {v}',
    'form.urgency': 'Urgency feeling: {v}',

    'form.effort': 'Effort',
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

    'confirm.delete.title': 'Delete task?',
    'confirm.delete.message': 'Are you sure you want to delete "{title}"?',
    'confirm.delete.hint': 'This action cannot be undone.',

    'backup.title': 'Backup',
    'backup.export.filename': 'eisenhower-matrix-backup',
    'backup.versionError': 'Unsupported backup version',
    'backup.invalid': 'Invalid backup file',

    'layout.edit': 'Customize layout',
    'layout.done': 'Done',
    'layout.reset': 'Reset layout',
    'layout.moveUp': 'Move up',
    'layout.moveDown': 'Move down',
    'layout.section.filters': 'Filters',
    'layout.section.matrix': 'Matrix',
    'layout.section.list': 'Priority list',
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
    'filters.overdue': 'Просрочено',
    'filters.date': 'Дата',
    'filters.all': 'Все',
    'filters.done': 'Готово',
    'filters.search': 'Поиск',
    'filters.search.placeholder': 'Поиск по названию или заметкам',
    'filters.pickDate': 'Выбрать дату',
    'filters.sort': 'Сортировка',
    'filters.sort.priorityDesc': 'Приоритет - от высокого к низкому',
    'filters.sort.dueDateAsc': 'Срок - ближайшие сначала',
    'filters.sort.dueDateDesc': 'Срок - поздние сначала',
    'filters.sort.createdAtDesc': 'Создано - новые сначала',
    'filters.sort.updatedAtDesc': 'Обновлено - новые сначала',
    'filters.sort.doneAtDesc': 'Завершено - новые сначала',
    'filters.sort.doneAtAsc': 'Завершено - старые сначала',
    'filters.sort.titleAsc': 'Название - А-Я',

    'tasks.title': 'Задачи',
    'tasks.subtitle': 'Матрица + приоритет',
    'tasks.create.title': 'Добавить',
    'tasks.create.hint': 'Простой или расширенный режим',
    'tasks.edit.title': 'Редактирование',
    'tasks.openCreate': 'Новая задача',
    'tasks.import.success': 'Резервная копия импортирована',
    'tasks.import.error': 'Импорт не удался. Проверь JSON.',


    'matrix.q3': 'Q3 - Срочно и не важно',
    'matrix.q4': 'Q4 - Не срочно и не важно',
    'matrix.tooltip.i': 'В {i}',
    'matrix.tooltip.u': 'С {u}',
    'matrix.tooltip.effort': '{m}м',
    'matrix.doneAt': 'Готово',

    'plist.title': 'Список приоритетов',
    'plist.count': '{count} задач',
    'plist.empty': 'Нет задач для этого фильтра.',
    'plist.doneAt': 'Готово',

    'form.add': 'Добавить задачу',
    'form.edit': 'Редактировать задачу',
    'form.simple': 'Просто',
    'form.advanced': 'Расширенно',
    'form.hotkeys': 'Enter отправить, Esc закрыть',

    'form.presets': 'Пресеты',
    'form.preset.work': 'Работа',
    'form.preset.home': 'Дом',
    'form.preset.health': 'Здоровье',

    'form.title': 'Название',
    'form.title.placeholder': 'Что нужно сделать?',
    'form.title.error': 'Название обязательно (мин 2 символа)',

    'form.duedate': 'Дата',
    'form.today': 'Сегодня',
    'form.tomorrow': 'Завтра',
    'form.plus3': '+3 дня',
    'form.nextWeek': 'Следующая неделя',
    'form.nextMonth': 'Следующий месяц',
    'form.datePreview': 'Выбрано: {value}',

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

    'confirm.delete.title': 'Удалить задачу?',
    'confirm.delete.message': 'Вы уверены, что хотите удалить "{title}"?',
    'confirm.delete.hint': 'Это действие нельзя отменить.',

    'backup.title': 'Резервная копия',
    'backup.export.filename': 'eisenhower-matrix-backup',
    'backup.versionError': 'Неподдерживаемая версия файла',
    'backup.invalid': 'Некорректный файл резервной копии',

    'layout.edit': 'Настроить блоки',
    'layout.done': 'Готово',
    'layout.reset': 'Сбросить порядок',
    'layout.moveUp': 'Вверх',
    'layout.moveDown': 'Вниз',
    'layout.section.filters': 'Фильтры',
    'layout.section.matrix': 'Матрица',
    'layout.section.list': 'Список приоритетов',
  },
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly langSubject = new BehaviorSubject<Lang>(this.detectInitialLang());
  readonly lang$ = this.langSubject.asObservable();

  constructor() {
    this.applyDocumentLang(this.langSubject.value);
  }

  get lang(): Lang {
    return this.langSubject.value;
  }

  setLang(lang: Lang): void {
    if (lang === this.lang) return;
    this.langSubject.next(lang);
    this.applyDocumentLang(lang);
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

  private applyDocumentLang(lang: Lang): void {
    try {
      document.documentElement.lang = lang;
    } catch {}
  }
}
