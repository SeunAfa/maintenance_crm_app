export default function  SectionHeading({
  title,
  description,
  isDescriptionHidden,
}) {
  return (
    <div className="border-b border-white/10 pb-5 mb-5">
      <h1 className="text-base font-semibold text-white text-left">{title}</h1>
      {!isDescriptionHidden && (
        <p className="mt-2 max-w-4xl text-sm text-gray-400 text-left">
          {description}
        </p>
      )}
    </div>
  );
}
