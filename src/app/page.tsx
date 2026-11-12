import { Hero } from "@/components/hero/Hero";
import { SuryaFamily } from "@/components/surya/SuryaFamily";
import { HowIBuild } from "@/components/build/HowIBuild";
import { DayJob } from "@/components/credentials/DayJob";
import { Certifications } from "@/components/credentials/Certifications";
import { EarlierVentures } from "@/components/ventures/EarlierVentures";
import { ContactCTA } from "@/components/contact/ContactCTA";

/**
 * One scrolling page, server-rendered. Every section reads from the content
 * files; the assistant in the hero is the only interactive island.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <SuryaFamily />
      <HowIBuild />
      <DayJob />
      <Certifications />
      <EarlierVentures />
      <ContactCTA />
    </>
  );
}
