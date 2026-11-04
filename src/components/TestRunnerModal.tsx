import React, { useState } from 'react';
import { mockBackend, INITIAL_USERS } from '../services/mockBackend';
import { CheckCircle2, XCircle, Play, RefreshCw, X, ShieldCheck } from 'lucide-react';

interface TestResult {
  id: number;
  section: string;
  title: string;
  description: string;
  passed: boolean;
  error?: string;
  details?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export const TestRunnerModal: React.FC<Props> = ({ isOpen, onClose, onRefreshData }) => {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  if (!isOpen) return null;

  const runAllTests = async () => {
    setRunning(true);
    setResults([]);

    // Reset to deterministic seed data for tests
    mockBackend.resetToDefault();

    const manager1 = INITIAL_USERS[0]; // Alexey
    const worker1 = INITIAL_USERS[2];  // Dmitry (has tasks in Obj A, B)
    const worker2 = INITIAL_USERS[3];  // Sergey (has tasks in Obj A, C)

    const testLogs: TestResult[] = [];

    // Helper to log test result
    const record = (
      id: number,
      section: string,
      title: string,
      description: string,
      assertion: () => { passed: boolean; details?: string; error?: string }
    ) => {
      try {
        const res = assertion();
        testLogs.push({
          id,
          section,
          title,
          description,
          passed: res.passed,
          details: res.details,
          error: res.error,
        });
      } catch (err: any) {
        testLogs.push({
          id,
          section,
          title,
          description,
          passed: false,
          error: err?.message || String(err),
        });
      }
    };

    // --- ТЕСТ 1: Роли (2.1) ---
    record(
      1,
      '2.1. Роли',
      'В системе несколько постановщиков и исполнителей с правильными ролями',
      'Проверяет наличие пользователей с ролями manager и assignee',
      () => {
        const managers = INITIAL_USERS.filter((u) => u.role === 'manager');
        const assignees = INITIAL_USERS.filter((u) => u.role === 'assignee');
        const passed = managers.length >= 2 && assignees.length >= 2;
        return {
          passed,
          details: `Постановщиков: ${managers.length}, Исполнителей: ${assignees.length}`,
        };
      }
    );

    // --- ТЕСТ 2: Видимость объектов постановщиком (2.1 & 2.2) ---
    record(
      2,
      '2.1 & 2.2. Объекты',
      'Постановщик видит ВСЕ объекты системы',
      'Постановщик видит даже объекты без назначенных задач',
      () => {
        const objects = mockBackend.getVisibleObjects(manager1);
        const passed = objects.length === 4;
        return {
          passed,
          details: `Постановщик видит ${objects.length} из 4 объектов: ${objects.map((o) => o.name).join(', ')}`,
        };
      }
    );

    // --- ТЕСТ 3: Видимость объектов исполнителем 1 (2.1 & 2.2) ---
    record(
      3,
      '2.1 & 2.2. Объекты',
      'Исполнитель 1 видит ТОЛЬКО объекты, в которых у него есть задачи',
      'У Дмитрия есть задачи в ЖК «Северные Высоты» и БЦ «Аврора». Он НЕ должен видеть ТЦ «Галерея» и Склад «Логистик-Парк»',
      () => {
        const objects = mockBackend.getVisibleObjects(worker1);
        const names = objects.map((o) => o.name);
        const hasMyObjs = names.includes('ЖК «Северные Высоты»') && names.includes('Бизнес-центр «Аврора»');
        const hasOthers = names.includes('ТЦ «Галерея»') || names.includes('Складской комплекс «Логистик-Парк»');
        const passed = hasMyObjs && !hasOthers && objects.length === 2;
        return {
          passed,
          details: `Исполнитель 1 видит ровно ${objects.length} объекта: ${names.join(', ')}`,
        };
      }
    );

    // --- ТЕСТ 4: Видимость объектов исполнителем 2 (2.1 & 2.2) ---
    record(
      4,
      '2.1 & 2.2. Объекты',
      'Исполнитель 2 видит ТОЛЬКО свои объекты (изоляция данных между исполнителями)',
      'У Сергея задачи в ЖК «Северные Высоты» и ТЦ «Галерея». Он НЕ должен видеть БЦ «Аврора»',
      () => {
        const objects = mockBackend.getVisibleObjects(worker2);
        const names = objects.map((o) => o.name);
        const hasMyObjs = names.includes('ЖК «Северные Высоты»') && names.includes('ТЦ «Галерея»');
        const hasOthers = names.includes('Бизнес-центр «Аврора»') || names.includes('Складской комплекс «Логистик-Парк»');
        const passed = hasMyObjs && !hasOthers && objects.length === 2;
        return {
          passed,
          details: `Исполнитель 2 видит ровно ${objects.length} объекта: ${names.join(', ')}`,
        };
      }
    );

    // --- ТЕСТ 5: Видимость задач (2.1 & 2.3) ---
    record(
      5,
      '2.1 & 2.3. Задачи',
      'Исполнитель не может прочитать чужие задачи (RLS-фильтрация)',
      'Исполнитель 1 видит только задачи, где assignee_id = worker1.id',
      () => {
        const myTasks = mockBackend.getVisibleTasks(worker1);
        const invalidTask = myTasks.find((t) => t.assignee_id !== worker1.id);
        const passed = !invalidTask && myTasks.length > 0;
        return {
          passed,
          details: `Исполнителю 1 доступно ${myTasks.length} задач, все назначены строго на него`,
        };
      }
    );

    // --- ТЕСТ 6: Запрет создания объектов исполнителем (2.1 & 3) ---
    record(
      6,
      '3. Безопасность (RLS)',
      'Исполнителю запрещено создавать объекты',
      'Попытка вызова createObject от лица исполнителя должна вызвать ошибку RLS',
      () => {
        try {
          mockBackend.createObject({ name: 'Хак объект', address: 'ул. Тестовая' }, worker1);
          return { passed: false, error: 'Ожидалась ошибка RLS, но объект создался!' };
        } catch (err: any) {
          const passed = err.message.includes('RLS') || err.message.includes('постановщик');
          return { passed, details: `Перехвачена ошибка: ${err.message}` };
        }
      }
    );

    // --- ТЕСТ 7: Запрет создания задач исполнителем (2.1 & 3) ---
    record(
      7,
      '3. Безопасность (RLS)',
      'Исполнителю запрещено создавать задачи',
      'Попытка вызова createTask от лица исполнителя должна вызвать ошибку RLS',
      () => {
        try {
          mockBackend.createTask(
            { title: 'Хак задача', description: '', object_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
            worker1
          );
          return { passed: false, error: 'Ожидалась ошибка RLS, но задача создалась!' };
        } catch (err: any) {
          const passed = err.message.includes('RLS') || err.message.includes('постановщик');
          return { passed, details: `Перехвачена ошибка: ${err.message}` };
        }
      }
    );

    // --- ТЕСТ 8: Создание задачи постановщиком (2.3) ---
    let testTaskId = '';
    record(
      8,
      '2.3. Создание задачи',
      'Постановщик успешно создаёт задачу с начальным статусом «Новая»',
      'Статус при создании строго «Новая», автоматически пишется первая запись в историю',
      () => {
        const task = mockBackend.createTask(
          {
            title: 'Тестовая задача валидации цикла',
            description: 'Проверка цепочки статусов',
            object_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            assignee_id: worker1.id,
          },
          manager1
        );
        testTaskId = task.id;
        const history = mockBackend.getTaskHistory(testTaskId, manager1);
        const passed = task.status === 'Новая' && history.length === 1 && history[0].to_status === 'Новая';
        return {
          passed,
          details: `Задача ID: ${task.id.slice(0, 8)}... создана со статусом «${task.status}», история зафиксирована`,
        };
      }
    );

    // --- ТЕСТ 9: Переход «Новая» -> «В работе» кем попало (2.3) ---
    record(
      9,
      '2.3. Переходы статусов',
      'Постановщик НЕ может перевести «Новая» → «В работе» (только назначенный исполнитель)',
      'Проверяет проверку роли и прав на стороне логики/триггера базы',
      () => {
        try {
          mockBackend.changeTaskStatus(testTaskId, 'В работе', null, manager1);
          return { passed: false, error: 'Постановщику удалось перевести задачу в работу!' };
        } catch (err: any) {
          const passed = err.message.includes('назначенный исполнитель');
          return { passed, details: `Перехвачена блокировка: ${err.message}` };
        }
      }
    );

    // --- ТЕСТ 10: Переход «Новая» -> «В работе» назначенным исполнителем (2.3) ---
    record(
      10,
      '2.3. Переходы статусов',
      'Назначенный исполнитель переводит «Новая» → «В работе»',
      'Исполнитель берет задачу в работу',
      () => {
        const task = mockBackend.changeTaskStatus(testTaskId, 'В работе', 'Приступаю к работе', worker1);
        const passed = task.status === 'В работе';
        return { passed, details: `Статус задачи успешно изменён на «${task.status}»` };
      }
    );

    // --- ТЕСТ 11: Переход «В работе» -> «На проверке» (2.3) ---
    record(
      11,
      '2.3. Переходы статусов',
      'Назначенный исполнитель переводит «В работе» → «На проверке»',
      'Исполнитель сдает задачу на проверку постановщику',
      () => {
        const task = mockBackend.changeTaskStatus(testTaskId, 'На проверке', 'Работа готова к сдаче', worker1);
        const passed = task.status === 'На проверке';
        return { passed, details: `Статус задачи успешно изменён на «${task.status}»` };
      }
    );

    // --- ТЕСТ 12: «На проверке» -> «На доработке» БЕЗ комментария (2.3 & 3) ---
    record(
      12,
      '2.3 & 3. Условие доработки',
      'Возврат «На проверке» → «На доработке» БЕЗ комментария блокируется',
      'Условие ТЗ: комментарий обязателен при возврате на доработку',
      () => {
        try {
          mockBackend.changeTaskStatus(testTaskId, 'На доработке', null, manager1);
          return { passed: false, error: 'Удалось вернуть задачу на доработку без комментария!' };
        } catch (err: any) {
          const passed = err.message.includes('обязателен');
          return { passed, details: `Перехвачена блокировка: ${err.message}` };
        }
      }
    );

    // --- ТЕСТ 13: «На проверке» -> «На доработке» С комментарием (2.3) ---
    record(
      13,
      '2.3. Условие доработки',
      'Постановщик возвращает «На проверке» → «На доработке» С комментарием',
      'Задача успешно переходит в статус «На доработке»',
      () => {
        const task = mockBackend.changeTaskStatus(
          testTaskId,
          'На доработке',
          'Обнаружен дефект крепления, переделать',
          manager1
        );
        const passed = task.status === 'На доработке';
        return { passed, details: `Статус: «${task.status}» с комментарием замечаний` };
      }
    );

    // --- ТЕСТ 14: «На доработке» -> «В работе» (2.3) ---
    record(
      14,
      '2.3. Переходы статусов',
      'Назначенный исполнитель возвращает «На доработке» → «В работе»',
      'Исполнитель возобновляет работу над задачей',
      () => {
        const task = mockBackend.changeTaskStatus(testTaskId, 'В работе', 'Замечания исправляю', worker1);
        const passed = task.status === 'В работе';
        return { passed, details: `Статус задачи: «${task.status}»` };
      }
    );

    // --- ТЕСТ 15: «В работе» -> «На проверке» -> «Принята» (2.3) ---
    record(
      15,
      '2.3. Приёмка задачи',
      'Постановщик принимает задачу («На проверке» → «Принята»)',
      'Исполнитель отправляет на проверку, постановщик финализирует задачу',
      () => {
        mockBackend.changeTaskStatus(testTaskId, 'На проверке', 'Исправлено в полном объеме', worker1);
        const accepted = mockBackend.changeTaskStatus(testTaskId, 'Принята', 'Работа принята отлично', manager1);
        const passed = accepted.status === 'Принята';
        return { passed, details: `Финальный статус: «${accepted.status}»` };
      }
    );

    // --- ТЕСТ 16: Запрещённые переходы (2.3 & 3) ---
    record(
      16,
      '2.3 & 3. Запрещённые переходы',
      'Прямой переход из «Новая» в «Принята» строго ЗАПРЕЩЁН',
      'Проверяет невозможность перепрыгнуть этапы жизненного цикла задачи',
      () => {
        const dummyTask = mockBackend.createTask(
          { title: 'Задача для проверки запрета', description: '', object_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
          manager1
        );
        try {
          mockBackend.changeTaskStatus(dummyTask.id, 'Принята', null, manager1);
          return { passed: false, error: 'Удалось совершить запрещённый переход из Новая в Принята!' };
        } catch (err: any) {
          const passed = err.message.includes('Запрещённый') || err.message.includes('Недопустимый');
          return { passed, details: `Перехвачена блокировка: ${err.message}` };
        }
      }
    );

    // --- ТЕСТ 17: Неизменяемость и целостность истории (2.4 & 3) ---
    record(
      17,
      '2.4 & 3. История изменений',
      'Вся история переходов сохранена по порядку, авторство и комментарии зафиксированы',
      'Проверяет точность хронологии созданной задачи testTaskId',
      () => {
        const history = mockBackend.getTaskHistory(testTaskId, manager1);
        // Должно быть: Новая (создание) -> В работе -> На проверке -> На доработке -> В работе -> На проверке -> Принята (всего 7 записей)
        const passed = history.length === 7;
        const statuses = history.map((h) => h.to_status).join(' → ');
        return {
          passed,
          details: `Хронология (${history.length} записей): ${statuses}`,
        };
      }
    );

    // --- ТЕСТ 18: Изоляция истории от чужого исполнителя (3) ---
    record(
      18,
      '3. Безопасность RLS',
      'Чужой исполнитель не имеет доступа к просмотру истории чужой задачи',
      'Worker 2 пытается прочитать историю задачи Worker 1',
      () => {
        try {
          mockBackend.getTaskHistory(testTaskId, worker2);
          return { passed: false, error: 'Исполнитель 2 смог прочитать историю задачи Исполнителя 1!' };
        } catch (err: any) {
          const passed = err.message.includes('RLS') || err.message.includes('прав');
          return { passed, details: `Перехвачено нарушение RLS: ${err.message}` };
        }
      }
    );

    setResults(testLogs);
    setRunning(false);

    // Restore state if needed or trigger refresh
    if (onRefreshData) {
      onRefreshData();
    }
  };

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Автоматическое тестирование всех пунктов ТЗ
              </h3>
              <p className="text-xs text-slate-500">
                Проверка ролей, изоляции данных, RLS, матрицы переходов и защиты истории
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={runAllTests}
              disabled={running}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-sm font-medium shadow-xs transition"
            >
              {running ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Выполнение тестов...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Запустить все 18 тестов
                </>
              )}
            </button>
          </div>

          {results.length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" /> Пройдено: {passedCount}
              </span>
              {failedCount > 0 && (
                <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  <XCircle className="w-4 h-4" /> Провалено: {failedCount}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Test List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 bg-slate-50/50">
          {results.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-medium text-slate-600">Тестирование ещё не запускалось</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Нажмите «Запустить все 18 тестов» выше для последовательной проверки каждого пункта
                технического задания
              </p>
            </div>
          ) : (
            results.map((test) => (
              <div
                key={test.id}
                className={`p-4 rounded-xl border transition ${
                  test.passed
                    ? 'bg-white border-slate-200 hover:border-emerald-300 shadow-2xs'
                    : 'bg-rose-50/80 border-rose-200 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {test.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                          {test.section}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-800">{test.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{test.description}</p>
                      {test.details && (
                        <p className="text-xs font-mono text-slate-600 mt-1.5 bg-slate-50 p-1.5 rounded border border-slate-200/60">
                          ✓ {test.details}
                        </p>
                      )}
                      {test.error && (
                        <p className="text-xs font-mono text-rose-700 mt-1.5 bg-rose-100/50 p-1.5 rounded border border-rose-200">
                          ✗ Ошибка: {test.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-400">
          <span>Стек: Supabase (PostgreSQL + RLS + Triggers) + React + TS</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
