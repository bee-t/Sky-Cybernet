import { debugReplies } from '../actions';

export default async function DebugPage() {
  const data = await debugReplies();

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-mono text-[#00ff41] mb-8">{'>'} DEBUG DATABASE</h1>
        
        <div className="bg-black border border-[#00ff41]/30 p-6 rounded font-mono text-[#00ff41] text-sm">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
