export default function ProgressBar({
  value = 0,
  width = "100%",
  height = "8px",
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      style={{ width, height }}
      className="bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        style={{ width: `${clamped}%` }}
        className="h-full bg-electricBlue rounded-full transition-all duration-500 ease-in-out"
      />
    </div>
  );
}
