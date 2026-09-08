const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || "";

function whatsappUrl(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `https://wa.me/234${digits.slice(1)}`;
  if (digits.startsWith("234")) return `https://wa.me/${digits}`;
  return `https://wa.me/${digits}`;
}

export function WhatsAppFloat() {
  const href = whatsappUrl(rawNumber);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with TEKSUM on WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg ring-4 ring-background transition duration-200 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="size-7 fill-current"
      >
        <path d="M16 3.5a12.45 12.45 0 0 0-10.7 18.8L3.5 28.5l6.35-1.67A12.45 12.45 0 1 0 16 3.5Zm0 22.5a10 10 0 0 1-5.1-1.4l-.36-.21-3.77 1 .99-3.67-.24-.38A10 10 0 1 1 16 26Zm5.48-7.47c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-1.77-.88-2.93-1.58-4.1-3.58-.31-.54.31-.5.89-1.66.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.5 1.7.64.72.23 1.38.2 1.9.12.58-.09 1.76-.72 2-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
      </svg>
    </a>
  );
}
