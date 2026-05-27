import { WhoIsKrishant } from "@/components/about/WhoIsKrishant";
import { Currently } from "@/components/about/Currently";

/** About window body: the lead statement, principles, and Currently snapshot. */
export function AboutView() {
  return (
    <div>
      <p className="font-hand text-xl text-accent sm:text-2xl">The person behind it</p>
      <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        Who is Krishant?
      </h3>
      <div className="mt-8">
        <WhoIsKrishant />
      </div>
      <div className="mt-12 max-w-md">
        <Currently />
      </div>
    </div>
  );
}
