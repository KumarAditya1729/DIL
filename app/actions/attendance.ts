"use server";

import { createClient } from "@/lib/supabase/server";
import { ensureAdminProfileExists } from "./auth";
import { resolveCurrentAcademyId } from "./academy";

export async function fetchStudentsByBatch(batchName: string) {
  const supabase = createClient();
  
  // Ensure profile row exists to bypass RLS failures
  await ensureAdminProfileExists();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return [];
  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);
  if (!academyId) return [];
  
  // 1. Get the batch ID first (assuming academy isolation is handled by RLS)
  const { data: batchData } = await supabase
    .from('batches')
    .select('id')
    .eq('name', batchName)
    .eq('academy_id', academyId)
    .single();

  if (!batchData) return [];

  // Filter students who are actually enrolled in this specific batch!
  const { data, error } = await supabase
    .from('students')
    .select('id, full_name, admission_number')
    .eq('batch', batchName)
    .eq('academy_id', academyId);

  if (error) {
    console.error("Error fetching students:", error);
    return [];
  }

  // Map to the format the UI expects
  return (data || []).map((student: any) => ({
    id: student.id,
    name: student.full_name,
    admissionNumber: student.admission_number,
    batch: batchName,
    present: null as boolean | null
  }));
}

export async function saveDailyAttendance(records: { studentId: string, present: boolean }[], dateStr: string, batchName: string) {
  const supabase = createClient();
  
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) {
    return { success: false, error: "Unauthorized" };
  }

  // Ensure profile row exists to bypass RLS failures
  await ensureAdminProfileExists();

  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);
  if (!academyId) return { success: false, error: "No academy found" };

  const { data: batch } = await supabase.from('batches').select('id').eq('name', batchName).eq('academy_id', academyId).single();
  const batchId = batch?.id || null; // If batch doesn't exist, we'll store null for now

  try {
    let attendanceId;
    const { data: existingAtt } = await supabase.from('attendance')
      .select('id')
      .eq('academy_id', academyId)
      .eq('date', dateStr.split('T')[0])
      .eq('batch_id', batchId)
      .maybeSingle();

    if (existingAtt) {
      attendanceId = existingAtt.id;
    } else {
      const { data: newAtt, error: attError } = await supabase.from('attendance').insert({
        academy_id: academyId,
        batch_id: batchId,
        date: dateStr.split('T')[0],
        marked_by: user.user.id
      }).select('id').single();
      
      if (attError) throw attError;
      attendanceId = newAtt.id;
    }

    const recordsToInsert = records.map(r => ({
      attendance_id: attendanceId,
      student_id: r.studentId,
      status: r.present ? 'present' : 'absent'
    }));

    const { error: recordsError } = await supabase.from('attendance_records').upsert(recordsToInsert, { onConflict: 'attendance_id, student_id' });
    if (recordsError) throw recordsError;

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
