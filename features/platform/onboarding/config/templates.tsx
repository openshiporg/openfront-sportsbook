import { Building2, Package } from 'lucide-react'
import seed from '../lib/seed.json'

/**
 * Demo templates, described like E-commerce's STORE_TEMPLATES. Both run through the one server mutation
 * `applySportsbookOnboarding(..., template)`; the template only picks which fictional seeded events (with
 * markets and opening prices) are added. Every event is written with `onboarding:` external keys and
 * SANDBOX_ONBOARDING audit provenance. Existing events are kept; nothing is replaced.
 */
export type DemoTemplateKey = 'full' | 'minimal'

type SeedEvent = { key: string; name: string; markets: unknown[] }
type SeedCompetition = { name: string; events: SeedEvent[] }
const competitions = seed.catalog.sports.flatMap(sport => sport.competitions as SeedCompetition[])

function describe(key: DemoTemplateKey) {
  const picked = new Set<string>(seed.templates[key].events)
  const events = competitions.flatMap(competition => competition.events.filter(event => picked.has(event.key)))
  return {
    events: events.map(event => event.key),
    markets: events.reduce((sum, event) => sum + event.markets.length, 0),
    displayNames: {
      operator: [seed.operator.brandName],
      sports: seed.catalog.sports.map(sport => sport.name),
      competitions: competitions.filter(competition => competition.events.some(event => picked.has(event.key))).map(competition => competition.name),
      events: events.map(event => event.name),
    },
  }
}

export const DEMO_TEMPLATES = {
  full: {
    name: 'Complete Setup',
    description: 'Every fictional fixture in the seed: four sports, four competitions, priced markets.',
    icon: <Building2 className="h-5 w-5" />,
    ...describe('full'),
  },
  minimal: {
    name: 'Basic Setup',
    description: 'One fictional fixture per sport, priced, for a quick look at the book.',
    icon: <Package className="h-5 w-5" />,
    ...describe('minimal'),
  },
} satisfies Record<DemoTemplateKey, unknown>
