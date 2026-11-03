// Shown instead of fake data when the database side of the dashboard is not ready.
export function SetupRequired({ reason }: { reason: "setup" | "forbidden" | "failed" }) {
  const copy = {
    setup: {
      title: "پایگاه‌داده هنوز آمادهٔ داشبورد نیست",
      body: "migrationهای داشبورد روی Supabase اجرا نشده‌اند. فایل‌های supabase/migrations و راهنمای supabase/admin-dashboard-setup.md را مرور و اجرا کنید.",
    },
    forbidden: {
      title: "دسترسی شما برای این بخش کافی نیست",
      body: "حساب شما به این داده‌ها دسترسی ندارد. با مدیر تماس بگیرید.",
    },
    failed: {
      title: "دریافت اطلاعات ممکن نشد",
      body: "ارتباط با پایگاه‌داده با خطا روبه‌رو شد. چند لحظه بعد صفحه را تازه کنید.",
    },
  }[reason];

  return (
    <div role="alert" className="rounded-2xl border border-cta/40 bg-cta/10 p-5 sm:p-6">
      <h2 className="font-extrabold text-amber-950">{copy.title}</h2>
      <p className="mt-2 text-sm leading-7 text-amber-950/80">{copy.body}</p>
    </div>
  );
}
