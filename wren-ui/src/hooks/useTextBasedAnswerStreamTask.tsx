import { useRef, useState } from 'react';

type TextBasedAnswerStreamTaskReturn = [
  (responseId: number) => void,
  {
    data: string;
    loading: boolean;
    error: boolean;
    onReset: () => void;
  },
];

export default function useTextBasedAnswerStreamTask() {
  const eventSourceRef = useRef<EventSource | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [data, setData] = useState<string>('');

  const onReset = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    }
    setData('');
    setError(false);
    setLoading(false);
  };

  const fetchAnswerStreamingTask = (responseId: number) => {
    if (eventSourceRef.current || error) {
      return;
    }
    setLoading(true);
    setError(false);

    const eventSource = new EventSource(
      `/api/ask_task/streaming_answer?responseId=${responseId}`,
    );

    eventSource.onmessage = (event) => {
      const eventData = JSON.parse(event.data);
      if (eventData.done) {
        eventSource.close();
        eventSourceRef.current = null;
        setLoading(false);
      } else {
        setData((state) => state + (eventData?.message || ''));
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE streaming error:', err);
      eventSource.close();
      eventSourceRef.current = null;
      setLoading(false);
      setError(true);
    };

    eventSourceRef.current = eventSource;
  };

  return [
    fetchAnswerStreamingTask,
    { data, loading, error, onReset },
  ] as TextBasedAnswerStreamTaskReturn;
}
