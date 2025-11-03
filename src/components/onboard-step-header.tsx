
interface OnboardStepHeaderProps {
  title: string;
  description: string;
}

export function OnboardStepHeader({
  title,
  description,
}: OnboardStepHeaderProps) {
  return (
    <div className="space-y-4 text-center">
      <h2 className="bg-gradient-to-r from-[#00cfb1] to-[#1effbf] bg-clip-text text-3xl font-bold text-transparent">
        {title}
      </h2>
      <p className="mx-auto max-w-2xl text-[#ba93ff]">{description}</p>
    </div>
  );
}
