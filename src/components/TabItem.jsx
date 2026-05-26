import { ChevronDownIcon } from "@heroicons/react/16/solid";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function TabItem({ tabs, onTabChange }) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:hidden">
        <select
          value={tabs.find((tab) => tab.current)?.name ?? ""}
          onChange={(e) => onTabChange?.(e.target.value)}
          aria-label="Select a tab"
          className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-2 pr-8 pl-3 text-base text-gray-100 outline-1 -outline-offset-1 outline-white/10 *:bg-gray-800 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-400"
        />
      </div>
      <div className="hidden sm:block">
        <div>
          <nav aria-label="Tabs" className="-mb-px flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                type="button"
                onClick={() => onTabChange?.(tab.name)}
                aria-current={tab.current ? "page" : undefined}
                className={classNames(
                  tab.current
                    ? "bg-electricBlue/10 border-electricBlue text-electricBlue font-semibold"
                    : "bg-transparent border-transparent text-white/55 hover:bg-white/[0.04] hover:text-white/85",
                  "rounded-t-md border-b-2 px-3 py-1.5 text-sm whitespace-nowrap cursor-pointer transition-colors"
                )}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
