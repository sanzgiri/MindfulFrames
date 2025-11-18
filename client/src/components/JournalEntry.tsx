import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BookOpen, Save } from "lucide-react";
import { useState } from "react";

interface JournalEntryProps {
  prompt: string;
  initialValue?: string;
  onSave: (content: string) => void;
}

export default function JournalEntry({ prompt, initialValue = '', onSave }: JournalEntryProps) {
  const [content, setContent] = useState(initialValue);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSave(content);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <CardTitle className="text-base mb-2">Reflection</CardTitle>
            <p className="text-sm text-muted-foreground font-normal">{prompt}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Write your reflections here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[150px] resize-none"
          data-testid="textarea-journal"
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {content.length} characters
          </span>
          <Button 
            onClick={handleSave} 
            size="sm"
            data-testid="button-save-journal"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaved ? 'Saved!' : 'Save'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
