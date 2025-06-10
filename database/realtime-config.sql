-- HomeKeeper Real-Time Configuration
-- Enables real-time subscriptions for live data synchronization
-- Created: June 9, 2025

-- ================================================================
-- ENABLE REAL-TIME ON CORE TABLES
-- ================================================================

-- Enable real-time for user profiles (for live preference updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;

-- Enable real-time for homes (for live home information updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.homes;

-- Enable real-time for equipment (for live equipment status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.equipment;

-- Enable real-time for tasks (for live task updates - the most important!)
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- Enable real-time for task completions (for live completion celebrations)
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_completions;

-- NOTE: We're NOT enabling real-time for task_templates because they rarely change
-- and we don't need live updates for system templates

-- ================================================================
-- CONFIGURE REAL-TIME FILTERS (Optional - for future optimization)
-- ================================================================

-- These comments show how we could add filters later for performance:

-- For tasks: Only broadcast changes to tasks for homes the user owns
-- This will be handled by RLS policies automatically

-- For completions: Only broadcast task completions for relevant homes
-- This will also be handled by RLS policies automatically

-- ================================================================
-- VERIFY REAL-TIME SETUP
-- ================================================================

-- Query to check which tables have real-time enabled
-- (Run this to verify the configuration worked)
SELECT 
    schemaname,
    tablename,
    'Real-time enabled' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND schemaname = 'public'
ORDER BY tablename;

-- ================================================================
-- COMMENTS FOR DOCUMENTATION
-- ================================================================

COMMENT ON PUBLICATION supabase_realtime IS 
'Real-time publication for HomeKeeper tables to enable live data synchronization';

-- ================================================================
-- REAL-TIME USE CASES IN HOMEKEEPER
-- ================================================================

/*
TASK UPDATES:
- When user completes a task on mobile → instantly appears on web/other devices
- When task due dates change → all connected devices update immediately
- When new tasks are generated → appear in real-time

EQUIPMENT UPDATES:
- When equipment needs attention → status updates instantly
- When maintenance is completed → equipment status clears immediately

HOME UPDATES:
- When home preferences change → apply immediately across devices
- When new equipment is added → appears in equipment list instantly

TASK COMPLETIONS:
- When task is completed → celebration appears immediately
- When completion photos are added → display instantly
- When completion notes are saved → sync immediately

COLLABORATIVE FEATURES (Future):
- Family members see each other's completions in real-time
- Shared home management updates appear instantly
- Community insights update live based on neighborhood activity
*/ 