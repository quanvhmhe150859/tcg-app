import { useEffect, useRef } from "react";

export function useAutoBattle(enabled, deps, callback, delay = 500) {
  const ref = useRef();

  useEffect(() => {
    if (enabled) {
      ref.current = setTimeout(() => {
        callback();
      }, delay);
    } else {
      clearTimeout(ref.current);
    }
    return () => clearTimeout(ref.current);
  }, [enabled, ...deps]);
}
