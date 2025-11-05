
interface OnboardStepHeaderProps {
  title: string;
  description: string;
}

export function OnboardStepHeader({
  title,
  description,
}: OnboardStepHeaderProps) {
  return (
    <div className="space-y-3 text-center sm:space-y-4">
      <h2 className="bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
        {title}
      </h2>
      <p className="mx-auto max-w-2xl text-sm text-[#ba93ff] sm:text-base">{description}</p>
    </div>
  );
}
