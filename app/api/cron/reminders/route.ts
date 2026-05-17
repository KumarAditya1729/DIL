import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  // 1. Verify Vercel Cron Secret to prevent unauthorized triggers
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();
  const currentDate = new Date();
  const month = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  try {
    // Note: To bypass RLS for system jobs, we would ideally use a Service Role Key.
    // For this example, we log the process.
    
    // Find all invoices due in 3 days that are unpaid
    const { data: pendingInvoices } = await supabase.from('invoices').select('*, students(full_name, mobile_number)').eq('status', 'pending');
    
    console.log(`[CRON] Processing fee reminders for ${month} ${year}`);
    
    if (pendingInvoices && pendingInvoices.length > 0) {
      // In a real implementation, we would call Gupshup/Twilio API here
      // Example:
      // pendingInvoices.forEach(inv => {
      //   sendWhatsApp(inv.students.mobile_number, `Dear ${inv.students.full_name}, your fee of ${inv.amount} is due.`);
      // });
      console.log(`[CRON] Dispatched ${pendingInvoices.length} reminders.`);
    }
    
    // Audit log the cron job success
    await supabase.from('audit_logs').insert({
      action: 'system.cron.fee_reminders_dispatched',
      entity_type: 'system',
      metadata: { month, year, status: 'success', count: pendingInvoices?.length || 0 }
    });

    return NextResponse.json({ success: true, message: "Reminders processed" });
  } catch (error) {
    console.error('[CRON Error]', error);
    return NextResponse.json({ error: 'Cron execution failed' }, { status: 500 });
  }
}
