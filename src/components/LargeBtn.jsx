const LargeBtn = ({
  text,
  conditional = false,
  isConditionalActive = true,
  onClick,
  type = "button",
}) => {
  // Base styles for all buttons
  const baseStyle =
    "mt-4 flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold transition-all duration-300";

  // Decide style
  const style = conditional
    ? isConditionalActive
      ? "bg-electricBlue text-white shadow-lg shadow-electricBlue/25 hover:-translate-y-0.5 cursor-pointer"
      : "bg-obsidianElevated text-white/70 cursor-default"
    : "bg-obsidianElevated text-white shadow-lg shadow-obsidianElevated/25 hover:bg-electricBlue hover:shadow-electricBlue/25 active:bg-electricBlue active:shadow-electricBlue/25 hover:-translate-y-0.5 cursor-pointer";

  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${style}`}>
      {text}
    </button>
  );
};

export default LargeBtn;
