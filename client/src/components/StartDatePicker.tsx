import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface StartDatePickerProps {
  onDateSelect: (date: Date) => void;
}

export default function StartDatePicker({ onDateSelect }: StartDatePickerProps) {
  const [date, setDate] = useState<Date>();

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      onDateSelect(selectedDate);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Choose Your Start Date</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Select when you'd like to begin your 10-week mindfulness and photography journey. 
          The course content will automatically adjust to your chosen season.
        </p>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              data-testid="button-select-date"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {date && (
          <div className="p-3 rounded-md bg-accent">
            <p className="text-sm">
              Your journey will begin on <strong>{format(date, "MMMM d, yyyy")}</strong>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
