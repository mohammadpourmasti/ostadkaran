import type { SmsParams, SmsTemplate } from "./types";

// Persian message bodies. The text is built in memory only for the provider call; it is never logged or stored.
// Each template lists the params it needs so a missing value fails loudly instead of sending a broken message.

type TemplateDefinition = { required: readonly string[]; render: (params: SmsParams) => string };

const definitions: Record<SmsTemplate, TemplateDefinition> = {
  technician_invite: {
    required: ["name", "link"],
    render: (p) => `${p.name} عزیز، حساب شما در استادکاران ساخته شد. برای فعال‌سازی وارد لینک شوید: ${p.link}`,
  },
  password_reset_link: {
    required: ["link"],
    render: (p) => `برای تعیین رمز عبور استادکاران وارد این لینک شوید: ${p.link}\nاگر درخواست نداده‌اید نادیده بگیرید.`,
  },
  assignment_new: {
    required: ["appliance"],
    render: (p) => `مأموریت جدید ${p.appliance} به شما سپرده شد. جزئیات را در پنل ببینید.`,
  },
  assignment_changed: {
    required: ["appliance"],
    render: (p) => `مسئولیت درخواست ${p.appliance} تغییر کرد یا لغو شد. جزئیات را در پنل ببینید.`,
  },
  operational: {
    required: ["text"],
    render: (p) => p.text,
  },
};

export function renderSms(template: SmsTemplate, params: SmsParams): string | null {
  const definition = definitions[template];
  if (!definition.required.every((key) => typeof params[key] === "string" && params[key] !== "")) return null;
  return definition.render(params);
}
