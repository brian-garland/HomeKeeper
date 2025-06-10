-- HomeKeeper Database Schema
-- Supabase PostgreSQL with Row Level Security
-- Created: June 9, 2025

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ================================================================
-- USER PROFILES (extends auth.users)
-- ================================================================
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Profile Information
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    
    -- Preferences
    notification_preferences JSONB DEFAULT '{
        "email_notifications": true,
        "push_notifications": true,
        "task_reminders": true,
        "weekly_summary": true
    }'::jsonb,
    
    -- App Settings
    preferred_units TEXT DEFAULT 'imperial', -- 'imperial' or 'metric'
    timezone TEXT DEFAULT 'America/New_York',
    
    -- Privacy Settings
    share_with_neighbors BOOLEAN DEFAULT false,
    share_completion_stats BOOLEAN DEFAULT false,
    
    -- Metadata
    onboarding_completed BOOLEAN DEFAULT false,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- HOMES
-- ================================================================
CREATE TABLE public.homes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ownership
    owner_id UUID REFERENCES public.user_profiles(id) NOT NULL,
    
    -- Basic Information
    name TEXT NOT NULL DEFAULT 'My Home',
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'United States',
    
    -- Geographic Data
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location GEOGRAPHY(POINT),
    
    -- Property Details
    home_type TEXT CHECK (home_type IN ('house', 'apartment', 'condo', 'townhouse', 'other')),
    year_built INTEGER CHECK (year_built > 1800 AND year_built <= EXTRACT(YEAR FROM NOW())),
    square_footage INTEGER CHECK (square_footage > 0),
    lot_size DECIMAL(10, 2),
    bedrooms INTEGER CHECK (bedrooms >= 0),
    bathrooms DECIMAL(3, 1) CHECK (bathrooms >= 0),
    floors INTEGER DEFAULT 1 CHECK (floors > 0),
    
    -- Systems Information
    heating_type TEXT, -- 'gas', 'electric', 'oil', 'heat_pump', 'other'
    cooling_type TEXT, -- 'central_air', 'window_units', 'none', 'other'
    water_heater_type TEXT, -- 'gas', 'electric', 'tankless', 'solar', 'other'
    
    -- Maintenance Settings
    maintenance_season_start INTEGER DEFAULT 3 CHECK (maintenance_season_start BETWEEN 1 AND 12), -- March
    high_maintenance_mode BOOLEAN DEFAULT false,
    
    -- Metadata
    photo_url TEXT,
    notes TEXT,
    active BOOLEAN DEFAULT true
);

-- ================================================================
-- EQUIPMENT
-- ================================================================
CREATE TABLE public.equipment (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ownership
    home_id UUID REFERENCES public.homes(id) ON DELETE CASCADE NOT NULL,
    
    -- Basic Information
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'hvac', 'plumbing', 'electrical', 'appliance', 'exterior', 'other'
    type TEXT NOT NULL, -- 'furnace', 'air_conditioner', 'water_heater', etc.
    
    -- Details
    brand TEXT,
    model TEXT,
    serial_number TEXT,
    purchase_date DATE,
    install_date DATE,
    warranty_expires DATE,
    
    -- Specifications
    specifications JSONB DEFAULT '{}'::jsonb, -- Flexible storage for equipment-specific data
    
    -- Location
    location TEXT, -- 'basement', 'attic', 'garage', 'kitchen', etc.
    room TEXT,
    
    -- Maintenance
    maintenance_frequency_months INTEGER DEFAULT 12,
    last_service_date DATE,
    next_service_due DATE,
    
    -- Documentation
    photo_urls TEXT[],
    manual_url TEXT,
    notes TEXT,
    
    -- Status
    active BOOLEAN DEFAULT true,
    needs_attention BOOLEAN DEFAULT false
);

-- ================================================================
-- TASK TEMPLATES
-- ================================================================
CREATE TABLE public.task_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Basic Information
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'hvac', 'plumbing', 'electrical', 'general', etc.
    
    -- Scheduling
    frequency_type TEXT CHECK (frequency_type IN ('monthly', 'quarterly', 'biannual', 'annual', 'as_needed')),
    frequency_months INTEGER, -- How many months between tasks
    seasonal_months INTEGER[], -- Specific months for seasonal tasks [3,6,9,12]
    
    -- Task Details
    estimated_duration_minutes INTEGER DEFAULT 30,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5) DEFAULT 2,
    tools_needed TEXT[],
    materials_needed TEXT[],
    
    -- Instructions
    instructions JSONB DEFAULT '{
        "steps": [],
        "safety_notes": [],
        "tips": []
    }'::jsonb,
    
    -- Conditional Logic
    applies_to_home_types TEXT[], -- When this task applies to specific home types
    applies_to_equipment_types TEXT[], -- When this task applies to specific equipment
    climate_conditions TEXT[], -- When this task applies to specific climates
    
    -- Educational Content
    why_important TEXT,
    consequences_if_skipped TEXT,
    money_saved_estimate DECIMAL(10, 2),
    
    -- Metadata
    system_template BOOLEAN DEFAULT true, -- System-provided vs user-created
    active BOOLEAN DEFAULT true
);

-- ================================================================
-- TASKS (Individual maintenance tasks)
-- ================================================================
CREATE TABLE public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ownership
    home_id UUID REFERENCES public.homes(id) ON DELETE CASCADE NOT NULL,
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE SET NULL,
    template_id UUID REFERENCES public.task_templates(id) ON DELETE SET NULL,
    
    -- Task Information
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    
    -- Scheduling
    due_date DATE NOT NULL,
    priority INTEGER CHECK (priority BETWEEN 1 AND 5) DEFAULT 3,
    
    -- Task Details
    estimated_duration_minutes INTEGER DEFAULT 30,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5) DEFAULT 2,
    
    -- Instructions (copied from template or custom)
    instructions JSONB DEFAULT '{
        "steps": [],
        "safety_notes": [],
        "tips": []
    }'::jsonb,
    
    -- Status
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'overdue')) DEFAULT 'pending',
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES public.user_profiles(id),
    
    -- Scheduling Intelligence
    auto_generated BOOLEAN DEFAULT false,
    reschedule_count INTEGER DEFAULT 0,
    weather_dependent BOOLEAN DEFAULT false,
    
    -- Metadata
    notes TEXT,
    tags TEXT[]
);

-- ================================================================
-- TASK COMPLETIONS (Tracking and photos)
-- ================================================================
CREATE TABLE public.task_completions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- References
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) NOT NULL,
    
    -- Completion Details
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actual_duration_minutes INTEGER,
    difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
    
    -- Documentation
    photo_urls TEXT[],
    notes TEXT,
    
    -- Issues and Follow-ups
    issues_found TEXT,
    follow_up_needed BOOLEAN DEFAULT false,
    follow_up_notes TEXT,
    
    -- Cost Tracking
    cost_materials DECIMAL(10, 2) DEFAULT 0,
    cost_labor DECIMAL(10, 2) DEFAULT 0,
    
    -- Rating
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5)
);

-- ================================================================
-- INDEXES for Performance
-- ================================================================

-- User Profiles
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_last_active ON public.user_profiles(last_active_at);

-- Homes
CREATE INDEX idx_homes_owner ON public.homes(owner_id);
CREATE INDEX idx_homes_location ON public.homes USING GIST(location);
CREATE INDEX idx_homes_zip ON public.homes(zip_code);

-- Equipment
CREATE INDEX idx_equipment_home ON public.equipment(home_id);
CREATE INDEX idx_equipment_category ON public.equipment(category);
CREATE INDEX idx_equipment_next_service ON public.equipment(next_service_due);

-- Task Templates
CREATE INDEX idx_task_templates_category ON public.task_templates(category);
CREATE INDEX idx_task_templates_frequency ON public.task_templates(frequency_type);

-- Tasks
CREATE INDEX idx_tasks_home ON public.tasks(home_id);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_category ON public.tasks(category);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_equipment ON public.tasks(equipment_id);

-- Task Completions
CREATE INDEX idx_task_completions_task ON public.task_completions(task_id);
CREATE INDEX idx_task_completions_user ON public.task_completions(user_id);
CREATE INDEX idx_task_completions_date ON public.task_completions(completed_at);

-- ================================================================
-- TRIGGERS for Automatic Updates
-- ================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_homes_updated_at BEFORE UPDATE ON public.homes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_templates_updated_at BEFORE UPDATE ON public.task_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update location field when lat/lng changes
CREATE OR REPLACE FUNCTION update_home_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_home_location_trigger 
    BEFORE INSERT OR UPDATE ON public.homes 
    FOR EACH ROW EXECUTE FUNCTION update_home_location();

-- ================================================================
-- SAMPLE DATA (for testing)
-- ================================================================

-- Insert sample task templates
INSERT INTO public.task_templates (title, description, category, frequency_type, frequency_months, estimated_duration_minutes, difficulty_level, instructions, why_important) VALUES
('Change HVAC Filter', 'Replace heating and cooling system air filter', 'hvac', 'quarterly', 3, 15, 1, 
 '{"steps": ["Turn off HVAC system", "Locate filter compartment", "Remove old filter", "Insert new filter with airflow arrow pointing toward unit", "Turn system back on"], "safety_notes": ["Ensure system is off before starting"], "tips": ["Write installation date on filter frame"]}',
 'Clean filters improve air quality and system efficiency'),
 
('Test Smoke Detectors', 'Test all smoke detectors and replace batteries if needed', 'safety', 'monthly', 1, 20, 1,
 '{"steps": ["Press test button on each detector", "Listen for loud beep", "Replace batteries if beep is weak", "Record test date"], "safety_notes": ["Test monthly for optimal safety"], "tips": ["Replace batteries annually even if they seem fine"]}',
 'Working smoke detectors save lives and are required by law'),
 
('Clean Gutters', 'Remove leaves and debris from gutters and downspouts', 'exterior', 'biannual', 6, 120, 3,
 '{"steps": ["Set up ladder safely", "Remove debris by hand", "Flush with water", "Check for damage", "Clear downspouts"], "safety_notes": ["Use ladder safely", "Have someone spot you", "Avoid power lines"], "tips": ["Best done in spring and fall"]}',
 'Prevents water damage to foundation and roof');

COMMENT ON TABLE public.user_profiles IS 'Extended user profiles linked to Supabase auth';
COMMENT ON TABLE public.homes IS 'Property information and settings';
COMMENT ON TABLE public.equipment IS 'Home systems and appliances that require maintenance';
COMMENT ON TABLE public.task_templates IS 'Reusable maintenance task definitions';
COMMENT ON TABLE public.tasks IS 'Individual maintenance tasks assigned to homes';
COMMENT ON TABLE public.task_completions IS 'Records of completed maintenance tasks'; 