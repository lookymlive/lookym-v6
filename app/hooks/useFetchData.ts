import { useState, useEffect } from 'react';

interface FetchDataParams {
  url: string;
  controller?: AbortController;
}

interface FetchDataResult<T> {
  data: T | null;
  loading: boolean;
  error: ErrorType | null;
}

type ErrorType = {
  message: string;
  type: 'API' | 'MAIL';
}

export const useFetchData = <T>({ url, controller }: FetchDataParams): FetchDataResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorType | null>(null);

  useEffect(() => {
    setLoading(true);

    const fetchData = async () => {
      try {
        const response = await fetch(url, { signal: controller?.signal });

        if (!response.ok) {
          const errorData = {
            message: `Error en la petición: ${response.status}`,
            type: 'API' as 'API'
          }
          throw errorData;
        }

        const jsonData: T = await response.json();
        setData(jsonData);

      } catch (error) {
        if ((error as ErrorType).type) {
          setError(error as ErrorType);
        } else {
          setError({ message: "Error desconocido", type: "API" });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      controller?.abort();
    };
  }, [url]);

  return { data, loading, error };
};
