interface CardProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function Card({
  title = "Sample Card",
  description = "This is a sample card component that uses the theme variables from globals.css. It demonstrates proper styling with custom colors and typography.",
  className = ""
}: CardProps) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-lg border p-6 transition-shadow duration-200 hover:shadow-md focus-ring ${className}`}
      style={{
        backgroundColor: 'var(--color-bg-1)',
        borderColor: 'var(--color-divider)',
        color: 'var(--color-text-default)',
      }}
      tabIndex={0}
      role="article"
      aria-labelledby="card-title"
    >
      <div className="flex flex-col gap-3">
        <h2
          id="card-title"
          className="font-semibold"
          style={{
            fontSize: 'var(--text-h3)',
            lineHeight: '32px',
            letterSpacing: '-0.017em',
            color: 'var(--color-text-default)',
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: 'var(--text-body-16)',
            lineHeight: '24px',
            letterSpacing: '-0.011em',
            color: 'var(--color-text-secondary)',
          }}
        >
          {description}
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 hover:opacity-80 focus-ring"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-bg-0)',
          }}
          aria-label="Primary action"
        >
          Action
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors duration-200 hover:opacity-80 focus-ring"
          style={{
            borderColor: 'var(--color-divider)',
            color: 'var(--color-text-default)',
            backgroundColor: 'transparent',
          }}
          aria-label="Secondary action"
        >
          Learn More
        </button>
      </div>
    </div>
  );
}