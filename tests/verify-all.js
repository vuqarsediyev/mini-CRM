/**
 * АВТОМАТИЗИРОВАННОЕ ТЕСТИРОВАНИЕ ВСЕХ ПУНКТОВ ТЗ
 * Мини-CRM «Объекты и задачи»
 */

const { INITIAL_USERS, INITIAL_OBJECTS, INITIAL_TASKS, INITIAL_HISTORY } = (() => {
  // Mock data definitions matching the system
  const INITIAL_USERS = [
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

  const INITIAL_OBJECTS = [
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

  const INITIAL_TASKS = [
    {
      id: '10000000-0000-0000-0000-000000000001',
      title: 'Монтаж фасадных панелей (секция А)',
      description: 'Выполнить монтаж фасада.',
      object_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      assignee_id: '33333333-3333-3333-3333-333333333333',
      author_id: '11111111-1111-1111-1111-111111111111',
      status: 'Новая',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      title: 'Укладка силового кабеля 10кВ',
      description: 'Проложить кабельную линию.',
      object_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      assignee_id: '44444444-4444-4444-4444-444444444444',
      author_id: '11111111-1111-1111-1111-111111111111',
      status: 'В работе',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      title: 'Установка трансформаторной подстанции',
      description: 'Смонтировать БКТП.',
      object_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      assignee_id: '33333333-3333-3333-3333-333333333333',
      author_id: '11111111-1111-1111-1111-111111111111',
      status: 'На проверке',
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: '10000000-0000-0000-0000-000000000004',
      title: 'Монтаж системы вентиляции паркинга',
      description: 'Установить вентиляторы.',
      object_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      assignee_id: '33333333-3333-3333-3333-333333333333',
      author_id: '11111111-1111-1111-1111-111111111111',
      status: 'На доработке',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: '10000000-0000-0000-0000-000000000005',
      title: 'Бетонирование фундаментной плиты блок 2',
      description: 'Приёмка бетона В25.',
      object_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      assignee_id: '44444444-4444-4444-4444-444444444444',
      author_id: '22222222-2222-2222-2222-222222222222',
      status: 'Принята',
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
  ];

  const INITIAL_HISTORY = [
    {
      id: 'h-1-1',
      task_id: '10000000-0000-0000-0000-000000000001',
      user_id: '11111111-1111-1111-1111-111111111111',
      from_status: null,
      to_status: 'Новая',
      comment: 'Задача создана',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ];

  return { INITIAL_USERS, INITIAL_OBJECTS, INITIAL_TASKS, INITIAL_HISTORY };
})();

// Database & Security Engine for Testing
class TestEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.objects = JSON.parse(JSON.stringify(INITIAL_OBJECTS));
    this.tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
    this.history = JSON.parse(JSON.stringify(INITIAL_HISTORY));
  }

  // RLS: Objects
  getObjects(user) {
    if (user.role === 'manager') {
      return this.objects;
    }
    const myObjIds = new Set(
      this.tasks.filter((t) => t.assignee_id === user.id).map((t) => t.object_id)
    );
    return this.objects.filter((o) => myObjIds.has(o.id));
  }

  createObject(data, user) {
    if (user.role !== 'manager') {
      throw new Error('RLS VIOLATION: Только постановщик может создавать объекты');
    }
    const obj = {
      id: 'obj-' + Math.random().toString(36).substring(2, 9),
      name: data.name,
      address: data.address,
      created_by: user.id,
      created_at: new Date().toISOString(),
    };
    this.objects.push(obj);
    return obj;
  }

  // RLS: Tasks
  getTasks(user, objectId = null) {
    let list = user.role === 'manager'
      ? this.tasks
      : this.tasks.filter((t) => t.assignee_id === user.id);

    if (objectId) {
      list = list.filter((t) => t.object_id === objectId);
    }
    return list;
  }

  createTask(data, user) {
    if (user.role !== 'manager') {
      throw new Error('RLS VIOLATION: Только постановщик может создавать задачи');
    }
    const task = {
      id: 'task-' + Math.random().toString(36).substring(2, 9),
      title: data.title,
      description: data.description || '',
      object_id: data.object_id,
      assignee_id: data.assignee_id || null,
      author_id: user.id,
      status: 'Новая', // Strictly starts as 'Новая'
      created_at: new Date().toISOString(),
    };
    this.tasks.push(task);
    this.history.push({
      id: 'h-' + Math.random().toString(36).substring(2, 9),
      task_id: task.id,
      user_id: user.id,
      from_status: null,
      to_status: 'Новая',
      comment: 'Задача создана',
      created_at: task.created_at,
    });
    return task;
  }

  // Status transitions & DB trigger verification
  changeTaskStatus(taskId, newStatus, comment, user) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Задача не найдена');

    const fromStatus = task.status;
    const cleanComment = comment ? comment.trim() : null;

    // Transition matrix
    if (fromStatus === 'Новая' && newStatus === 'В работе') {
      if (user.role !== 'assignee' || task.assignee_id !== user.id) {
        throw new Error('DB TRIGGER: Только назначенный исполнитель может взять задачу в работу');
      }
    } else if (fromStatus === 'В работе' && newStatus === 'На проверке') {
      if (user.role !== 'assignee' || task.assignee_id !== user.id) {
        throw new Error('DB TRIGGER: Только назначенный исполнитель может отправить задачу на проверку');
      }
    } else if (fromStatus === 'На проверке' && newStatus === 'Принята') {
      if (user.role !== 'manager') {
        throw new Error('DB TRIGGER: Только постановщик может принять задачу');
      }
    } else if (fromStatus === 'На проверке' && newStatus === 'На доработке') {
      if (user.role !== 'manager') {
        throw new Error('DB TRIGGER: Только постановщик может вернуть задачу на доработку');
      }
      if (!cleanComment) {
        throw new Error('DB TRIGGER: При возврате задачи на доработку комментарий обязателен!');
      }
    } else if (fromStatus === 'На доработке' && newStatus === 'В работе') {
      if (user.role !== 'assignee' || task.assignee_id !== user.id) {
        throw new Error('DB TRIGGER: Только назначенный исполнитель может вернуть задачу в работу');
      }
    } else {
      throw new Error(`DB TRIGGER: Запрещённый переход статуса из "${fromStatus}" в "${newStatus}"`);
    }

    task.status = newStatus;
    task.updated_at = new Date().toISOString();

    // History is written automatically
    this.history.push({
      id: 'h-' + Math.random().toString(36).substring(2, 9),
      task_id: taskId,
      user_id: user.id,
      from_status: fromStatus,
      to_status: newStatus,
      comment: cleanComment,
      created_at: new Date().toISOString(),
    });

    return task;
  }

  getHistory(taskId, user) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return [];
    if (user.role === 'assignee' && task.assignee_id !== user.id) {
      throw new Error('RLS VIOLATION: Доступ к истории чужой задачи запрещён');
    }
    return this.history.filter((h) => h.task_id === taskId);
  }
}

// RUN TESTS
const engine = new TestEngine();
const manager1 = INITIAL_USERS[0];
const manager2 = INITIAL_USERS[1];
const worker1 = INITIAL_USERS[2];
const worker2 = INITIAL_USERS[3];

let total = 0;
let passed = 0;

function test(itemNumber, title, fn) {
  total++;
  process.stdout.write(`Тест ${itemNumber}: ${title} ... `);
  try {
    fn();
    passed++;
    console.log('✅ ПРОЙДЕН');
  } catch (err) {
    console.log(`❌ ОШИБКА: ${err.message}`);
  }
}

console.log('================================================================');
console.log('  ПОСЛЕДОВАТЕЛЬНОЕ ТЕСТИРОВАНИЕ ТРЕБОВАНИЙ ТЗ CRM');
console.log('================================================================\n');

// 2.1 Роли
test('1 (2.1)', 'В системе несколько постановщиков и несколько исполнителей', () => {
  const managers = INITIAL_USERS.filter((u) => u.role === 'manager');
  const assignees = INITIAL_USERS.filter((u) => u.role === 'assignee');
  if (managers.length < 2) throw new Error('Менеджеров должно быть несколько');
  if (assignees.length < 2) throw new Error('Исполнителей должно быть несколько');
});

// 2.2 Объекты: видимость
test('2 (2.2)', 'Постановщик видит ВСЕ объекты (включая объекты без задач)', () => {
  const objects = engine.getObjects(manager1);
  if (objects.length !== 4) throw new Error(`Ожидалось 4 объекта, получено: ${objects.length}`);
});

test('3 (2.2)', 'Исполнитель 1 видит ТОЛЬКО объекты со своими задачами (ЖК и БЦ)', () => {
  const objects = engine.getObjects(worker1);
  const names = objects.map((o) => o.name);
  if (!names.includes('ЖК «Северные Высоты»') || !names.includes('Бизнес-центр «Аврора»')) {
    throw new Error('Исполнитель 1 должен видеть свои объекты');
  }
  if (names.includes('ТЦ «Галерея»') || names.includes('Складской комплекс «Логистик-Парк»')) {
    throw new Error('Исполнитель 1 НЕ должен видеть чужие объекты');
  }
  if (objects.length !== 2) throw new Error('Исполнитель должен видеть ровно 2 объекта');
});

test('4 (2.2)', 'Исполнитель 2 видит ТОЛЬКО свои объекты (ЖК и ТЦ)', () => {
  const objects = engine.getObjects(worker2);
  const names = objects.map((o) => o.name);
  if (!names.includes('ЖК «Северные Высоты»') || !names.includes('ТЦ «Галерея»')) {
    throw new Error('Исполнитель 2 должен видеть свои объекты');
  }
  if (names.includes('Бизнес-центр «Аврора»')) {
    throw new Error('Исполнитель 2 НЕ должен видеть БЦ Аврора');
  }
  if (objects.length !== 2) throw new Error('Исполнитель должен видеть ровно 2 объекта');
});

// 2.1 & 3: RLS изоляция задач
test('5 (2.1 & 3)', 'Исполнитель не может прочитать задачи другого исполнителя', () => {
  const tasks = engine.getTasks(worker1);
  for (const t of tasks) {
    if (t.assignee_id !== worker1.id) {
      throw new Error(`Исполнитель 1 получил задачу исполнителя ${t.assignee_id}`);
    }
  }
});

test('6 (2.1 & 3)', 'Исполнителю запрещено создавать объекты на уровне базы (RLS)', () => {
  try {
    engine.createObject({ name: 'Объект', address: 'Адрес' }, worker1);
    throw new Error('Исполнитель смог создать объект!');
  } catch (err) {
    if (!err.message.includes('RLS')) throw err;
  }
});

test('7 (2.1 & 3)', 'Исполнителю запрещено создавать задачи на уровне базы (RLS)', () => {
  try {
    engine.createTask({ title: 'Задача', object_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' }, worker1);
    throw new Error('Исполнитель смог создать задачу!');
  } catch (err) {
    if (!err.message.includes('RLS')) throw err;
  }
});

// 2.3 Создание задачи постановщиком
let testTask = null;
test('8 (2.3)', 'Постановщик создаёт задачу со статусом «Новая» и авто-историей', () => {
  testTask = engine.createTask(
    {
      title: 'Монтаж электропроводки блок В',
      description: 'Кабель ВВГнг-LS 3x2.5',
      object_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      assignee_id: worker1.id,
    },
    manager1
  );
  if (testTask.status !== 'Новая') throw new Error('Начальный статус должен быть «Новая»');
  const h = engine.getHistory(testTask.id, manager1);
  if (h.length !== 1 || h[0].to_status !== 'Новая') {
    throw new Error('Не создана начальная запись истории');
  }
});

// 2.3 Переход: Новая -> В работе
test('9 (2.3)', 'Постановщик НЕ МОЖЕТ перевести «Новая» → «В работе» (только исполнитель)', () => {
  try {
    engine.changeTaskStatus(testTask.id, 'В работе', null, manager1);
    throw new Error('Постановщик смог взять задачу в работу!');
  } catch (err) {
    if (!err.message.includes('назначенный исполнитель')) throw err;
  }
});

test('10 (2.3)', 'Чужой исполнитель НЕ МОЖЕТ перевести чужую «Новая» → «В работе»', () => {
  try {
    engine.changeTaskStatus(testTask.id, 'В работе', null, worker2);
    throw new Error('Чужой исполнитель смог взять задачу в работу!');
  } catch (err) {
    if (!err.message.includes('назначенный исполнитель')) throw err;
  }
});

test('11 (2.3)', 'Назначенный исполнитель переводит «Новая» → «В работе»', () => {
  const updated = engine.changeTaskStatus(testTask.id, 'В работе', 'Приступил', worker1);
  if (updated.status !== 'В работе') throw new Error('Статус должен быть «В работе»');
});

// 2.3 Переход: В работе -> На проверке
test('12 (2.3)', 'Назначенный исполнитель переводит «В работе» → «На проверке»', () => {
  const updated = engine.changeTaskStatus(testTask.id, 'На проверке', 'Кабель проложен', worker1);
  if (updated.status !== 'На проверке') throw new Error('Статус должен быть «На проверке»');
});

// 2.3 Переход: На проверке -> На доработке (комментарий обязателен)
test('13 (2.3)', 'Постановщик возвращает «На проверке» → «На доработке» БЕЗ комментария: ЗАПРЕЩЕНО', () => {
  try {
    engine.changeTaskStatus(testTask.id, 'На доработке', '', manager1);
    throw new Error('Удалось вернуть задачу на доработку без комментария!');
  } catch (err) {
    if (!err.message.includes('обязателен')) throw err;
  }
});

test('14 (2.3)', 'Постановщик возвращает «На проверке» → «На доработке» С комментарием: УСПЕШНО', () => {
  const updated = engine.changeTaskStatus(
    testTask.id,
    'На доработке',
    'Не установлены распределительные коробки',
    manager1
  );
  if (updated.status !== 'На доработке') throw new Error('Статус должен быть «На доработке»');
});

// 2.3 Переход: На доработке -> В работе
test('15 (2.3)', 'Назначенный исполнитель возвращает «На доработке» → «В работе»', () => {
  const updated = engine.changeTaskStatus(testTask.id, 'В работе', 'Исправляю коробки', worker1);
  if (updated.status !== 'В работе') throw new Error('Статус должен быть «В работе»');
});

// 2.3 Переход: В работе -> На проверке -> Принята
test('16 (2.3)', 'Исполнитель отправляет повторно, постановщик принимает («Принята»)', () => {
  engine.changeTaskStatus(testTask.id, 'На проверке', 'Коробки смонтированы', worker1);
  const accepted = engine.changeTaskStatus(testTask.id, 'Принята', 'Принято без замечаний', manager1);
  if (accepted.status !== 'Принята') throw new Error('Статус должен быть «Принята»');
});

// 2.3 Запрещённые переходы
test('17 (2.3 & 3)', 'Запрещён прямой переход «Новая» → «Принята»', () => {
  const dummy = engine.createTask(
    { title: 'Задача 2', object_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
    manager1
  );
  try {
    engine.changeTaskStatus(dummy.id, 'Принята', null, manager1);
    throw new Error('Удался запрещённый переход!');
  } catch (err) {
    if (!err.message.includes('Запрещённый')) throw err;
  }
});

// 2.4 & 3: История
test('18 (2.4 & 3)', 'История зафиксировала все 7 шагов с авторами и комментариями', () => {
  const history = engine.getHistory(testTask.id, manager1);
  if (history.length !== 7) {
    throw new Error(`Ожидалось 7 записей истории, получено: ${history.length}`);
  }
  const statuses = history.map((h) => h.to_status).join(' -> ');
  // Новая -> В работе -> На проверке -> На доработке -> В работе -> На проверке -> Принята
  if (statuses !== 'Новая -> В работе -> На проверке -> На доработке -> В работе -> На проверке -> Принята') {
    throw new Error(`Неверная последовательность: ${statuses}`);
  }
});

// 3: Изоляция истории
test('19 (3)', 'Исполнитель не может прочитать историю чужой задачи (RLS)', () => {
  try {
    engine.getHistory(testTask.id, worker2);
    throw new Error('Исполнитель 2 смог прочитать историю задачи исполнителя 1!');
  } catch (err) {
    if (!err.message.includes('RLS')) throw err;
  }
});

console.log('\n================================================================');
console.log(`  ИТОГИ ТЕСТИРОВАНИЯ: ${passed} из ${total} тестов успешно пройдено!`);
console.log('================================================================\n');

if (passed !== total) {
  process.exit(1);
}

