'use server'
import { Resend } from 'resend';


export async function sendTaskEmail(email: string, taskTitle: string, employeeName: string) {
const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
        // ✅ Updated to use your verified domain
        from: 'PetoDesk Tasks <notifications@petodesk.com>', 
        to: email,
        subject: `New Assignment: ${taskTitle}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; color: #333;">
            <h2 style="color: #000;">New Task Assigned 📝</h2>
            <p>Hello ${employeeName},</p>
            <p>You have been assigned a new task in PetoDesk:</p>
            
            <div style="background-color: #f4f4f4; padding: 15px; border-left: 4px solid #000; margin: 20px 0;">
              <strong style="font-size: 16px;">${taskTitle}</strong>
            </div>
            
            <p>Please log in to your dashboard to view the details and set a due date.</p>
            
            <a href="https://petodesk.com/dashboard" 
               style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
               View Task
            </a>
            
            <p style="margin-top: 30px; font-size: 12px; color: #888;">
              This is an automated notification from PetoDesk HR.
            </p>
          </div>
        `
    });

    if (error) {
        console.error("Task Email Error:", error);
        return { success: false, error };
    }
    
    return { success: true, data };
}