export const DIARY_WRITING_SCENES = ['dormitory', 'library'];

const DIARY_PROBABILITY = 0.4;
const EVENING_START_HOUR = 20;
const EVENING_END_HOUR = 23;

export function shouldTriggerDiary({
  sceneId,
  hour,
  randomValue = Math.random(),
  alreadyWritten = false,
  alreadyWrittenToday = false,
}) {
  if (alreadyWritten || alreadyWrittenToday) return false;
  if (!DIARY_WRITING_SCENES.includes(sceneId)) return false;
  if (hour < EVENING_START_HOUR || hour > EVENING_END_HOUR) return false;

  return randomValue < DIARY_PROBABILITY;
}

export function formatDateKey(dateInput) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function buildRandomDiaryCreatedAt({
  dateKey,
  hourRandomValue = Math.random(),
  minuteRandomValue = Math.random(),
}) {
  const hour = 20 + Math.floor(hourRandomValue * 4);
  const minute = 7 + Math.floor(minuteRandomValue * 52);

  return new Date(`${dateKey}T${`${hour}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')}:00+08:00`);
}

export function getMissingDiaryDates({
  lastOnlineAt,
  now = new Date(),
  existingDates = [],
  maxDays = 7,
}) {
  if (!lastOnlineAt) return [];

  const existing = new Set(existingDates);
  const cursor = new Date(lastOnlineAt);
  cursor.setHours(0, 0, 0, 0);

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const dates = [];

  while (cursor < today) {
    const key = formatDateKey(cursor);
    if (!existing.has(key)) {
      dates.push(key);
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates.slice(-maxDays);
}

export function pickRandomTemplate(templates, randomValue = Math.random()) {
  if (!templates.length) return null;

  const index = Math.floor(randomValue * templates.length) % templates.length;
  return templates[index];
}
