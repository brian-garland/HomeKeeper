-- HomeKeeper Maintenance Table Migration
-- Adds maintenance tracking table to existing schema
-- Run this in Supabase SQL Editor

-- ================================================================
-- MAINTENANCE TABLE
-- ================================================================
CREATE TABLE public.maintenance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ownership
    home_id UUID REFERENCES public.homes(id) ON DELETE CASCADE NOT NULL,
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE SET NULL,
    
    -- Basic Information
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('hvac', 'plumbing', 'electrical', 'general', 'exterior', 'interior', 'appliance', 'safety')),
    
    -- Scheduling
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    
    -- Status
    status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'overdue')) DEFAULT 'scheduled',
    
    -- Cost Tracking
    estimated_cost DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),
    
    -- Service Provider
    vendor_name TEXT,
    vendor_contact TEXT,
    vendor_rating INTEGER CHECK (vendor_rating BETWEEN 1 AND 5),
    
    -- Documentation
    photo_urls TEXT[],
    receipt_urls TEXT[],
    notes TEXT,
    
    -- Maintenance Details
    maintenance_type TEXT CHECK (maintenance_type IN ('routine', 'repair', 'inspection', 'replacement', 'emergency')),
    priority INTEGER CHECK (priority BETWEEN 1 AND 5) DEFAULT 3,
    
    -- Metadata
    recurring BOOLEAN DEFAULT false,
    recurring_frequency_months INTEGER,
    next_due_date DATE,
    warranty_work BOOLEAN DEFAULT false,
    
    -- Status tracking
    active BOOLEAN DEFAULT true
);

-- ================================================================
-- INDEXES for Performance
-- ================================================================
CREATE INDEX idx_maintenance_home ON public.maintenance(home_id);
CREATE INDEX idx_maintenance_scheduled_date ON public.maintenance(scheduled_date);
CREATE INDEX idx_maintenance_status ON public.maintenance(status);
CREATE INDEX idx_maintenance_category ON public.maintenance(category);
CREATE INDEX idx_maintenance_next_due ON public.maintenance(next_due_date);

-- ================================================================
-- TRIGGERS
-- ================================================================

-- Update updated_at timestamp
CREATE TRIGGER update_maintenance_updated_at 
    BEFORE UPDATE ON public.maintenance 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update status to overdue
CREATE OR REPLACE FUNCTION update_maintenance_overdue_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update status to overdue if scheduled date has passed and status is still scheduled
    UPDATE public.maintenance 
    SET status = 'overdue'
    WHERE scheduled_date < CURRENT_DATE 
    AND status = 'scheduled';
    
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Run overdue check daily (this would typically be a cron job)
-- For now, we'll trigger it on any maintenance table update
CREATE TRIGGER check_overdue_maintenance
    AFTER INSERT OR UPDATE ON public.maintenance
    FOR EACH STATEMENT EXECUTE FUNCTION update_maintenance_overdue_status();

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

-- Enable RLS
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see maintenance for their own homes
CREATE POLICY "Users can view their own maintenance" ON public.maintenance
    FOR SELECT USING (
        home_id IN (
            SELECT id FROM public.homes 
            WHERE owner_id = auth.uid()
        )
    );

-- Policy: Users can insert maintenance for their own homes
CREATE POLICY "Users can insert maintenance for their homes" ON public.maintenance
    FOR INSERT WITH CHECK (
        home_id IN (
            SELECT id FROM public.homes 
            WHERE owner_id = auth.uid()
        )
    );

-- Policy: Users can update their own maintenance
CREATE POLICY "Users can update their own maintenance" ON public.maintenance
    FOR UPDATE USING (
        home_id IN (
            SELECT id FROM public.homes 
            WHERE owner_id = auth.uid()
        )
    );

-- Policy: Users can delete their own maintenance
CREATE POLICY "Users can delete their own maintenance" ON public.maintenance
    FOR DELETE USING (
        home_id IN (
            SELECT id FROM public.homes 
            WHERE owner_id = auth.uid()
        )
    );

-- ================================================================
-- ENABLE REAL-TIME
-- ================================================================

-- Add maintenance table to real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance;

-- ================================================================
-- SAMPLE DATA (for testing)
-- ================================================================

-- Insert sample maintenance records (only if you have homes in your database)
-- Uncomment and modify the home_id values to match your actual home IDs

/*
INSERT INTO public.maintenance (home_id, title, description, category, scheduled_date, status, estimated_cost, vendor_name, maintenance_type, priority) VALUES
    (
        (SELECT id FROM public.homes LIMIT 1), -- Gets first home ID
        'HVAC System Service',
        'Annual HVAC system maintenance and inspection',
        'hvac',
        CURRENT_DATE + INTERVAL '7 days',
        'scheduled',
        150.00,
        'ABC HVAC Services',
        'routine',
        2
    ),
    (
        (SELECT id FROM public.homes LIMIT 1),
        'Plumbing Inspection',
        'Check all faucets, pipes, and water pressure',
        'plumbing',
        CURRENT_DATE - INTERVAL '14 days',
        'completed',
        85.00,
        'Pro Plumbing Co',
        'inspection',
        2
    ),
    (
        (SELECT id FROM public.homes LIMIT 1),
        'Electrical Panel Check',
        'Inspect electrical panel and test GFCI outlets',
        'electrical',
        CURRENT_DATE - INTERVAL '3 days',
        'overdue',
        120.00,
        'Elite Electric',
        'inspection',
        3
    );
*/

-- ================================================================
-- COMMENTS
-- ================================================================

COMMENT ON TABLE public.maintenance IS 'Professional maintenance and service tracking for home systems';
COMMENT ON COLUMN public.maintenance.category IS 'Type of maintenance: hvac, plumbing, electrical, general, etc.';
COMMENT ON COLUMN public.maintenance.status IS 'Current status: scheduled, in_progress, completed, cancelled, overdue';
COMMENT ON COLUMN public.maintenance.maintenance_type IS 'Type of work: routine, repair, inspection, replacement, emergency';
COMMENT ON COLUMN public.maintenance.priority IS 'Priority level 1-5 (1=low, 5=critical)';
COMMENT ON COLUMN public.maintenance.recurring IS 'Whether this is a recurring maintenance item';
COMMENT ON COLUMN public.maintenance.warranty_work IS 'Whether this work is covered under warranty';

-- ================================================================
-- VERIFICATION QUERY
-- ================================================================

-- Run this to verify the table was created successfully
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'maintenance'
ORDER BY ordinal_position; 