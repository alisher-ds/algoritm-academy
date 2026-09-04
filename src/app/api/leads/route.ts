import { NextResponse } from "next/server";
import { sendLeadNotification, LeadPayload } from "@/lib/telegram";

export interface StoredLead extends LeadPayload {
  id: string;
  createdAt: string;
  status: "yangi" | "boglangan" | "sinov_darsi" | "qabul_qilindi" | "rad_etildi";
  adminNotes?: string;
}

// In-memory leads storage for demo (persists while server runs)
const leadsDb: StoredLead[] = [
  {
    id: "lead-1",
    name: "Alisher Vohidov",
    phone: "+998 (90) 123-45-67",
    type: "maktab",
    targetInterest: "5-sinf (O'rta ta'lim)",
    preferredTime: "Kunning ikkinchi yarmi",
    notes: "Ingliz tili chuqurlashtirilgan sinfga qiziqyapti",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "yangi",
  },
  {
    id: "lead-2",
    name: "Zilola Karimova",
    phone: "+998 (97) 555-88-99",
    type: "kurs",
    targetInterest: "IELTS 7.5+ Intensive",
    preferredTime: "Ertalab 09:00",
    notes: "Hozirgi darajasi B2, xorijga grant yutmoqchi",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: "boglangan",
  },
  {
    id: "lead-3",
    name: "Rustam Ahmedov",
    phone: "+998 (93) 444-11-22",
    type: "kurs",
    targetInterest: "Matematika (DTM & Milliy Sertifikat)",
    preferredTime: "Tushdan keyin",
    notes: "11-sinf abituriyent",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: "sinov_darsi",
  },
];

export async function GET() {
  return NextResponse.json({ success: true, leads: leadsDb });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, type, targetInterest, preferredTime, notes } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "Ism va telefon raqam to'ldirilishi shart" },
        { status: 400 }
      );
    }

    const newLead: StoredLead = {
      id: `lead-${Date.now()}`,
      name,
      phone,
      type: type || "umumiy",
      targetInterest: targetInterest || "Umumiy ma'lumot",
      preferredTime,
      notes,
      createdAt: new Date().toISOString(),
      status: "yangi",
    };

    // Prepend new lead
    leadsDb.unshift(newLead);

    // Send Telegram Notification
    await sendLeadNotification(newLead);

    return NextResponse.json({
      success: true,
      message: "Arizangiz muvaffaqiyatli qabul qilindi!",
      lead: newLead,
    });
  } catch (error) {
    console.error("Lead API Error:", error);
    return NextResponse.json(
      { success: false, error: "Serverda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, adminNotes } = body;

    const leadIndex = leadsDb.findIndex((l) => l.id === id);
    if (leadIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Ariza topilmadi" },
        { status: 404 }
      );
    }

    if (status) leadsDb[leadIndex].status = status;
    if (adminNotes !== undefined) leadsDb[leadIndex].adminNotes = adminNotes;

    return NextResponse.json({
      success: true,
      message: "Ariza holati yangilandi",
      lead: leadsDb[leadIndex],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
