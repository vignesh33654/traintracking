import Card from "../components/card";

export default function HomePage() {
  return (
    <div
      className="min-h-screen p-8"
      style={{ backgroundColor: 'var(--color-bg-0)' }}
    >
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1
            className="mb-2 font-semibold"
            style={{
              fontSize: 'var(--text-h1)',
              lineHeight: '40px',
              letterSpacing: '-0.021em',
              color: 'var(--color-text-default)',
            }}
          >
            Card Components
          </h1>
          <p
            style={{
              fontSize: 'var(--text-body-16)',
              lineHeight: '24px',
              letterSpacing: '-0.011em',
              color: 'var(--color-text-secondary)',
            }}
          >
            Demonstrating cards using the theme variables from globals.css
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card
            title="Primary Card"
            description="This card showcases the primary styling with theme colors and typography from globals.css."
          />
        </div>
      </div>
    </div>
  );
}