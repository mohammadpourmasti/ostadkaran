import { logoutAction } from "@/actions/admin/auth";
import { LogoutIcon } from "./icons";

export function SignOutButton({ className = "" }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-white/75 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
      >
        <LogoutIcon className="size-5 shrink-0" />
        خروج از حساب
      </button>
    </form>
  );
}
