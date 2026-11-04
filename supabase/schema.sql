-- ============================================================================
-- МИНИ-CRM «ОБЪЕКТЫ И ЗАДАЧИ» — СХЕМА БАЗЫ ДАННЫХ SUPABASE (POSTGRESQL)
-- ============================================================================

-- 1. ТИПЫ ДАННЫХ
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('manager', 'assignee');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM ('Новая', 'В работе', 'На проверке', 'Принята', 'На доработке');
    END IF;
END $$;

-- 2. ТАБЛИЦА ПРОФИЛЕЙ (СВЯЗЬ С auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. ТАБЛИЦА ОБЪЕКТОВ (СТРОЙКИ)
CREATE TABLE IF NOT EXISTS public.objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. ТАБЛИЦА ЗАДАЧ
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    object_id UUID NOT NULL REFERENCES public.objects(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    status task_status NOT NULL DEFAULT 'Новая',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. ТАБЛИЦА ИСТОРИИ ЗАДАЧ
CREATE TABLE IF NOT EXISTS public.task_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    from_status task_status, -- NULL при создании задачи
    to_status task_status NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
CREATE INDEX IF NOT EXISTS idx_tasks_object_id ON public.tasks(object_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_task_history_task_id ON public.task_history(task_id);
CREATE INDEX IF NOT EXISTS idx_task_history_created_at ON public.task_history(created_at ASC);

-- ============================================================================
-- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ БЕЗОПАСНОСТИ (SECURITY DEFINER)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'manager'
    );
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) ПОЛИТИКИ
-- ============================================================================

-- Включаем RLS на всех таблицах
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- ПОЛИТИКИ ДЛЯ profiles
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated users"
ON public.profiles FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Profiles cannot be inserted directly by users" ON public.profiles;
CREATE POLICY "Profiles cannot be inserted directly by users"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS "Profiles cannot be modified by users" ON public.profiles;
CREATE POLICY "Profiles cannot be modified by users"
ON public.profiles FOR UPDATE TO authenticated
USING (false);

-- ----------------------------------------------------------------------------
-- ПОЛИТИКИ ДЛЯ objects
-- Постановщик видит всё.
-- Исполнитель видит только объекты, в которых у него есть назначенные задачи.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Objects select policy" ON public.objects;
CREATE POLICY "Objects select policy"
ON public.objects FOR SELECT TO authenticated
USING (
    public.is_manager()
    OR
    EXISTS (
        SELECT 1 FROM public.tasks
        WHERE tasks.object_id = objects.id
          AND tasks.assignee_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Managers can insert objects" ON public.objects;
CREATE POLICY "Managers can insert objects"
ON public.objects FOR INSERT TO authenticated
WITH CHECK (public.is_manager());

DROP POLICY IF EXISTS "Managers can update objects" ON public.objects;
CREATE POLICY "Managers can update objects"
ON public.objects FOR UPDATE TO authenticated
USING (public.is_manager())
WITH CHECK (public.is_manager());

DROP POLICY IF EXISTS "Managers can delete objects" ON public.objects;
CREATE POLICY "Managers can delete objects"
ON public.objects FOR DELETE TO authenticated
USING (public.is_manager());

-- ----------------------------------------------------------------------------
-- ПОЛИТИКИ ДЛЯ tasks
-- Постановщик видит все задачи, исполнитель — только свои (assignee_id = auth.uid()).
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Tasks select policy" ON public.tasks;
CREATE POLICY "Tasks select policy"
ON public.tasks FOR SELECT TO authenticated
USING (
    public.is_manager()
    OR
    assignee_id = auth.uid()
);

DROP POLICY IF EXISTS "Managers can insert tasks" ON public.tasks;
CREATE POLICY "Managers can insert tasks"
ON public.tasks FOR INSERT TO authenticated
WITH CHECK (
    public.is_manager()
    AND author_id = auth.uid()
    AND status = 'Новая'
);

DROP POLICY IF EXISTS "Tasks update policy" ON public.tasks;
CREATE POLICY "Tasks update policy"
ON public.tasks FOR UPDATE TO authenticated
USING (
    public.is_manager()
    OR
    assignee_id = auth.uid()
)
WITH CHECK (
    public.is_manager()
    OR
    (
        assignee_id = auth.uid()
        AND author_id = author_id
        AND object_id = object_id
        AND title = title
        AND description IS NOT DISTINCT FROM description
    )
);

DROP POLICY IF EXISTS "Managers can delete tasks" ON public.tasks;
CREATE POLICY "Managers can delete tasks"
ON public.tasks FOR DELETE TO authenticated
USING (public.is_manager());

-- ----------------------------------------------------------------------------
-- ПОЛИТИКИ ДЛЯ task_history
-- Постановщик видит всю историю.
-- Исполнитель видит историю только своих задач.
-- Историю НЕЛЬЗЯ вставить, изменить или удалить напрямую через API!
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Task history select policy" ON public.task_history;
CREATE POLICY "Task history select policy"
ON public.task_history FOR SELECT TO authenticated
USING (
    public.is_manager()
    OR
    EXISTS (
        SELECT 1 FROM public.tasks
        WHERE tasks.id = task_history.task_id
          AND tasks.assignee_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Task history direct insert forbidden" ON public.task_history;
CREATE POLICY "Task history direct insert forbidden"
ON public.task_history FOR INSERT TO authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS "Task history direct update forbidden" ON public.task_history;
CREATE POLICY "Task history direct update forbidden"
ON public.task_history FOR UPDATE TO authenticated
USING (false);

DROP POLICY IF EXISTS "Task history direct delete forbidden" ON public.task_history;
CREATE POLICY "Task history direct delete forbidden"
ON public.task_history FOR DELETE TO authenticated
USING (false);

-- ============================================================================
-- БИЗНЕС-ЛОГИКА ПЕРЕХОДОВ СТАТУСОВ И АВТОМАТИЧЕСКАЯ ИСТОРИЯ
-- ============================================================================

-- Триггер при создании задачи: автозапись начального статуса в историю
CREATE OR REPLACE FUNCTION public.handle_task_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.task_history (task_id, user_id, from_status, to_status, comment)
    VALUES (NEW.id, NEW.author_id, NULL, NEW.status, 'Задача создана');
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_task_insert ON public.tasks;
CREATE TRIGGER trg_task_insert
AFTER INSERT ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.handle_task_insert();

-- Триггер при обновлении задачи: строгая валидация переходов статусов и запись в историю
CREATE OR REPLACE FUNCTION public.handle_task_status_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid UUID := auth.uid();
    v_role user_role;
    v_comment TEXT;
BEGIN
    -- Если статус изменился, проверяем правила перехода
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Получаем роль текущего пользователя
        SELECT role INTO v_role FROM public.profiles WHERE id = v_uid;
        
        -- Получаем комментарий из переменной сессии (если был передан через RPC)
        v_comment := NULLIF(trim(current_setting('app.task_comment', true)), '');

        -- Проверка матрицы разрешённых переходов:
        -- 1. Новая -> В работе (только назначенный исполнитель)
        IF OLD.status = 'Новая' AND NEW.status = 'В работе' THEN
            IF v_role != 'assignee' OR OLD.assignee_id IS DISTINCT FROM v_uid THEN
                RAISE EXCEPTION 'Только назначенный исполнитель может взять задачу в работу';
            END IF;

        -- 2. В работе -> На проверке (только назначенный исполнитель)
        ELSIF OLD.status = 'В работе' AND NEW.status = 'На проверке' THEN
            IF v_role != 'assignee' OR OLD.assignee_id IS DISTINCT FROM v_uid THEN
                RAISE EXCEPTION 'Только назначенный исполнитель может отправить задачу на проверку';
            END IF;

        -- 3. На проверке -> Принята (только постановщик)
        ELSIF OLD.status = 'На проверке' AND NEW.status = 'Принята' THEN
            IF v_role != 'manager' THEN
                RAISE EXCEPTION 'Только постановщик может принять задачу';
            END IF;

        -- 4. На проверке -> На доработке (только постановщик, комментарий обязателен!)
        ELSIF OLD.status = 'На проверке' AND NEW.status = 'На доработке' THEN
            IF v_role != 'manager' THEN
                RAISE EXCEPTION 'Только постановщик может вернуть задачу на доработку';
            END IF;
            IF v_comment IS NULL THEN
                RAISE EXCEPTION 'При возврате задачи на доработку комментарий обязателен';
            END IF;

        -- 5. На доработке -> В работе (только назначенный исполнитель)
        ELSIF OLD.status = 'На доработке' AND NEW.status = 'В работе' THEN
            IF v_role != 'assignee' OR OLD.assignee_id IS DISTINCT FROM v_uid THEN
                RAISE EXCEPTION 'Только назначенный исполнитель может вернуть задачу в работу';
            END IF;

        -- Все остальные переходы строго ЗАПРЕЩЕНЫ
        ELSE
            RAISE EXCEPTION 'Недопустимый переход статуса из "%" в "%"', OLD.status, NEW.status;
        END IF;

        -- Автоматически записываем переход в историю (подделать нельзя!)
        INSERT INTO public.task_history (task_id, user_id, from_status, to_status, comment)
        VALUES (NEW.id, COALESCE(v_uid, NEW.author_id), OLD.status, NEW.status, v_comment);
    END IF;

    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_task_status_update ON public.tasks;
CREATE TRIGGER trg_task_status_update
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.handle_task_status_update();

-- ============================================================================
-- RPC-ФУНКЦИЯ ДЛЯ СМЕНЫ СТАТУСА С КОММЕНТАРИЕМ
-- ============================================================================
CREATE OR REPLACE FUNCTION public.change_task_status(
    p_task_id UUID,
    p_new_status task_status,
    p_comment TEXT DEFAULT NULL
)
RETURNS public.tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_task public.tasks%ROWTYPE;
    v_clean_comment TEXT := NULLIF(trim(p_comment), '');
BEGIN
    -- Передаём комментарий в локальную конфигурацию транзакции для триггера
    IF v_clean_comment IS NOT NULL THEN
        PERFORM set_config('app.task_comment', v_clean_comment, true);
    ELSE
        PERFORM set_config('app.task_comment', '', true);
    END IF;

    -- Обновляем статус задачи. Сработает триггер trg_task_status_update,
    -- который выполнит все проверки прав и запишет историю
    UPDATE public.tasks
    SET status = p_new_status,
        updated_at = now()
    WHERE id = p_task_id
    RETURNING * INTO v_task;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Задача не найдена или нет прав на её изменение';
    END IF;

    RETURN v_task;
END;
$$;

GRANT EXECUTE ON FUNCTION public.change_task_status(UUID, task_status, TEXT) TO authenticated;

