
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
      <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
        {title}
      </h2>
      <p className="mx-auto max-w-2xl text-sm text-secondary-text sm:text-base">{description}</p>
    </div>
  );
}
