import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/layout/Panel";
import { site } from "@/content/site";

export default function NotFound() {
  return (
    <Panel title="This signal didn't resolve." description="The page you're looking for isn't here. Head back to the console and try a prompt.">
      <p className="font-hand text-2xl text-accent">404</p>
      <div className="mt-8">
        <Button href="/" variant="primary" size="lg">
          Return to {site.name}
          <span aria-hidden>→</span>
        </Button>
      </div>
    </Panel>
  );
}
