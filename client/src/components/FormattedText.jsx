import { Link } from "react-router-dom";

export function FormattedText({ text = "", className = "" }) {
  if (!text) return null;

  // Match #hashtags and @mentions
  const parts = text.split(/([#@][\w-]+)/g);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("#")) {
          const tag = part.slice(1);
          return (
            <Link
              key={i}
              to={`/explore?tag=${encodeURIComponent(tag.toLowerCase())}`}
              className="font-medium text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        if (part.startsWith("@")) {
          const username = part.slice(1);
          return (
            <Link
              key={i}
              to={`/profile/${encodeURIComponent(username.toLowerCase())}`}
              className="font-medium text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        return part;
      })}
    </span>
  );
}
