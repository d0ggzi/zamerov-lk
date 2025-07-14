import { useState } from 'react';

export default function TimePicker24({ value, onChange }) {
  const [time, setTime] = useState({
    hours: value?.hours || '00',
    minutes: value?.minutes || '00'
  });

  // Генерация часов (00-23)
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  // Генерация минут (00-59)
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newTime = { ...time, [name]: value };
    setTime(newTime);
    if (onChange) onChange(newTime);
  };

  return (
    <div className="flex items-center gap-2 mb-5">
      {/* Выбор часов */}
      <select
        name="hours"
        value={time.hours}
        onChange={handleChange}
        className="flex-1 appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {hours.map((hour) => (
          <option key={hour} value={hour}>
            {hour}
          </option>
        ))}
      </select>

      <span className="text-gray-500">:</span>

      {/* Выбор минут */}
      <select
        name="minutes"
        value={time.minutes}
        onChange={handleChange}
        className="flex-1 appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {minutes.map((minute) => (
          <option key={minute} value={minute}>
            {minute}
          </option>
        ))}
      </select>
    </div>
  );
}