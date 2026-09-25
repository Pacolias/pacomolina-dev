export function Chips({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-xs text-stone-600 dark:border-stone-800 dark:bg-stone-800/40 dark:text-stone-400"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
