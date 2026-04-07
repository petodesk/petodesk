'use server'

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js'

export async function inviteTeams(
  email: string,
  role: string,
  company: any
) {

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const resend = new Resend(process.env.RESEND_API_KEY);

  // 🧠 1. Get current role first
  const { data: existingUser, error: fetchError } = await supabase
    .from('profiles')
    .select('role')
    .eq('email', email)
    .eq('company_id', company.id)
    .single();

  if (fetchError || !existingUser) {
    return { success: false, error: 'User not found' };
  }

  const previousRole = existingUser.role;

  // 2. Update role
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('email', email)
    .eq('company_id', company.id)
    .select();
  await supabase.from('employees').update({ role }).eq('email', email).eq('company_id', company.id)

  if (error) {
    console.error("Update Error:", error);
    return { success: false, error };
  }

  // 🧠 3. Only send email if PROMOTED to admin
  const isPromotedToAdmin = previousRole !== 'admin' && role === 'admin';

  if (isPromotedToAdmin) {
    try {
      await resend.emails.send({
        from: `${company.name} <teams@petodesk.com>`,
        to: [email],
        subject: `You're now an Admin at ${company.name}`,
        html: `
          <h2>Congratulations </h2>
          <p>You have been promoted to <strong>ADMIN</strong> at <strong>${company.name}</strong>.</p>
          
          <p>You now have access to admin features and controls.</p>

          <p>Please log in to your account to explore your new permissions.</p>

          <br/>
          <a href="https://petodesk.com/login" 
             style="padding:10px 16px;background:#000;color:#fff;text-decoration:none;border-radius:6px;">
             Login Now
          </a>

          <br/><br/>
          <p>— ${company.name} Team</p>
        `,
      });
    } catch (emailError) {
      console.error("Email Send Error:", emailError);
      return { success: false, error: emailError };
    }
  }

  return { success: true, data };
}