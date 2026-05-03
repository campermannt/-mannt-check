import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

// Static export compatibility
export const dynamic = 'force-static';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  return NextResponse.json({ status: 'API is ready for POST requests' });
}

export async function POST(request: NextRequest) {
  try {
    const { vehicleLabel, description, phone, urgent, photos } = await request.json();

    if (!description) {
      return NextResponse.json({ error: 'Description is required.' }, { status: 400 });
    }

    const attachments = photos ? photos.map((photo: { name: string; type: string; data: string }) => ({
      filename: photo.name,
      content: photo.data,
    })) : [];

    const emailContent = `
      Nowe zgłoszenie serwisowe od użytkownika Mannt Check:\n\n
      Pojazd: ${vehicleLabel}\n
      Opis: ${description}\n
      ${phone ? `Telefon: ${phone}\n` : ''}

      ${urgent ? 'PILNE: To zgłoszenie jest oznaczone jako pilne!\n' : ''}
    `;

    await resend.emails.send({
      from: 'Mannt Check <no-reply@mannt.pl>',
      to: 'camper@mannt.pl',
      subject: urgent ? `PILNE: Zgłoszenie serwisowe - ${vehicleLabel}` : `Zgłoszenie serwisowe - ${vehicleLabel}`,
      text: emailContent,
      attachments: attachments,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to submit service request:', error);
    return NextResponse.json({ error: 'Failed to submit service request.' }, { status: 500 });
  }
}
