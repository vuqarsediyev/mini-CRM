import type {
  UserProfile,
  ConstructionObject,
  Task,
  TaskHistoryItem,
  TaskStatus,
} from '../types/crm';

// Default initial seed users matching supabase/seed.sql
export const INITIAL_USERS: UserProfile[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'manager1@crm.local',
    full_name: 'Алексей Смирнов (Руководитель проектов)',
    role: 'manager',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'manager2@crm.local',
    full_name: 'Иван Кузнецов (Главный инженер)',
    role: 'manager',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'worker1@crm.local',
    full_name: 'Дмитрий Новиков (Бригадир монтажников)',
    role: 'assignee',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'worker2@crm.local',
    full_name: 'Сергей Васильев (Электромонтажник)',
    role: 'assignee',
  },
];

export const INITIAL_OBJECTS: ConstructionObject[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'ЖК «Северные Высоты»',
    address: 'г. Москва, ул. Ленина, д. 104',
    created_by: '11111111-1111-1111-1111-111111111111',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    name: 'Бизнес-центр «Аврора»',
    address: 'г. Москва, пр. Мира, д. 45',
    created_by: '11111111-1111-1111-1111-111111111111',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    name: 'ТЦ «Галерея»',
    address: 'г. Москва, ул. Строителей, д. 12',
    created_by: '22222222-2222-2222-2222-222222222222',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    name: 'Складской комплекс «Логистик-Парк»',
    address: 'МО, ш. Заводское, д. 8',
    created_by: '11111111-1111-1111-1111-111111111111',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    title: 'Монтаж фасадных панелей (секция А)',
    description: 'Выполнить монтаж навесного вентилируемого фасада на отметках от +0.000 до +15.000 согласно проектной документации АР-4.',
    object_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    assignee_id: '33333333-3333-3333-3333-333333333333', // worker1
    author_id: '11111111-1111-1111-1111-111111111111',
    status: 'Новая',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    title: 'Укладка силового кабеля 10кВ',
    description: 'Проложить кабельную линию от ТП-1 до вводного распределительного устройства корпуса 1. Соблюдать радиус изгиба.',
    object_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    assignee_id: '44444444-4444-4444-4444-444444444444', // worker2
    author_id: '11111111-1111-1111-1111-111111111111',
    status: 'В работе',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    title: 'Установка трансформаторной подстанции',
    description: 'Смонтировать блочную трансформаторную подстанцию БКТП 2х1000 кВА, выполнить ошиновку и заземляющий контур.',
    object_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    assignee_id: '33333333-3333-3333-3333-333333333333', // worker1
    author_id: '11111111-1111-1111-1111-111111111111',
    status: 'На проверке',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    title: 'Монтаж системы вентиляции паркинга',
    description: 'Установить радиальные вентиляторы дымоудаления и огнезадерживающие клапаны на отметке -3.600.',
    object_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    assignee_id: '33333333-3333-3333-3333-333333333333', // worker1
    author_id: '11111111-1111-1111-1111-111111111111',
    status: 'На доработке',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    title: 'Бетонирование фундаментной плиты блок 2',
    description: 'Приёмка бетона В25 W6 F150 в объёме 320 куб.м с вибрированием и контролем температуры прогрева.',
    object_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    assignee_id: '44444444-4444-4444-4444-444444444444', // worker2
    author_id: '22222222-2222-2222-2222-222222222222',
    status: 'Принята',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

export const INITIAL_HISTORY: TaskHistoryItem[] = [
  // Task 1
  {
    id: 'h-1-1',
    task_id: '10000000-0000-0000-0000-000000000001',
    user_id: '11111111-1111-1111-1111-111111111111',
    from_status: null,
    to_status: 'Новая',
    comment: 'Задача создана и назначена исполнителю Дмитрию Новикову',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  // Task 2
  {
    id: 'h-2-1',
    task_id: '10000000-0000-0000-0000-000000000002',
    user_id: '11111111-1111-1111-1111-111111111111',
    from_status: null,
    to_status: 'Новая',
    comment: 'Задача создана',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'h-2-2',
    task_id: '10000000-0000-0000-0000-000000000002',
    user_id: '44444444-4444-4444-4444-444444444444',
    from_status: 'Новая',
    to_status: 'В работе',
    comment: 'Приступил к раскопке траншеи и подготовке кабельных трасс',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  // Task 3
  {
    id: 'h-3-1',
    task_id: '10000000-0000-0000-0000-000000000003',
    user_id: '11111111-1111-1111-1111-111111111111',
    from_status: null,
    to_status: 'Новая',
    comment: 'Задача создана',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'h-3-2',
    task_id: '10000000-0000-0000-0000-000000000003',
    user_id: '33333333-3333-3333-3333-333333333333',
    from_status: 'Новая',
    to_status: 'В работе',
    comment: 'Начали монтаж корпуса подстанции',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'h-3-3',
    task_id: '10000000-0000-0000-0000-000000000003',
    user_id: '33333333-3333-3333-3333-333333333333',
    from_status: 'В работе',
    to_status: 'На проверке',
    comment: 'Монтаж подстанции завершён в полном объёме, замеры сопротивления выполнены',
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  // Task 4
  {
    id: 'h-4-1',
    task_id: '10000000-0000-0000-0000-000000000004',
    user_id: '11111111-1111-1111-1111-111111111111',
    from_status: null,
    to_status: 'Новая',
    comment: 'Задача создана',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'h-4-2',
    task_id: '10000000-0000-0000-0000-000000000004',
    user_id: '33333333-3333-3333-3333-333333333333',
    from_status: 'Новая',
    to_status: 'В работе',
    comment: 'Закуплены клапаны, начинаем монтаж трассы',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'h-4-3',
    task_id: '10000000-0000-0000-0000-000000000004',
    user_id: '33333333-3333-3333-3333-333333333333',
    from_status: 'В работе',
    to_status: 'На проверке',
    comment: 'Готово к проверке инженером',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'h-4-4',
    task_id: '10000000-0000-0000-0000-000000000004',
    user_id: '11111111-1111-1111-1111-111111111111',
    from_status: 'На проверке',
    to_status: 'На доработке',
    comment: 'Не закреплены воздуховоды на отметке +3.200, отсутствует виброизоляция на вентиляторе ВД-2',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  // Task 5
  {
    id: 'h-5-1',
    task_id: '10000000-0000-0000-0000-000000000005',
    user_id: '22222222-2222-2222-2222-222222222222',
    from_status: null,
    to_status: 'Новая',
    comment: 'Задача создана',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'h-5-2',
    task_id: '10000000-0000-0000-0000-000000000005',
    user_id: '44444444-4444-4444-4444-444444444444',
    from_status: 'Новая',
    to_status: 'В работе',
    comment: 'Опалубка и армирование завершены, приняты технадзором',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'h-5-3',
    task_id: '10000000-0000-0000-0000-000000000005',
    user_id: '44444444-4444-4444-4444-444444444444',
    from_status: 'В работе',
    to_status: 'На проверке',
    comment: 'Заливка выполнена, образцы кубиков отобраны в лабораторию',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'h-5-4',
    task_id: '10000000-0000-0000-0000-000000000005',
    user_id: '22222222-2222-2222-2222-222222222222',
    from_status: 'На проверке',
    to_status: 'Принята',
    comment: 'Прочность бетона подтверждена паспортом лаборатории. Работа принята в полном объёме.',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

const STORAGE_KEYS = {
  OBJECTS: 'crm_mock_objects_v1',
  TASKS: 'crm_mock_tasks_v1',
  HISTORY: 'crm_mock_history_v1',
};

class MockBackendEngine {
  private getObjects(): ConstructionObject[] {
    const raw = localStorage.getItem(STORAGE_KEYS.OBJECTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.OBJECTS, JSON.stringify(INITIAL_OBJECTS));
      return [...INITIAL_OBJECTS];
    }
    return JSON.parse(raw);
  }

  private saveObjects(objects: ConstructionObject[]) {
    localStorage.setItem(STORAGE_KEYS.OBJECTS, JSON.stringify(objects));
  }

  private getTasks(): Task[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
      return [...INITIAL_TASKS];
    }
    return JSON.parse(raw);
  }

  private saveTasks(tasks: Task[]) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }

  private getHistory(): TaskHistoryItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(INITIAL_HISTORY));
      return [...INITIAL_HISTORY];
    }
    return JSON.parse(raw);
  }

  private saveHistory(history: TaskHistoryItem[]) {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }

  public resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.OBJECTS, JSON.stringify(INITIAL_OBJECTS));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(INITIAL_HISTORY));
  }

  // --- RLS-ENFORCED QUERIES ---

  public getVisibleObjects(user: UserProfile): ConstructionObject[] {
    const allObjects = this.getObjects();
    const allTasks = this.getTasks();

    // RLS Policy on objects:
    // Manager: sees ALL objects.
    // Assignee: sees ONLY objects where they have at least one task assigned!
    let visibleObjects: ConstructionObject[];
    if (user.role === 'manager') {
      visibleObjects = allObjects;
    } else {
      const myObjectIds = new Set(
        allTasks.filter((t) => t.assignee_id === user.id).map((t) => t.object_id)
      );
      visibleObjects = allObjects.filter((o) => myObjectIds.has(o.id));
    }

    // Attach task summary metrics
    return visibleObjects.map((obj) => {
      const objTasks = allTasks.filter(
        (t) => t.object_id === obj.id && (user.role === 'manager' || t.assignee_id === user.id)
      );
      const byStatus: Record<TaskStatus, number> = {
        'Новая': 0,
        'В работе': 0,
        'На проверке': 0,
        'На доработке': 0,
        'Принята': 0,
      };
      for (const t of objTasks) {
        byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      }
      return {
        ...obj,
        task_count: objTasks.length,
        tasks_by_status: byStatus,
      };
    });
  }

  public getObjectById(objectId: string, user: UserProfile): ConstructionObject | null {
    const visible = this.getVisibleObjects(user);
    return visible.find((o) => o.id === objectId) || null;
  }

  public createObject(data: { name: string; address: string }, user: UserProfile): ConstructionObject {
    // RLS INSERT check: only manager
    if (user.role !== 'manager') {
      throw new Error('RLS violation: Только постановщик может создавать объекты');
    }
    const objects = this.getObjects();
    const newObj: ConstructionObject = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      address: data.address.trim(),
      created_by: user.id,
      created_at: new Date().toISOString(),
    };
    objects.unshift(newObj);
    this.saveObjects(objects);
    return newObj;
  }

  public updateObject(id: string, data: { name: string; address: string }, user: UserProfile): ConstructionObject {
    // RLS UPDATE check: only manager
    if (user.role !== 'manager') {
      throw new Error('RLS violation: Только постановщик может редактировать объекты');
    }
    const objects = this.getObjects();
    const idx = objects.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error('Объект не найден');

    objects[idx] = {
      ...objects[idx],
      name: data.name.trim(),
      address: data.address.trim(),
      updated_at: new Date().toISOString(),
    };
    this.saveObjects(objects);
    return objects[idx];
  }

  public deleteObject(id: string, user: UserProfile): void {
    // RLS DELETE check: only manager
    if (user.role !== 'manager') {
      throw new Error('RLS violation: Только постановщик может удалять объекты');
    }
    const objects = this.getObjects().filter((o) => o.id !== id);
    this.saveObjects(objects);

    // CASCADE delete tasks & history
    const tasks = this.getTasks();
    const remainingTasks = tasks.filter((t) => t.object_id !== id);
    this.saveTasks(remainingTasks);
  }

  // --- TASKS ---

  public getVisibleTasks(user: UserProfile, filterObjectId?: string): Task[] {
    const allTasks = this.getTasks();
    const allObjects = this.getObjects();
    const usersMap = new Map(INITIAL_USERS.map((u) => [u.id, u]));
    const objectsMap = new Map(allObjects.map((o) => [o.id, o]));

    // RLS Policy on tasks:
    // Manager sees all tasks.
    // Assignee sees ONLY tasks where assignee_id == user.id.
    let visible = user.role === 'manager'
      ? allTasks
      : allTasks.filter((t) => t.assignee_id === user.id);

    if (filterObjectId) {
      visible = visible.filter((t) => t.object_id === filterObjectId);
    }

    return visible.map((t) => ({
      ...t,
      object: objectsMap.get(t.object_id),
      assignee: t.assignee_id ? usersMap.get(t.assignee_id) || null : null,
      author: usersMap.get(t.author_id),
    }));
  }

  public getTaskById(taskId: string, user: UserProfile): Task | null {
    const visible = this.getVisibleTasks(user);
    return visible.find((t) => t.id === taskId) || null;
  }

  public createTask(
    data: { title: string; description: string; object_id: string; assignee_id?: string | null },
    user: UserProfile
  ): Task {
    // RLS Policy on tasks INSERT: only manager
    if (user.role !== 'manager') {
      throw new Error('RLS violation: Только постановщик может создавать задачи');
    }

    const tasks = this.getTasks();
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: data.title.trim(),
      description: data.description.trim(),
      object_id: data.object_id,
      assignee_id: data.assignee_id || null,
      author_id: user.id,
      status: 'Новая', // strictly starts as 'Новая'
      created_at: new Date().toISOString(),
    };

    tasks.unshift(newTask);
    this.saveTasks(tasks);

    // Database Trigger emulation: create initial history
    const history = this.getHistory();
    history.push({
      id: crypto.randomUUID(),
      task_id: newTask.id,
      user_id: user.id,
      from_status: null,
      to_status: 'Новая',
      comment: 'Задача создана',
      created_at: newTask.created_at,
    });
    this.saveHistory(history);

    return newTask;
  }

  public updateTask(
    taskId: string,
    data: { title?: string; description?: string; assignee_id?: string | null },
    user: UserProfile
  ): Task {
    // Only manager can edit task metadata
    if (user.role !== 'manager') {
      throw new Error('RLS violation: Только постановщик может изменять данные задачи');
    }
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) throw new Error('Задача не найдена');

    tasks[idx] = {
      ...tasks[idx],
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.description !== undefined && { description: data.description.trim() }),
      ...(data.assignee_id !== undefined && { assignee_id: data.assignee_id }),
      updated_at: new Date().toISOString(),
    };
    this.saveTasks(tasks);
    return tasks[idx];
  }

  public deleteTask(taskId: string, user: UserProfile): void {
    if (user.role !== 'manager') {
      throw new Error('RLS violation: Только постановщик может удалять задачи');
    }
    const tasks = this.getTasks().filter((t) => t.id !== taskId);
    this.saveTasks(tasks);

    // Cascade delete history
    const history = this.getHistory().filter((h) => h.task_id !== taskId);
    this.saveHistory(history);
  }

  // --- STATUS TRANSITIONS ENGINE (EXACT REQUIREMENT 2.3 & 3) ---
  public changeTaskStatus(
    taskId: string,
    newStatus: TaskStatus,
    comment: string | null,
    user: UserProfile
  ): Task {
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) {
      throw new Error('Задача не найдена');
    }

    const task = tasks[idx];
    const fromStatus = task.status;
    const cleanComment = comment ? comment.trim() : null;

    // Strict transition validation matrix:
    // 1. Новая -> В работе (назначенный исполнитель)
    if (fromStatus === 'Новая' && newStatus === 'В работе') {
      if (user.role !== 'assignee' || task.assignee_id !== user.id) {
        throw new Error('DB Trigger: Только назначенный исполнитель может взять задачу в работу');
      }
    }
    // 2. В работе -> На проверке (назначенный исполнитель)
    else if (fromStatus === 'В работе' && newStatus === 'На проверке') {
      if (user.role !== 'assignee' || task.assignee_id !== user.id) {
        throw new Error('DB Trigger: Только назначенный исполнитель может отправить задачу на проверку');
      }
    }
    // 3. На проверке -> Принята (постановщик)
    else if (fromStatus === 'На проверке' && newStatus === 'Принята') {
      if (user.role !== 'manager') {
        throw new Error('DB Trigger: Только постановщик может принять задачу');
      }
    }
    // 4. На проверке -> На доработке (постановщик, комментарий обязателен!)
    else if (fromStatus === 'На проверке' && newStatus === 'На доработке') {
      if (user.role !== 'manager') {
        throw new Error('DB Trigger: Только постановщик может вернуть задачу на доработку');
      }
      if (!cleanComment) {
        throw new Error('DB Trigger: При возврате задачи на доработку комментарий обязателен!');
      }
    }
    // 5. На доработке -> В работе (назначенный исполнитель)
    else if (fromStatus === 'На доработке' && newStatus === 'В работе') {
      if (user.role !== 'assignee' || task.assignee_id !== user.id) {
        throw new Error('DB Trigger: Только назначенный исполнитель может вернуть задачу в работу');
      }
    }
    // Any other transition is forbidden!
    else {
      throw new Error(`DB Trigger: Запрещённый переход статуса из "${fromStatus}" в "${newStatus}"`);
    }

    // Update task
    task.status = newStatus;
    task.updated_at = new Date().toISOString();
    tasks[idx] = task;
    this.saveTasks(tasks);

    // Tamper-proof history record
    const history = this.getHistory();
    history.push({
      id: crypto.randomUUID(),
      task_id: taskId,
      user_id: user.id,
      from_status: fromStatus,
      to_status: newStatus,
      comment: cleanComment,
      created_at: new Date().toISOString(),
    });
    this.saveHistory(history);

    return task;
  }

  // --- HISTORY QUERY ---
  public getTaskHistory(taskId: string, user: UserProfile): TaskHistoryItem[] {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return [];

    // RLS Policy: Assignee can only view history of their own tasks
    if (user.role === 'assignee' && task.assignee_id !== user.id) {
      throw new Error('RLS violation: Нет прав на просмотр истории этой задачи');
    }

    const history = this.getHistory().filter((h) => h.task_id === taskId);
    const usersMap = new Map(INITIAL_USERS.map((u) => [u.id, u]));

    return history
      .map((h) => ({
        ...h,
        user: usersMap.get(h.user_id),
      }))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
}

export const mockBackend = new MockBackendEngine();
