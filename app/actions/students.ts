"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Generates the next sequential admission number for the current year.
 * Format: DA-YYYY-NNN (e.g. DA-2026-001, DA-2026-042)
 * Always increments from the highest existing number this year.
 */
export async function getNextAdmissionNumber(): Promise<string> {
  const supabase = createClient();
  const year = new Date().getFullYear();
  const prefix = `DA-${year}-`;

  const { data } = await supabase
    .from('students')
    .select('admission_number')
    .like('admission_number', `${prefix}%`)
    .order('admission_number', { ascending: false })
    .limit(1);

  if (!data || data.length === 0) {
    return `${prefix}001`;
  }

  const last = data[0].admission_number as string;
  const lastNum = parseInt(last.replace(prefix, ''), 10);
  const next = lastNum + 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

export async function createStudent(formData: FormData) {
  const supabase = createClient();

  const data = {
    full_name: formData.get("fullName") as string,
    mobile_number: formData.get("mobileNumber") as string,
    parent_name: formData.get("parentName") as string,
    date_of_birth: formData.get("dob") as string,
    gender: formData.get("gender") as string,
    medical_notes: formData.get("medicalNotes") as string,
    dance_style: formData.get("danceStyle") as string,
    batch: formData.get("batch") as string,
  };

  if (!data.full_name || !data.mobile_number) {
    return { error: "Name and Mobile number are required fields." };
  }

  try {
    // Check if Supabase is configured (skip auth check in local dev mode)
    const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    let academyId: string | null = null;

    if (isConfigured) {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        return { error: "Unauthorized. Please log in." };
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('academy_id')
        .eq('id', user.user.id)
        .single();

      academyId = profile?.academy_id ?? null;
    }

    // Generate sequential admission number
    const admissionNumber = await getNextAdmissionNumber();

    const { error: dbError } = await supabase.from('students').insert({
      ...(academyId ? { academy_id: academyId } : {}),
      admission_number: admissionNumber,
      full_name: data.full_name,
      mobile_number: data.mobile_number,
      parent_name: data.parent_name,
      date_of_birth: data.date_of_birth || null,
      gender: data.gender || null,
      medical_notes: data.medical_notes || null,
      dance_style: data.dance_style || null,
      batch: data.batch || null,
      status: 'active',
    });

    if (dbError) throw dbError;

    revalidatePath("/dashboard/students");
    return { success: true, admissionNumber };
  } catch (error: any) {
    console.error("Failed to create student:", error);
    return { error: error.message || "An unexpected error occurred. Please try again." };
  }
}

export async function fetchStudentDetails(admissionNumber: string) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return null;

  const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', user.user.id).single();

  const query = supabase.from('students').select('*').eq('admission_number', admissionNumber);
  if (profile?.academy_id) query.eq('academy_id', profile.academy_id);

  const { data, error } = await query.single();
  if (error || !data) return null;

  // Fetch progress notes + real attendance stats in parallel
  const [{ data: progress }, { data: attRecords }, { data: invoiceData }] = await Promise.all([
    supabase.from('student_progress').select('*').eq('student_id', data.id).order('created_at', { ascending: false }),
    supabase
      .from('attendance_records')
      .select('status, attendance(date)')
      .eq('student_id', data.id)
      .order('attendance(date)', { ascending: false })
      .limit(200),
    supabase.from('invoices').select('status').eq('student_id', data.id),
  ]);

  const totalClasses = (attRecords || []).length;
  const presentCount = (attRecords || []).filter(r => r.status === 'present').length;
  const attendancePct = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;
  const attendanceStr = totalClasses > 0 ? `${attendancePct}% (${presentCount}/${totalClasses})` : 'No records';

  const hasPending = (invoiceData || []).some(i => i.status === 'pending');
  const feeStatus = (invoiceData || []).length === 0 ? 'No Invoices' : hasPending ? 'Dues Pending' : 'All Paid';

  return {
    id: data.admission_number,
    dbId: data.id,
    name: data.full_name,
    dob: data.date_of_birth ? new Date(data.date_of_birth).toLocaleDateString('en-IN') : 'N/A',
    gender: data.gender || 'N/A',
    joinDate: data.join_date ? new Date(data.join_date).toLocaleDateString('en-IN') : 'N/A',
    status: data.status,
    styles: data.dance_style ? [data.dance_style] : [],
    batches: data.batch ? [data.batch] : [],
    parent: {
      name: data.parent_name || 'N/A',
      phone: data.mobile_number,
      email: data.email || 'N/A',
    },
    medical: data.medical_notes || 'No medical conditions reported.',
    attendance: attendanceStr,
    attendancePct,
    totalClasses,
    presentCount,
    feeStatus,
    progress: (progress || []).map(p => ({
      date: new Date(p.created_at).toLocaleDateString('en-IN'),
      note: p.note,
    })),
  };
}

export async function fetchStudentAttendanceHistory(studentDbId: string, monthsBack = 3) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return [];

  const since = new Date();
  since.setMonth(since.getMonth() - monthsBack);

  const { data } = await supabase
    .from('attendance_records')
    .select('status, notes, attendance(date, batch_id, batches(name))')
    .eq('student_id', studentDbId)
    .gte('attendance.date', since.toISOString().split('T')[0])
    .order('attendance(date)', { ascending: false });

  return (data || []).map((r: any) => ({
    date: r.attendance?.date || '',
    status: r.status as 'present' | 'absent' | 'late',
    batch: r.attendance?.batches?.name || 'N/A',
    notes: r.notes || '',
  }));
}

export async function fetchAlumni() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user?.user) return [];

  const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', user.user.id).single();
  if (!profile?.academy_id) return [];

  const { data } = await supabase
    .from('students')
    .select('admission_number, full_name, join_date, dance_style, status')
    .eq('academy_id', profile.academy_id)
    .in('status', ['inactive', 'alumni'])
    .order('join_date', { ascending: false });

  return (data || []).map(s => ({
    id: s.admission_number,
    name: s.full_name,
    years: `${new Date(s.join_date).getFullYear()} - Present`,
    style: s.dance_style,
    achievements: 'Academy Alumnus',
  }));
}

export async function updateStudent(admissionNumber: string, formData: FormData) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized." };

  const updates = {
    full_name:     formData.get("fullName") as string,
    mobile_number: formData.get("mobileNumber") as string,
    parent_name:   formData.get("parentName") as string,
    date_of_birth: formData.get("dob") as string || null,
    gender:        formData.get("gender") as string || null,
    dance_style:   formData.get("danceStyle") as string || null,
    batch:         formData.get("batch") as string || null,
    status:        formData.get("status") as string || "active",
    medical_notes: formData.get("medicalNotes") as string || null,
    email:         formData.get("email") as string || null,
  };

  if (!updates.full_name || !updates.mobile_number) {
    return { error: "Name and Mobile number are required." };
  }

  const { error } = await supabase
    .from('students')
    .update(updates)
    .eq('admission_number', admissionNumber);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/students/${admissionNumber}`);
  revalidatePath("/dashboard/students");
  return { success: true };
}

export async function addProgressNote(studentId: string, note: string) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized." };

  // Resolve student DB id from admission number
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('admission_number', studentId)
    .single();

  if (!student) return { error: "Student not found." };

  const { error } = await supabase.from('student_progress').insert({
    student_id: student.id,
    note,
  });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/students/${studentId}`);
  return { success: true };
}

export async function restoreStudent(admissionNumber: string) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized." };

  const { error } = await supabase
    .from('students')
    .update({ status: 'active' })
    .eq('admission_number', admissionNumber);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/students/${admissionNumber}`);
  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard/alumni");
  return { success: true };
}
