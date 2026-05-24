"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ensureAdminProfileExists } from "./auth";
import { resolveCurrentAcademyId } from "./academy";

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

  // Ensure administrator profile row exists in PostgreSQL
  await ensureAdminProfileExists();

  const data = {
    full_name: formData.get("fullName") as string,
    mobile_number: formData.get("mobileNumber") as string,
    whatsapp_number: formData.get("whatsappNumber") as string || null,
    parent_name: formData.get("parentName") as string,
    address: formData.get("address") as string,
    aadhar_name: formData.get("aadharName") as string,
    aadhar_number: formData.get("aadharNumber") as string,
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
      academyId = await resolveCurrentAcademyId(supabase, user.user.id);
      if (!academyId) return { error: "No academy found." };
    }

    // Generate sequential admission number
    const admissionNumber = await getNextAdmissionNumber();

    const { error: dbError } = await supabase.from('students').insert({
      ...(academyId ? { academy_id: academyId } : {}),
      admission_number: admissionNumber,
      full_name: data.full_name,
      mobile_number: data.mobile_number,
      whatsapp_number: data.whatsapp_number,
      parent_name: data.parent_name,
      address: data.address || null,
      aadhar_name: data.aadhar_name || null,
      aadhar_number: data.aadhar_number || null,
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

  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);

  const query = supabase.from('students').select('*').eq('admission_number', admissionNumber);
  if (academyId) query.eq('academy_id', academyId);

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
      whatsapp: data.whatsapp_number || undefined,
      email: data.email || 'N/A',
    },
    address: data.address || 'N/A',
    aadhar: {
      name: data.aadhar_name || 'N/A',
      number: data.aadhar_number || 'N/A',
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

  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);
  if (!academyId) return [];

  const { data } = await supabase
    .from('students')
    .select('admission_number, full_name, join_date, dance_style, status')
    .eq('academy_id', academyId)
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
  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);
  if (!academyId) return { error: "No academy found." };

  // Ensure administrator profile row exists in PostgreSQL
  await ensureAdminProfileExists();

  const updates = {
    full_name:     formData.get("fullName") as string,
    mobile_number: formData.get("mobileNumber") as string,
    whatsapp_number: formData.get("whatsappNumber") as string || null,
    parent_name:   formData.get("parentName") as string,
    address:       formData.get("address") as string || null,
    aadhar_name:   formData.get("aadharName") as string || null,
    aadhar_number: formData.get("aadharNumber") as string || null,
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
    .eq('admission_number', admissionNumber)
    .eq('academy_id', academyId);

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
  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);
  if (!academyId) return { error: "No academy found." };

  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('admission_number', studentId)
    .eq('academy_id', academyId)
    .single();

  if (!student) return { error: "Student not found." };

  const { error } = await supabase.from('student_progress').insert({
    academy_id: academyId,
    student_id: student.id,
    noted_by: user.user.id,
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
  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);
  if (!academyId) return { error: "No academy found." };

  const { error } = await supabase
    .from('students')
    .update({ status: 'active' })
    .eq('admission_number', admissionNumber)
    .eq('academy_id', academyId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/students/${admissionNumber}`);
  revalidatePath("/dashboard/students");
  revalidatePath("/dashboard/alumni");
  return { success: true };
}

export async function deleteStudent(id: string) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized." };

  await ensureAdminProfileExists();
  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);
  if (!academyId) return { error: "No academy found." };

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id)
    .eq('academy_id', academyId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/students");
  return { success: true };
}
