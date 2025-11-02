function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
  
    useEffect(() => {
      // Устанавливаем таймер для обновления значения после задержки
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
  
      // Очищаем таймер при изменении value или размонтировании компонента
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]); // Перезапускаем эффект только если value или delay изменились
  
    return debouncedValue;
  }
  
  export default useDebounce;