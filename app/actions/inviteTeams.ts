import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export async function inviteTeams(
  email: string,
  role: string,
  companyName: string
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
    .select();

  if (error) {
    console.error("Update Error:", error);
    return { success: false, error };
  }

  // 🧠 3. Only send email if PROMOTED to admin
  const isPromotedToAdmin = previousRole !== 'admin' && role === 'admin';

  if (isPromotedToAdmin) {
    try {
      await resend.emails.send({
        from: `${companyName} <teams@petodesk.com>`,
        to: [email],
        subject: `🎉 You're now an Admin at ${companyName}`,
        html: `
          <h2>Congratulations 🎉</h2>
          <p>You have been promoted to <strong>ADMIN</strong> at <strong>${companyName}</strong>.</p>
          
          <p>You now have access to admin features and controls.</p>

          <p>Please log in to your account to explore your new permissions.</p>

          <br/>
          <a href="https://petodesk.com/login" 
             style="padding:10px 16px;background:#000;color:#fff;text-decoration:none;border-radius:6px;">
             Login Now
          </a>

          <br/><br/>
          <p>— ${companyName} Team</p>
        `,
      });
    } catch (emailError) {
      console.error("Email Send Error:", emailError);
      return { success: false, error: emailError };
    }
  }

  return { success: true, data };
}