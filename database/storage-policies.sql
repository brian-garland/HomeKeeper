-- HomeKeeper Storage Security Policies
-- Ensures users can only access their own files
-- Created: June 9, 2025

-- ================================================================
-- STORAGE RLS POLICIES FOR HOMEKEEPER BUCKETS
-- ================================================================

-- EQUIPMENT PHOTOS BUCKET
-- Users can only access equipment photos for homes they own
-- File path structure: {user_id}/{home_id}/{equipment_id}/{filename}

-- Allow users to view their own equipment photos
CREATE POLICY "Users can view own equipment photos"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'equipment-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to upload equipment photos to their own folder
CREATE POLICY "Users can upload own equipment photos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'equipment-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own equipment photos
CREATE POLICY "Users can update own equipment photos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'equipment-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own equipment photos
CREATE POLICY "Users can delete own equipment photos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'equipment-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- ================================================================
-- TASK COMPLETION PHOTOS BUCKET
-- File path structure: {user_id}/{home_id}/{task_id}/{filename}
-- ================================================================

-- Allow users to view their own task completion photos
CREATE POLICY "Users can view own task completion photos"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'task-completion-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to upload task completion photos
CREATE POLICY "Users can upload own task completion photos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'task-completion-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own task completion photos
CREATE POLICY "Users can update own task completion photos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'task-completion-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own task completion photos
CREATE POLICY "Users can delete own task completion photos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'task-completion-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- ================================================================
-- AVATARS BUCKET
-- File path structure: {user_id}/{filename}
-- ================================================================

-- Allow users to view their own avatar
CREATE POLICY "Users can view own avatar"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- ================================================================
-- HOME PHOTOS BUCKET
-- File path structure: {user_id}/{home_id}/{filename}
-- ================================================================

-- Allow users to view their own home photos
CREATE POLICY "Users can view own home photos"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'home-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to upload home photos
CREATE POLICY "Users can upload own home photos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'home-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own home photos
CREATE POLICY "Users can update own home photos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'home-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own home photos
CREATE POLICY "Users can delete own home photos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'home-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- ================================================================
-- ENABLE RLS ON STORAGE.OBJECTS
-- ================================================================

-- Enable Row Level Security on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- VERIFY STORAGE POLICIES
-- ================================================================

-- Query to check storage policies
SELECT 
    policyname,
    cmd,
    tablename,
    roles
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- ================================================================
-- COMMENTS FOR DOCUMENTATION
-- ================================================================

COMMENT ON POLICY "Users can view own equipment photos" ON storage.objects IS 
'Users can only view equipment photos in folders that start with their user ID';

COMMENT ON POLICY "Users can view own task completion photos" ON storage.objects IS 
'Users can only view task completion photos in folders that start with their user ID';

COMMENT ON POLICY "Users can view own avatar" ON storage.objects IS 
'Users can only view avatars in folders that start with their user ID';

COMMENT ON POLICY "Users can view own home photos" ON storage.objects IS 
'Users can only view home photos in folders that start with their user ID';

-- ================================================================
-- FILE ORGANIZATION STRUCTURE
-- ================================================================

/*
RECOMMENDED FILE PATH STRUCTURE:

EQUIPMENT PHOTOS:
equipment-photos/{user_id}/{home_id}/{equipment_id}/photo.jpg
Example: equipment-photos/123e4567-e89b-12d3-a456-426614174000/456e7890-e89b-12d3-a456-426614174001/789e0123-e89b-12d3-a456-426614174002/hvac-unit.jpg

TASK COMPLETION PHOTOS:
task-completion-photos/{user_id}/{home_id}/{task_id}/completion.jpg
Example: task-completion-photos/123e4567-e89b-12d3-a456-426614174000/456e7890-e89b-12d3-a456-426614174001/789e0123-e89b-12d3-a456-426614174002/filter-changed.jpg

AVATARS:
avatars/{user_id}/avatar.jpg
Example: avatars/123e4567-e89b-12d3-a456-426614174000/profile.jpg

HOME PHOTOS:
home-photos/{user_id}/{home_id}/exterior.jpg
Example: home-photos/123e4567-e89b-12d3-a456-426614174000/456e7890-e89b-12d3-a456-426614174001/front-view.jpg

This structure ensures:
- Complete data isolation between users
- Organized file management
- Easy cleanup when users/homes are deleted
- Clear relationship between files and database records
*/ 