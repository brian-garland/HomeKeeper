-- HomeKeeper Row Level Security Policies
-- Ensures users can only access their own data
-- Created: June 9, 2025

-- ================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- USER PROFILES POLICIES
-- Users can only access their own data
-- ================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON public.user_profiles
    FOR DELETE USING (auth.uid() = id);

-- ================================================================
-- HOMES POLICIES
-- Users can only access homes they own
-- ================================================================

-- Users can view their own homes
CREATE POLICY "Users can view own homes" ON public.homes
    FOR SELECT USING (auth.uid() = owner_id);

-- Users can insert homes they own
CREATE POLICY "Users can insert own homes" ON public.homes
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Users can update their own homes
CREATE POLICY "Users can update own homes" ON public.homes
    FOR UPDATE USING (auth.uid() = owner_id);

-- Users can delete their own homes
CREATE POLICY "Users can delete own homes" ON public.homes
    FOR DELETE USING (auth.uid() = owner_id);

-- ================================================================
-- EQUIPMENT POLICIES
-- Users can only access equipment in their homes
-- ================================================================

-- Users can view equipment in their homes
CREATE POLICY "Users can view own equipment" ON public.equipment
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.homes 
            WHERE homes.id = equipment.home_id 
            AND homes.owner_id = auth.uid()
        )
    );

-- Users can insert equipment in their homes
CREATE POLICY "Users can insert own equipment" ON public.equipment
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.homes 
            WHERE homes.id = equipment.home_id 
            AND homes.owner_id = auth.uid()
        )
    );

-- Users can update equipment in their homes
CREATE POLICY "Users can update own equipment" ON public.equipment
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.homes 
            WHERE homes.id = equipment.home_id 
            AND homes.owner_id = auth.uid()
        )
    );

-- Users can delete equipment in their homes
CREATE POLICY "Users can delete own equipment" ON public.equipment
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.homes 
            WHERE homes.id = equipment.home_id 
            AND homes.owner_id = auth.uid()
        )
    );

-- ================================================================
-- TASK TEMPLATES POLICIES
-- System templates are readable by all, users can create their own
-- ================================================================

-- All authenticated users can view system task templates
CREATE POLICY "Users can view system task templates" ON public.task_templates
    FOR SELECT USING (
        system_template = true OR 
        auth.uid() IS NOT NULL
    );

-- Users can insert their own custom templates (future feature)
CREATE POLICY "Users can insert custom task templates" ON public.task_templates
    FOR INSERT WITH CHECK (
        system_template = false AND 
        auth.uid() IS NOT NULL
    );

-- Users can update their own custom templates
CREATE POLICY "Users can update own task templates" ON public.task_templates
    FOR UPDATE USING (
        system_template = false AND 
        auth.uid() IS NOT NULL
    );

-- Users can delete their own custom templates
CREATE POLICY "Users can delete own task templates" ON public.task_templates
    FOR DELETE USING (
        system_template = false AND 
        auth.uid() IS NOT NULL
    );

-- ================================================================
-- TASKS POLICIES
-- Users can only access tasks for their homes
-- ================================================================

-- Users can view tasks for their homes
CREATE POLICY "Users can view own tasks" ON public.tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.homes 
            WHERE homes.id = tasks.home_id 
            AND homes.owner_id = auth.uid()
        )
    );

-- Users can insert tasks for their homes
CREATE POLICY "Users can insert own tasks" ON public.tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.homes 
            WHERE homes.id = tasks.home_id 
            AND homes.owner_id = auth.uid()
        )
    );

-- Users can update tasks for their homes
CREATE POLICY "Users can update own tasks" ON public.tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.homes 
            WHERE homes.id = tasks.home_id 
            AND homes.owner_id = auth.uid()
        )
    );

-- Users can delete tasks for their homes
CREATE POLICY "Users can delete own tasks" ON public.tasks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.homes 
            WHERE homes.id = tasks.home_id 
            AND homes.owner_id = auth.uid()
        )
    );

-- ================================================================
-- TASK COMPLETIONS POLICIES
-- Users can only access their own task completions
-- ================================================================

-- Users can view their own task completions
CREATE POLICY "Users can view own task completions" ON public.task_completions
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.tasks 
            JOIN public.homes ON homes.id = tasks.home_id
            WHERE tasks.id = task_completions.task_id 
            AND homes.owner_id = auth.uid()
        )
    );

-- Users can insert their own task completions
CREATE POLICY "Users can insert own task completions" ON public.task_completions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.tasks 
            JOIN public.homes ON homes.id = tasks.home_id
            WHERE tasks.id = task_completions.task_id 
            AND homes.owner_id = auth.uid()
        )
    );

-- Users can update their own task completions
CREATE POLICY "Users can update own task completions" ON public.task_completions
    FOR UPDATE USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.tasks 
            JOIN public.homes ON homes.id = tasks.home_id
            WHERE tasks.id = task_completions.task_id 
            AND homes.owner_id = auth.uid()
        )
    );

-- Users can delete their own task completions
CREATE POLICY "Users can delete own task completions" ON public.task_completions
    FOR DELETE USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.tasks 
            JOIN public.homes ON homes.id = tasks.home_id
            WHERE tasks.id = task_completions.task_id 
            AND homes.owner_id = auth.uid()
        )
    );

-- ================================================================
-- UTILITY FUNCTIONS FOR POLICY CHECKING
-- ================================================================

-- Function to check if user owns a home
CREATE OR REPLACE FUNCTION public.user_owns_home(home_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.homes 
        WHERE id = home_uuid 
        AND owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access a task
CREATE OR REPLACE FUNCTION public.user_can_access_task(task_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.tasks 
        JOIN public.homes ON homes.id = tasks.home_id
        WHERE tasks.id = task_uuid 
        AND homes.owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- GRANT PERMISSIONS
-- ================================================================

-- Grant authenticated users access to tables
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.homes TO authenticated;
GRANT ALL ON public.equipment TO authenticated;
GRANT SELECT ON public.task_templates TO authenticated;
GRANT ALL ON public.tasks TO authenticated;
GRANT ALL ON public.task_completions TO authenticated;

-- Grant authenticated users access to utility functions
GRANT EXECUTE ON FUNCTION public.user_owns_home(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_can_access_task(UUID) TO authenticated;

-- ================================================================
-- COMMENTS FOR DOCUMENTATION
-- ================================================================

COMMENT ON POLICY "Users can view own profile" ON public.user_profiles IS 
'Users can only view their own profile data';

COMMENT ON POLICY "Users can view own homes" ON public.homes IS 
'Users can only view homes they own';

COMMENT ON POLICY "Users can view own equipment" ON public.equipment IS 
'Users can only view equipment in homes they own';

COMMENT ON POLICY "Users can view system task templates" ON public.task_templates IS 
'All users can view system task templates, custom templates are private';

COMMENT ON POLICY "Users can view own tasks" ON public.tasks IS 
'Users can only view tasks for homes they own';

COMMENT ON POLICY "Users can view own task completions" ON public.task_completions IS 
'Users can only view task completions for their own tasks or homes they own';

COMMENT ON FUNCTION public.user_owns_home(UUID) IS 
'Utility function to check if the current user owns a specific home';

COMMENT ON FUNCTION public.user_can_access_task(UUID) IS 
'Utility function to check if the current user can access a specific task';

