'use server'
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTaskEmail(email: string, taskTitle: string, employeeName: string) {
    const { data, error } = await resend.emails.send({
        from: 'PetoDesk <onboarding@resend.dev>',
        to: email,
        subject: 'New Task Assigned!',
        html: `<p>Hi ${employeeName},</p><p>You have a new task: <strong>${taskTitle}</strong></p>`
    });

    if (error) {
        return { error };
    }
    return { data };
}



