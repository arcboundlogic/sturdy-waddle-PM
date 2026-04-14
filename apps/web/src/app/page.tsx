import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐧</span>
            <span className="text-xl font-bold text-slate-900">Waddle PM</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Get Started Free
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            The PM platform that{' '}
            <span className="text-brand-600">understands your work</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            AI-native project management built for technical and creative teams. Knowledge
            graphs, living documentation, and an AI copilot — from solo projects to
            enterprise scale.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-4">
            <Link
              href="/signup"
              className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              Start for Free
            </Link>
            <Link
              href="/docs"
              className="text-sm font-semibold leading-6 text-slate-900 hover:text-brand-600"
            >
              View Documentation <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mx-auto mt-20 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon="🧠"
            title="Knowledge Graph"
            description="Every task, decision, and artifact connected in a queryable graph. Context is never lost."
          />
          <FeatureCard
            icon="🤖"
            title="AI Copilot"
            description="Draft plans, predict risks, generate reports, and answer 'why did we decide X?' instantly."
          />
          <FeatureCard
            icon="⚡"
            title="Developer Native"
            description="Git integration, CI/CD awareness, CLI tool, and API-first design for engineering teams."
          />
          <FeatureCard
            icon="📊"
            title="Real-Time Dashboards"
            description="Burndown, velocity, cycle time — live analytics that drive better decisions."
          />
          <FeatureCard
            icon="🔒"
            title="Enterprise Ready"
            description="SSO, SCIM, audit logs, data residency, and compliance modules from day one."
          />
          <FeatureCard
            icon="🔄"
            title="Flexible Workflows"
            description="Kanban, Gantt, table, calendar, and graph views. Customize workflows per project."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Sturdy Waddle PM. Built for teams that build.
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-3 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}
