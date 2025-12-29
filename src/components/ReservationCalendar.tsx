import React, { useMemo } from 'react';
import { Calendar, momentLocalizer, View, Event as BigCalendarEvent } from 'react-big-calendar';
import moment from 'moment';
import { Reservation } from '../types/api';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface ReservationCalendarProps {
  reservations: Reservation[];
  onSelectSlot?: (start: Date, end: Date) => void;
  onSelectEvent?: (reservation: Reservation) => void;
}

interface CalendarEvent extends BigCalendarEvent {
  reservation: Reservation;
  status: string;
}

const getEventStyle = (status: string) => {
  const styles: Record<string, { backgroundColor: string; borderColor: string; color: string }> = {
    pending: { backgroundColor: '#fef3c7', borderColor: '#f59e0b', color: '#78350f' },
    confirmed: { backgroundColor: '#dbeafe', borderColor: '#3b82f6', color: '#1e3a8a' },
    active: { backgroundColor: '#d1fae5', borderColor: '#10b981', color: '#065f46' },
    completed: { backgroundColor: '#e5e7eb', borderColor: '#6b7280', color: '#1f2937' },
    cancelled: { backgroundColor: '#fee2e2', borderColor: '#ef4444', color: '#7f1d1d' },
  };
  return styles[status] || styles.pending;
};

export const ReservationCalendar: React.FC<ReservationCalendarProps> = ({
  reservations,
  onSelectSlot,
  onSelectEvent,
}) => {
  const events: CalendarEvent[] = useMemo(() => {
    return reservations.map((reservation) => ({
      title: reservation.asset_name || 'Unknown Asset',
      start: new Date(reservation.reservation_start),
      end: new Date(reservation.reservation_end),
      reservation,
      status: reservation.status,
    }));
  }, [reservations]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const style = getEventStyle(event.status);
    return {
      style: {
        backgroundColor: style.backgroundColor,
        borderLeft: `4px solid ${style.borderColor}`,
        color: style.color,
        borderRadius: '4px',
        padding: '2px 5px',
        fontSize: '0.875rem',
        fontWeight: 500,
      },
    };
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    if (onSelectSlot) {
      onSelectSlot(start, end);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (onSelectEvent) {
      onSelectEvent(event.reservation);
    }
  };

  return (
    <div className="h-[600px] bg-white p-4 rounded-lg border border-gray-200">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        selectable
        defaultView="month"
        views={['month', 'week', 'day', 'agenda']}
        style={{ height: '100%' }}
        popup
      />
    </div>
  );
};
