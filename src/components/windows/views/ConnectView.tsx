import { ContactCTA } from "@/components/contact/ContactCTA";

/** Connect window body: the email + LinkedIn CTA. */
export function ConnectView() {
  return (
    <div>
      <p className="font-hand text-xl text-accent sm:text-2xl">Say hello</p>
      <ContactCTA />
    </div>
  );
}
