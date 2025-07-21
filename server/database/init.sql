-- Veo3 Prompt Generator Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_ip VARCHAR(45),
    input_type VARCHAR(20) NOT NULL CHECK (input_type IN ('text', 'text-image', 'image')),
    input_text TEXT,
    image_path VARCHAR(255),
    short_prompt TEXT NOT NULL,
    long_prompt TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'error', 'pending')),
    generation_time_ms INTEGER,
    regeneration_count INTEGER DEFAULT 0
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Create security logs table
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSONB,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rate limit tracking table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address VARCHAR(45) NOT NULL,
    endpoint VARCHAR(100) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blocked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_user_ip ON prompts(user_ip);
CREATE INDEX IF NOT EXISTS idx_prompts_input_type ON prompts(input_type);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts(status);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip ON security_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint ON rate_limits(ip_address, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prompts_updated_at 
    BEFORE UPDATE ON prompts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123 - change in production!)
INSERT INTO admin_users (username, password_hash, email) 
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com')
ON CONFLICT (username) DO NOTHING;

-- Create view for dashboard statistics
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    COUNT(DISTINCT user_ip) as total_users,
    COUNT(*) as total_prompts,
    COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_prompts,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_prompts,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as month_prompts,
    ROUND(AVG(CASE WHEN status = 'success' THEN 100 ELSE 0 END), 2) as success_rate,
    ROUND(AVG(generation_time_ms), 2) as avg_generation_time
FROM prompts;

-- Create view for input type distribution
CREATE OR REPLACE VIEW input_type_stats AS
SELECT 
    input_type,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM prompts 
GROUP BY input_type;

-- Create view for daily usage statistics
CREATE OR REPLACE VIEW daily_usage_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_prompts,
    COUNT(DISTINCT user_ip) as unique_users,
    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_prompts,
    COUNT(CASE WHEN status = 'error' THEN 1 END) as failed_prompts,
    ROUND(AVG(generation_time_ms), 2) as avg_generation_time
FROM prompts 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO veo3_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO veo3_user;
GRANT SELECT ON ALL TABLES IN SCHEMA information_schema TO veo3_user;
GRANT SELECT ON ALL TABLES IN SCHEMA pg_catalog TO veo3_user;