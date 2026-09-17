import { SystemSettings } from './_components';

export default function SystemPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-20 max-w-4xl mx-auto w-full">
      <SystemSettings />
    </div>
  );
}
