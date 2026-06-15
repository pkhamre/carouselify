"use client";

import Link from "next/link";
import { AuthProvider } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <SiteHeader />

      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Privacy Policy</h1>
        <article className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-6 transition-colors prose prose-sm prose-gray dark:prose-invert max-w-none">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Last updated: June 15, 2026</p>

          <Section title="Information we collect">
            <p>
              We collect information you provide when using Carouselify: the content you create (slide text, images,
              carousel data), your email address if you register, and account preferences. Guest users are assigned a
              random identifier stored in your browser; no email is required.
            </p>
          </Section>

          <Section title="How we use your information">
            <p>
              Your data is used solely to operate Carouselify: save and load your carousels, process exports, manage
              subscriptions, and provide customer support. We do not sell your personal information or carousel content
              to third parties.
            </p>
          </Section>

          <Section title="Data storage">
            <p>
              Carousels and account data are stored on our servers. You can delete individual carousels or your entire
              account at any time. Deleted data is removed within 30 days. Export processing happens entirely in your
              browser — slide content is not uploaded to our servers during export.
            </p>
          </Section>

          <Section title="Cookies and tracking">
            <p>
              We use essential cookies for authentication (JWT tokens stored in localStorage) and optional analytics
              via PostHog if you have consented. PostHog captures anonymous usage events (feature usage, export
              counts) with page views and autocapture disabled. No tracking cookies are used for advertising.
            </p>
          </Section>

          <Section title="Third-party services">
            <p>
              Carouselify integrates with Lemon Squeezy for payment processing and OpenAI for AI-generated slides.
              These services receive only the data necessary to perform their function. Lemon Squeezy handles
              subscription payments; we do not store payment card information. OpenAI receives slide prompts when
              you use the AI generation feature. Google Fonts are loaded in the carousel editor for slide rendering.
            </p>
          </Section>

          <Section title="Data sharing">
            <p>
              If you choose to share a carousel, a read-only view is accessible to anyone with the share link. Shared
              carousels can be cloned by other users. You can revoke a share link at any time, which disables access
              for future visitors.
            </p>
          </Section>

          <Section title="Your rights">
            <p>
              You can access, update, or delete your account and carousels at any time through the editor interface.
              For data access requests or account deletion, contact us at the email address below. We respond to all
              requests within 30 days.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              We may update this Privacy Policy from time to time. Material changes will be communicated via email
              (for registered users) or through the application. Continued use of Carouselify after changes
              constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about this Privacy Policy can be sent to our support team through the{" "}
              <Link href="/faq" className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 underline underline-offset-2 transition-colors">
                FAQ page
              </Link>
              .
            </p>
          </Section>
        </article>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 last:mb-0">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h2>
      <div className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function Privacy() {
  return (
    <AuthProvider>
      <PrivacyPage />
    </AuthProvider>
  );
}
