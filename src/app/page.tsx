import { site } from "@/content/site";
import { ventures } from "@/content/ventures";
import { Hero } from "@/components/hero/Hero";
import { Section } from "@/components/layout/Section";
import { VentureGrid } from "@/components/ventures/VentureGrid";
import { VentureConstellation } from "@/components/ventures/VentureConstellation";
import { CreatorHQMap } from "@/components/ventures/CreatorHQMap";
import { CredentialsSection } from "@/components/credentials/CredentialsSection";
import { WhoIsKrishant } from "@/components/about/WhoIsKrishant";
import { ContactCTA } from "@/components/contact/ContactCTA";

export default function HomePage() {
  const { sections } = site;

  return (
    <>
      <Hero />

      {/* 02 — Ventures */}
      <Section
        id="ventures"
        eyebrow={sections.ventures.eyebrow}
        title={sections.ventures.title}
        lede={sections.ventures.lede}
      >
        <VentureGrid ventures={ventures} />
      </Section>

      {/* 03 — Interactive system map / constellation */}
      <Section
        id="map"
        eyebrow={sections.constellation.eyebrow}
        title={sections.constellation.title}
        lede={sections.constellation.lede}
      >
        <VentureConstellation />
      </Section>

      {/* 04 — CreatorHQ ecosystem */}
      <Section
        id="creatorhq"
        eyebrow={sections.creatorHq.eyebrow}
        title={sections.creatorHq.title}
        lede={sections.creatorHq.lede}
      >
        <CreatorHQMap />
      </Section>

      {/* 05 — Credentials */}
      <Section
        id="credentials"
        eyebrow={sections.credentials.eyebrow}
        title={sections.credentials.title}
        lede={sections.credentials.lede}
      >
        <CredentialsSection />
      </Section>

      {/* 06 — Who is Krishant? */}
      <Section
        id="who"
        eyebrow={sections.who.eyebrow}
        title={sections.who.title}
      >
        <WhoIsKrishant />
      </Section>

      {/* 07 — Connect */}
      <Section id="connect" compact>
        <ContactCTA />
      </Section>
    </>
  );
}
