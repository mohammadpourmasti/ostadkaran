
export function FloatingCallButton() {
    return (
      <a
        href="tel:08634859005"
        aria-label="تماس با دفتر استادکاران"
        className="fixed bottom-24 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-[#F59E0B] text-white shadow-lg shadow-slate-900/20 transition-transform hover:scale-105 active:scale-95 lg:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-6"
          aria-hidden="true"
        >
          <path
            d="M5 4.5h3l1.5 4-2 1.5a15 15 0 0 0 6.5 6.5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.5 1.5C10 20.5 3.5 14 3.5 6A1.5 1.5 0 0 1 5 4.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    );
  }
  