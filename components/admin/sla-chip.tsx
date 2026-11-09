import { slaLabel, type SlaState } from '@/lib/sla'

export function SlaChip({ state }: { state: SlaState }) {
  return <span className={`sla ${state.kind}`}>{slaLabel(state)}</span>
}
