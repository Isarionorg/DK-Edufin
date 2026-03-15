-- Migration: Add student preferences support
-- Run this after backing up your database

-- ============================================
-- 1. ADD NEW COLUMNS TO user_profiles
-- ============================================

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS preferred_stream VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE;

-- ============================================
-- 2. CREATE user_course_preferences TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_course_preferences (
    preference_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    course_id INT NOT NULL,
    priority INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_user_course_pref_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(user_id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_user_course_pref_course 
        FOREIGN KEY (course_id) 
        REFERENCES courses(course_id) 
        ON DELETE CASCADE,
    
    -- Unique Constraint
    CONSTRAINT unique_user_course 
        UNIQUE (user_id, course_id)
);

-- ============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_course_pref 
ON user_course_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_profile_complete 
ON user_profiles(is_profile_complete) 
WHERE is_profile_complete = FALSE;

-- ============================================
-- 4. ADD COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN user_profiles.preferred_stream IS 'Student preferred stream: Science, Commerce, Arts';
COMMENT ON COLUMN user_profiles.is_profile_complete IS 'Whether student has completed the profile/student form';
COMMENT ON TABLE user_course_preferences IS 'Stores student course preferences for personalized recommendations';
COMMENT ON COLUMN user_course_preferences.priority IS 'Priority ranking of course preference (1 = highest)';

-- ============================================
-- 5. VERIFY MIGRATION
-- ============================================

-- Check if columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND column_name IN ('preferred_stream', 'is_profile_complete');

-- Check if table was created
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'user_course_preferences';