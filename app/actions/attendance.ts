"use server";

import { createClient } from "@/lib/supabase/server";

export async function fetchStudentsByBatch(batchName: string) {
  const supabase = createClient();
  
  // 1. Get the batch ID first (assuming academy isolation is handled by RLS)
  const { data: batchData } = await supabase
    .from('batches')
    .select('id')
    .eq('name', batchName)
    .single();

  if (!batchData) return [];

  // 2. We could join with enrollments, but for now we'll fetch all students
  // In a real app, there would be a student_batches mapping table
  const { data, error } = await supabase
    .from('students')
    .select('id, full_name, admission_number')
    .limit(50);

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

  const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', user.user.id).single();
  if (!profile?.academy_id) return { success: false, error: "No academy found" };

  const { data: batch } = await supabase.from('batches').select('id').eq('name', batchName).eq('academy_id', profile.academy_id).single();
  const batchId = batch?.id || null; // If batch doesn't exist, we'll store null for now

  try {
    let attendanceId;
    const { data: existingAtt } = await supabase.from('attendance')
      .select('id')
      .eq('academy_id', profile.academy_id)
      .eq('date', dateStr.split('T')[0])
      .eq('batch_id', batchId)
      .single();

    if (existingAtt) {
      attendanceId = existingAtt.id;
    } else {
      const { data: newAtt, error: attError } = await supabase.from('attendance').insert({
        academy_id: profile.academy_id,
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
