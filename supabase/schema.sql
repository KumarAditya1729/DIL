-- Dance Academy SaaS Platform Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SaaS & Tenants Management
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_name VARCHAR(50) NOT NULL,
    max_students INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    features JSONB
);

CREATE TABLE academies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    theme_color VARCHAR(20) DEFAULT '#db2777',
    subscription_id UUID REFERENCES subscriptions(id),
    subscription_status VARCHAR(50) DEFAULT 'trial',
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    razorpay_customer_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users & RBAC
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    academy_id UUID REFERENCES academies(id),
    role VARCHAR(50) DEFAULT 'teacher', -- super_admin, academy_admin, teacher, receptionist
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: All subsequent tables MUST include academy_id for Row Level Security (Tenant Isolation)

-- 3. Batches
CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID REFERENCES academies(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    style VARCHAR(100) NOT NULL,
    instructor_id UUID REFERENCES profiles(id),
    schedule JSONB,
    max_capacity INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Students
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID REFERENCES academies(id) NOT NULL,
    admission_number VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    parent_name VARCHAR(255),
    mobile_number VARCHAR(20) NOT NULL,
    whatsapp_number VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    aadhar_name VARCHAR(255),
    aadhar_number VARCHAR(12),
    date_of_birth DATE,
    gender VARCHAR(20),
    join_date DATE DEFAULT CURRENT_DATE,
    medical_notes TEXT,
    photo_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(academy_id, admission_number)
);

CREATE TABLE student_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID REFERENCES academies(id) NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    noted_by UUID REFERENCES profiles(id),
    note TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Attendance (QR & Manual)
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID REFERENCES academies(id) NOT NULL,
    batch_id UUID REFERENCES batches(id),
    date DATE NOT NULL,
    marked_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(batch_id, date)
);

CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_id UUID REFERENCES attendance(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id),
    status VARCHAR(20) NOT NULL,
    marked_via VARCHAR(20) DEFAULT 'manual', -- manual, qr_kiosk
    time_marked TIME,
    notes TEXT,
    UNIQUE(attendance_id, student_id)
);

-- 6. Fees & Invoicing (Razorpay Prep)
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID REFERENCES academies(id) NOT NULL,
    student_id UUID REFERENCES students(id),
    invoice_number VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(academy_id, invoice_number)
);

-- 7. Advanced Event Ecosystem
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID REFERENCES academies(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    venue TEXT,
    budget DECIMAL(10, 2),
    revenue DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'planning',
    cover_image TEXT,
    gallery JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id),
    role VARCHAR(100),
    costume_status VARCHAR(50) DEFAULT 'pending',
    costume_details TEXT,
    rehearsal_attendance JSONB,
    UNIQUE(event_id, student_id)
);

CREATE TABLE event_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    receipt_url TEXT
);

-- 8. Notifications & Activity Logs
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID REFERENCES academies(id) NOT NULL,
    user_id UUID REFERENCES profiles(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID REFERENCES academies(id),
    user_id UUID REFERENCES profiles(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_students_academy ON students(academy_id);
CREATE INDEX idx_batches_academy ON batches(academy_id);
CREATE INDEX idx_invoices_academy_status ON invoices(academy_id, status);
CREATE INDEX idx_audit_logs_academy ON audit_logs(academy_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tenant tables
ALTER TABLE academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create helper function to get current user's academy
CREATE OR REPLACE FUNCTION get_current_academy_id()
RETURNS UUID AS $$
  SELECT academy_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Profiles: Users can see profiles in their own academy
CREATE POLICY "Users can view profiles in their academy" 
ON profiles FOR SELECT 
USING (academy_id = get_current_academy_id() OR role = 'super_admin');

-- Academies: Users can view their own academy
CREATE POLICY "Users can view their academy" 
ON academies FOR SELECT 
USING (id = get_current_academy_id() OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'super_admin'));

-- Students: Tenant Isolation
CREATE POLICY "Tenant isolation for students" 
ON students FOR ALL 
USING (academy_id = get_current_academy_id());

-- Batches: Tenant Isolation
CREATE POLICY "Tenant isolation for batches" 
ON batches FOR ALL 
USING (academy_id = get_current_academy_id());

-- Invoices: Tenant Isolation
CREATE POLICY "Tenant isolation for invoices" 
ON invoices FOR ALL 
USING (academy_id = get_current_academy_id());

-- Events: Tenant Isolation
CREATE POLICY "Tenant isolation for events" 
ON events FOR ALL 
USING (academy_id = get_current_academy_id());

-- Student Progress: Tenant Isolation
CREATE POLICY "Tenant isolation for student_progress"
ON student_progress FOR ALL
USING (academy_id = get_current_academy_id());

-- Attendance: Tenant Isolation
CREATE POLICY "Tenant isolation for attendance"
ON attendance FOR ALL
USING (academy_id = get_current_academy_id());

-- Attendance Records: Tenant Isolation
CREATE POLICY "Tenant isolation for attendance_records"
ON attendance_records FOR ALL
USING (attendance_id IN (SELECT id FROM attendance WHERE academy_id = get_current_academy_id()));

-- Event Participants: Tenant Isolation
CREATE POLICY "Tenant isolation for event_participants"
ON event_participants FOR ALL
USING (event_id IN (SELECT id FROM events WHERE academy_id = get_current_academy_id()));

-- Event Expenses: Tenant Isolation
CREATE POLICY "Tenant isolation for event_expenses"
ON event_expenses FOR ALL
USING (event_id IN (SELECT id FROM events WHERE academy_id = get_current_academy_id()));

-- Notifications: Tenant Isolation
CREATE POLICY "Tenant isolation for notifications"
ON notifications FOR ALL
USING (academy_id = get_current_academy_id());

-- Audit Logs: Tenant Isolation
CREATE POLICY "Tenant isolation for audit_logs"
ON audit_logs FOR ALL
USING (academy_id = get_current_academy_id());

-- Subscriptions: Anyone can read
CREATE POLICY "Anyone can view subscriptions"
ON subscriptions FOR SELECT
USING (true);

-- Security Definer functions for Super Admin tasks
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;
