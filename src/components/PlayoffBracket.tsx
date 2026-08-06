import { CLASSIFICATIONS } from '@/lib/constants';
import { getCurrentSeasonYear } from '@/lib/seasonIntelligence';

interface PlayoffBracketProps {
  classification: string;
  division: string;
}

export default function PlayoffBracket({ classification, division }: PlayoffBracketProps) {
  const classInfo = CLASSIFICATIONS.find((item) => item.id === classification);
  const seasonYear = getCurrentSeasonYear();

  return (
    <div role="status" className={`rounded-xl border-2 p-8 text-center ${classInfo?.bgColor || 'bg-gray-900'} ${classInfo?.borderColor || 'border-gray-700'}`}>
      <p className={`text-sm font-black uppercase tracking-[0.2em] ${classInfo?.textColor || 'text-orange-300'}`}>
        {classification} Division {division}
      </p>
      <h3 className="mt-2 text-2xl font-black text-white">{seasonYear} bracket not published</h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-400">
        This bracket will populate only after the UIL publishes the official current-season playoff field. No projected teams or prior-season results are shown as current.
      </p>
    </div>
  );
}
