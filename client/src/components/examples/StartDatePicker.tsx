import StartDatePicker from '../StartDatePicker';

export default function StartDatePickerExample() {
  return (
    <div className="p-6 max-w-md">
      <StartDatePicker
        onDateSelect={(date) => console.log('Selected date:', date)}
      />
    </div>
  );
}
