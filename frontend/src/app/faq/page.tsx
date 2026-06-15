"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthProvider } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";

const faqs = [
  {
    q: "What is Carouselify?",
    a: "Carouselify lets you create professional social media carousel posts in minutes. Pick a template, fill in your content, and export as PNG or PDF. No design skills needed.",
  },
  {
    q: "Is Carouselify free?",
    a: "The free tier includes all core features: unlimited carousels, all 10 color schemes, 4 font pairings, and PNG/PDF export. Premium unlocks AI-powered slide generation, custom logo upload, and priority support.",
  },
  {
    q: "How do I export my carousel?",
    a: "Click Export PNG or Export PDF in the bottom bar. Each slide renders as a separate file (carouselify-01.png, carouselify-02.png, etc.) or all slides combined in a single PDF.",
  },
  {
    q: "Can I share my carousel with others?",
    a: "Yes. Save your carousel first, then click Generate share link in the Share panel. Anyone with the link can view a read-only version and clone it into their own editor.",
  },
  {
    q: "What image formats are supported for logo upload?",
    a: "PNG, JPEG, WebP, and GIF. Files must be under 2 MB. Logo upload is a Premium feature.",
  },
  {
    q: "Is there a limit on slides?",
    a: "You can create up to 12 slides per carousel. If you need more, consider consolidating content or using fewer slides with a stronger narrative arc.",
  },
  {
    q: "Can I use my own fonts?",
    a: "The editor offers 4 curated font pairings (Fraunces + DM Sans, Playfair Display + Inter, Bitter + Nunito Sans, Fredoka + Lexend Deca). Custom fonts are not supported.",
  },
  {
    q: "How does AI generation work?",
    a: "Premium users can generate a full carousel from a text prompt. Describe your topic and the AI creates the slide structure and copy. You keep full control to edit afterward.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <span>{q}</span>
        <svg
          className={`w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-200 motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-prose">
          {a}
        </div>
      )}
    </div>
  );
}

function FaqPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <SiteHeader title="FAQ" maxWidth="max-w-3xl" />

      <main className="max-w-3xl mx-auto p-6 space-y-8">
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-6 transition-colors">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Frequently asked questions
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Everything you need to know about Carouselify.
          </p>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-6 transition-colors">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Still have questions?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Send us a message and we&apos;ll get back to you.
          </p>
          <ContactForm />
        </section>
      </main>
    </div>
  );
}

export default function Faq() {
  return (
    <AuthProvider>
      <FaqPage />
    </AuthProvider>
  );
}

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setBusy(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      setSent(true);
    } catch {
      // silently fail — form submit is best-effort
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
        Thanks for reaching out. We&apos;ll respond to {email} as soon as possible.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
      <div>
        <label htmlFor="name" className="sr-only">
          Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition-colors"
        />
      </div>
      <div>
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition-colors"
        />
      </div>
      <div>
        <label htmlFor="message" className="sr-only">
          Message
        </label>
        <textarea
          id="message"
          placeholder="Your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition-colors resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={busy || !name || !email || !message}
        className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
      >
        {busy ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
