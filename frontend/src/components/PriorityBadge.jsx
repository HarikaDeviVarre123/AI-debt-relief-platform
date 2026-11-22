export default function PriorityBadge({ level }) {
  return (
    <span
      className={`priority-${level} inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold`}
    >
      {level}
    </span>
  )
}
