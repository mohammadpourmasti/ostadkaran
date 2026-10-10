import { appliances } from "@/data/appliances";

/*
 * Presentation-only form. Online submission is NOT connected to any backend yet:
 * the fieldset is disabled and nothing is stored or sent. When the secure
 * server-side flow exists, add `action={serverAction}` to the <form>, remove
 * `disabled` from the fieldset and the button, and drop the notice in the page.
 */
const fieldClass =
  "mt-1.5 block w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-base text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-2 focus:outline-offset-1 focus:outline-accent/40 disabled:cursor-not-allowed disabled:bg-background disabled:text-muted";

export function RepairRequestForm() {
  return (
    <form aria-describedby="form-status" className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
      <fieldset disabled className="grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">فرم درخواست تعمیر (در حال حاضر غیرفعال)</legend>

        <div>
          <label htmlFor="rr-name" className="text-sm font-semibold text-foreground">
            نام و نام خانوادگی
          </label>
          <input id="rr-name" name="name" type="text" autoComplete="name" className={fieldClass} />
        </div>

        <div>
          <label htmlFor="rr-phone" className="text-sm font-semibold text-foreground">
            شماره تماس
          </label>
          <input
            id="rr-phone"
            name="phone"
            type="tel"
            dir="ltr"
            inputMode="tel"
            autoComplete="tel"
            className={`${fieldClass} text-right`}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="rr-appliance" className="text-sm font-semibold text-foreground">
            نوع دستگاه
          </label>
          <select id="rr-appliance" name="appliance" defaultValue="" className={fieldClass}>
            <option value="" disabled>
              انتخاب کنید
            </option>
            {appliances.map((appliance) => (
              <option key={appliance.id} value={appliance.id}>
                {appliance.title}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="rr-problem" className="text-sm font-semibold text-foreground">
            مشکل دستگاه
          </label>
          <textarea id="rr-problem" name="problem" rows={4} className={fieldClass} />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-border px-6 text-[0.9375rem] font-semibold text-muted sm:w-auto sm:min-w-52"
          >
            ثبت آنلاین هنوز فعال نیست
          </button>
        </div>
      </fieldset>
    </form>
  );
}
