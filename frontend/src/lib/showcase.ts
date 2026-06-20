import type { Slide, LogoConfig } from "./types";

export interface SeedCarousel {
  id: string;
  title: string;
  showcaseAuthor: string;
  slideCount: number;
  slides: Slide[];
  schemeIndex: number;
  fontIndex: number;
  logo: LogoConfig;
  inverted: boolean;
  presentationTitle: string;
}

const defaultLogo: LogoConfig = {
  letter: "c",
  shape: "blob-1",
  position: "top-right",
  showLogo: true,
  size: 1,
};

export const seedCarousels: SeedCarousel[] = [
  {
    id: "seed-0001",
    title: "Viral Content Blueprint",
    showcaseAuthor: "Carouselify",
    slideCount: 5,
    schemeIndex: 3,
    fontIndex: 0,
    logo: { ...defaultLogo, letter: "V", shape: "blob-3" },
    inverted: false,
    presentationTitle: "Viral Content Blueprint",
    slides: [
      {
        id: "s1",
        type: "cover",
        h1: "Viral Content",
        h2: "Blueprint",
        caption: "A strategic framework for creating share-worthy content in 2026",
      },
      {
        id: "s2",
        type: "content-b1",
        intro: "The Hook",
        h2: "First 3 seconds decide everything",
        body: "On social platforms, scroll-stop velocity determines reach. Lead with curiosity gaps, bold visuals, or counter-intuitive statements. Save the context for frame two.",
      },
      {
        id: "s3",
        type: "list",
        intro: "Format Selection",
        h2: "High-velocity formats by platform",
        items: [
          "Short-form video: 15-30s, direct address, pattern interrupt",
          "Carousel posts: listicle or story arc, 5-7 slides",
          "Threads: 3-5 connected posts, single big idea",
          "Infographic: one scroll-stopping stat above the fold",
        ],
      },
      {
        id: "s4",
        type: "content-b2",
        h1: "Distribution",
        h2: "Owned, earned, and paid loops",
        body: "Great content without distribution is a tree falling in an empty forest. Allocate 20% of effort to creation and 80% to amplification. Cross-post natively, repurpose long-form into short clips, and seed paid behind your top organic performers.",
      },
      {
        id: "s5",
        type: "cta",
        h1: "Ready to go viral?",
        ctaText: "Start your first campaign",
        body: "Download our content calendar template and plan 30 days of scroll-stopping posts.",
      },
    ],
  },
  {
    id: "seed-0002",
    title: "Product Launch Playbook",
    showcaseAuthor: "Carouselify",
    slideCount: 5,
    schemeIndex: 5,
    fontIndex: 2,
    logo: { ...defaultLogo, letter: "L", shape: "blob-2" },
    inverted: false,
    presentationTitle: "Product Launch Playbook",
    slides: [
      {
        id: "s1",
        type: "cover",
        h1: "Product Launch",
        h2: "Playbook",
        caption: "From idea to market in 8 weeks",
      },
      {
        id: "s2",
        type: "content-b1",
        intro: "Phase 1",
        h2: "Validate before you build",
        body: "Talk to 20 potential users before writing a line of code. Find three people who will pay before you launch. Every feature you don't build saves two weeks of engineering time.",
      },
      {
        id: "s3",
        type: "list",
        intro: "Launch checklist",
        h2: "8 weeks to ship",
        items: [
          "Week 1-2: 20 user interviews + problem definition",
          "Week 3-4: MVP build (single workflow, end to end)",
          "Week 5: Closed beta with 10 power users",
          "Week 6-7: Fix critical feedback + prepare assets",
          "Week 8: Launch day — press, email, social",
        ],
      },
      {
        id: "s4",
        type: "content-b2",
        h1: "Pricing",
        h2: "Charge on day one",
        body: "Free tiers attract tire-kickers. Start with a paid plan from launch, even if it's just $9/mo. You'll learn more about real willingness to pay in one week of charging than in three months of free growth.",
      },
      {
        id: "s5",
        type: "cta",
        h1: "Ship with confidence",
        ctaText: "Download the playbook",
        body: "Get the complete launch timeline, email templates, and press kit starter.",
      },
    ],
  },
  {
    id: "seed-0003",
    title: "Design Thinking 101",
    showcaseAuthor: "Carouselify",
    slideCount: 5,
    schemeIndex: 0,
    fontIndex: 1,
    logo: { ...defaultLogo, letter: "D", shape: "blob-4" },
    inverted: true,
    presentationTitle: "Design Thinking 101",
    slides: [
      {
        id: "s1",
        type: "cover",
        h1: "Design Thinking",
        h2: "101",
        caption: "A human-centered approach to problem solving",
      },
      {
        id: "s2",
        type: "list",
        intro: "The five stages",
        h2: "Empathize, Define, Ideate, Prototype, Test",
        items: [
          "Empathize: Understand the user's experience and motivations",
          "Define: Frame the problem you're solving",
          "Ideate: Generate many possible solutions",
          "Prototype: Build quick, low-fidelity experiments",
          "Test: Learn what works and iterate",
        ],
      },
      {
        id: "s3",
        type: "content-b1",
        intro: "Mindset",
        h2: "Bias toward action",
        body: "Design thinkers build to think. A paper prototype tested with five users teaches you more than a month of research reports. The goal is not perfection — it is learning speed.",
      },
      {
        id: "s4",
        type: "content-b2",
        h1: "Cross-functional teams",
        h2: "Diversity fuels better solutions",
        body: "The best ideas come from teams where engineers, marketers, and designers collaborate from the start. Each discipline brings a different lens. Alone, any one group will optimize for what it knows.",
      },
      {
        id: "s5",
        type: "cta",
        h1: "Start designing",
        ctaText: "Run your first workshop",
        body: "Download our facilitator guide with timings, prompts, and templates for each stage.",
      },
    ],
  },
  {
    id: "seed-0004",
    title: "Remote Team Culture",
    showcaseAuthor: "Carouselify",
    slideCount: 4,
    schemeIndex: 2,
    fontIndex: 3,
    logo: { ...defaultLogo, letter: "R", shape: "blob-5" },
    inverted: false,
    presentationTitle: "Remote Team Culture",
    slides: [
      {
        id: "s1",
        type: "cover",
        h1: "Remote Team",
        h2: "Culture",
        caption: "Building connection across time zones and screens",
      },
      {
        id: "s2",
        type: "list",
        intro: "The fundamentals",
        h2: "Four pillars of remote culture",
        items: [
          "Asynchronous-first communication (document, don't meet)",
          "Weekly all-hands with personal check-ins (5 min, no agenda)",
          "Transparent decision logs accessible to everyone",
          "Annual in-person gathering for deep connection",
        ],
      },
      {
        id: "s3",
        type: "content-b2",
        h1: "Tools",
        h2: "Less is more",
        body: "Every new tool is a tax on attention. A remote team needs four things: asynchronous messaging, a knowledge base, a task tracker, and a video link. Everything else is optional and likely harmful.",
      },
      {
        id: "s4",
        type: "cta",
        h1: "Build your remote playbook",
        ctaText: "Get the culture guide",
        body: "A practical handbook for distributed teams: onboarding, communication norms, and team rituals.",
      },
    ],
  },
];
