import JournalEntry from '../JournalEntry';

export default function JournalEntryExample() {
  return (
    <div className="p-6 max-w-2xl">
      <JournalEntry
        prompt="Which image surprised you? What did you notice that you'd never seen before?"
        onSave={(content) => console.log('Saved:', content)}
      />
    </div>
  );
}
