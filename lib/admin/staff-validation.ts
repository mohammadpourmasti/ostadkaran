import { normalizeIranMobile } from "./phone";
import { isSpecialty } from "./specialties";

export type TechnicianInput = {
  fullName: string;
  phone: string;
  specialties: string[];
  notes: string;
  isActive: boolean;
};

export type NewTechnicianInput = TechnicianInput & { email: string; password: string };

type Parsed<T> = { ok: true; value: T } | { ok: false; message: string };

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Password rule for the initial password: 10-72 characters with at least one letter and one digit. */
export function passwordProblem(password: string): string | null {
  if (password.length < 10) return "رمز عبور حداقل ۱۰ نویسه باشد.";
  if (password.length > 72) return "رمز عبور حداکثر ۷۲ نویسه باشد.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "رمز عبور باید هم حرف انگلیسی و هم عدد داشته باشد.";
  return null;
}

export function parseTechnicianInput(formData: FormData): Parsed<TechnicianInput> {
  const fullName = field(formData, "fullName").replace(/\s+/g, " ").trim();
  const phone = normalizeIranMobile(field(formData, "phone"));
  const notes = field(formData, "notes").trim();
  const specialties = [...new Set(formData.getAll("specialties").filter((item): item is string => typeof item === "string"))];

  if (fullName.length < 2 || fullName.length > 80) return { ok: false, message: "نام و نام خانوادگی باید بین ۲ تا ۸۰ نویسه باشد." };
  if (!phone) return { ok: false, message: "شمارهٔ موبایل معتبر نیست (مثلاً ۰۹۱۲۳۴۵۶۷۸۹)." };
  if (specialties.length < 1) return { ok: false, message: "حداقل یک تخصص انتخاب کنید." };
  if (!specialties.every(isSpecialty)) return { ok: false, message: "تخصص انتخاب‌شده معتبر نیست." };
  if (notes.length > 1000) return { ok: false, message: "توضیحات حداکثر ۱۰۰۰ نویسه است." };

  return { ok: true, value: { fullName, phone, specialties, notes, isActive: formData.get("isActive") === "on" } };
}

export function parseNewTechnicianInput(formData: FormData): Parsed<NewTechnicianInput> {
  const base = parseTechnicianInput(formData);
  if (!base.ok) return base;

  const email = field(formData, "email").trim().toLowerCase();
  const password = field(formData, "password");

  if (!EMAIL.test(email) || email.length > 254) return { ok: false, message: "ایمیل معتبر نیست." };
  const problem = passwordProblem(password);
  if (problem) return { ok: false, message: problem };

  return { ok: true, value: { ...base.value, email, password } };
}
