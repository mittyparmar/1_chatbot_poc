import React, { useState } from 'react';

export interface CalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  className?: string;
  variant?: 'default' | 'minimal' | 'card';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  disabledDates?: Date[];
  selectedDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
  showWeekNumbers?: boolean;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  locale?: string;
  events?: Array<{
    date: Date;
    title: string;
    color?: string;
  }>;
  onEventClick?: (event: any) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  value = new Date(),
  onChange,
  className = '',
  variant = 'default',
  size = 'md',
  color = 'primary',
  disabledDates = [],
  selectedDates = [],
  minDate,
  maxDate,
  showTime = false,
  showWeekNumbers = false,
  firstDayOfWeek = 0,
  locale = 'en-US',
  events = [],
  onEventClick,
}) => {
  const [currentDate, setCurrentDate] = useState(value);
  const [selectedDate, setSelectedDate] = useState(value);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date: Date) => {
    return disabledDates.some(disabledDate => 
      date.toDateString() === disabledDate.toDateString()
    );
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some(selectedDate => 
      date.toDateString() === selectedDate.toDateString()
    );
  };

  const isDateToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isDateInRange = (date: Date) => {
    if (!minDate && !maxDate) return true;
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    return true;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date) || !isDateInRange(date)) return;
    
    setSelectedDate(date);
    onChange?.(date);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isDisabled = isDateDisabled(date) || !isDateInRange(date);
      const isSelected = isDateSelected(date) || date.toDateString() === selectedDate.toDateString();
      const isToday = isDateToday(date);
      const dayEvents = getEventsForDate(date);

      days.push(
        <div
          key={`day-${day}`}
          className={`
            p-2 text-center cursor-pointer rounded-lg transition-colors
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
            ${isSelected ? 'bg-blue-500 text-white' : ''}
            ${isToday && !isSelected ? 'bg-blue-100 font-bold' : ''}
            ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'}
          `}
          onClick={() => handleDateClick(date)}
        >
          <div className="flex flex-col items-center">
            <span>{day}</span>
            {dayEvents.length > 0 && (
              <div className="flex space-x-1 mt-1">
                {dayEvents.slice(0, 3).map((event, index) => (
                  <div
                    key={index}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: event.color || '#3B82F6' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-xs">+{dayEvents.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const colorClasses = {
    primary: 'border-primary-200',
    secondary: 'border-gray-200',
    success: 'border-green-200',
    warning: 'border-yellow-200',
    error: 'border-red-200',
    info: 'border-blue-200',
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${colorClasses[color]} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {'<'}
        </button>
        <h3 className={`font-semibold ${sizeClasses[size]}`}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {'>'}
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day, index) => (
            <div key={day} className={`text-center font-medium text-gray-500 ${sizeClasses[size]}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {renderCalendar()}
        </div>
      </div>

      {/* Time Picker */}
      {showTime && (
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <input
              type="time"
              value={selectedDate.toTimeString().slice(0, 5)}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':');
                const newDate = new Date(selectedDate);
                newDate.setHours(parseInt(hours), parseInt(minutes));
                setSelectedDate(newDate);
                onChange?.(newDate);
              }}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export interface CalendarItemProps {
  date?: Date;
  onChange?: (date: Date) => void;
  className?: string;
  variant?: 'default' | 'minimal' | 'card';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  disabledDates?: Date[];
  selectedDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
  showWeekNumbers?: boolean;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  locale?: string;
  events?: Array<{
    date: Date;
    title: string;
    color?: string;
  }>;
  onEventClick?: (event: any) => void;
}

export const CalendarItem: React.FC<CalendarItemProps> = ({
  date = new Date(),
  onChange,
  className = '',
  variant = 'default',
  size = 'md',
  color = 'primary',
  disabledDates = [],
  selectedDates = [],
  minDate,
  maxDate,
  showTime = false,
  showWeekNumbers = false,
  firstDayOfWeek = 0,
  locale = 'en-US',
  events = [],
  onEventClick,
}) => {
  return (
    <Calendar
      value={date}
      onChange={onChange}
      className={className}
      variant={variant}
      size={size}
      color={color}
      disabledDates={disabledDates}
      selectedDates={selectedDates}
      minDate={minDate}
      maxDate={maxDate}
      showTime={showTime}
      showWeekNumbers={showWeekNumbers}
      firstDayOfWeek={firstDayOfWeek}
      locale={locale}
      events={events}
      onEventClick={onEventClick}
    />
  );
};

export default Calendar;