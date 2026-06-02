interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
}

export default function Button({
  children,
  href = "#",
  variant = "primary",
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-xl px-6 py-3 font-medium transition-all duration-300";

  const variants = {
    primary:
      "bg-cyan-400 text-black hover:bg-cyan-300",
    secondary:
      "border border-zinc-700 text-white hover:border-cyan-400 hover:text-cyan-400",
  };

  return (
    <a
      href={href}
      className={`${baseStyles} ${variants[variant]}`}
    >
      {children}
    </a>
  );
}