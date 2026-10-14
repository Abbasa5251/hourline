import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

const floorMin = (t: number) => Math.floor(t / 60_000) * 60_000;

/** Current time floored to the minute; re-renders on each minute boundary while the app is active. */
export function useNow(): number {
  const [now, setNow] = useState(() => floorMin(Date.now()));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(timer);
      setNow(floorMin(Date.now()));
      timer = setTimeout(schedule, 60_000 - (Date.now() % 60_000) + 50);
    };
    schedule();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') schedule();
      else clearTimeout(timer);
    });
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, []);

  return now;
}
