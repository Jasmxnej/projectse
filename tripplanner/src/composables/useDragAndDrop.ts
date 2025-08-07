import { ref, type Ref } from 'vue';

interface TripActivity {
  id: number;
  image: string;
  name: string;
  time: string;
  cost: number;
}

interface TripDay {
  id: number;
  dayNumber: number;
  name: string | null;
  activities: TripActivity[];
}

export function useDragAndDrop(tripDays: Ref<TripDay[]>) {
  const draggedItem = ref<{ activity: TripActivity, dayId: number, index: number } | null>(null);

  const handleDragStart = (payload: { event: DragEvent, dayId: number, index: number }) => {
    const { event, dayId, index } = payload;
    const day = tripDays.value.find((d: TripDay) => d.id === dayId);
    if (day && event.dataTransfer) {
      draggedItem.value = {
        activity: day.activities[index],
        dayId: dayId,
        index: index,
      };
      event.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (payload: { event: DragEvent, dropDayId: number, dropIndex: number }) => {
    const { event, dropDayId, dropIndex } = payload;
    event.preventDefault();
    if (!draggedItem.value) return;

    const sourceDay = tripDays.value.find((d: TripDay) => d.id === draggedItem.value?.dayId);
    const targetDay = tripDays.value.find((d: TripDay) => d.id === dropDayId);

    if (sourceDay && targetDay) {
      sourceDay.activities.splice(draggedItem.value.index, 1);
      targetDay.activities.splice(dropIndex, 0, draggedItem.value.activity);
    }

    draggedItem.value = null;
  };

  const handleDragEnd = () => {
    draggedItem.value = null;
  };

  return {
    draggedItem,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
}