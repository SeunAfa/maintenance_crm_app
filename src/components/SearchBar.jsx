import { useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function SearchBar({
  placeholder = "Search...",
  onSearch,
  defaultValue = "",
  className = "",
}) {
  const [query, setQuery] = useState(defaultValue);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch?.("");
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-obsidianNight/60 border border-obsidianHighlight focus-within:border-electricBlue/40 transition-colors">
        <MagnifyingGlassIcon className="size-3.5 text-white/30 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-xs text-white placeholder:text-white/25 outline-none min-w-0"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="text-white/25 hover:text-white/60 text-[10px] shrink-0"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </form>
  );
}
