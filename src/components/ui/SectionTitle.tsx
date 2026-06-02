interface SectionTitleProps {
  title: string;
  subtitle: string;
}

export default function SectionTitle({
  title,
  subtitle,
}: SectionTitleProps) {
  return (
    <div className="mb-12">
      <p className="mb-3 text-sm uppercase tracking-widest text-cyan-400">
        {subtitle}
      </p>

      <h2 className="text-4xl font-bold text-white md:text-5xl">
        {title}
      </h2>
    </div>
  );
}