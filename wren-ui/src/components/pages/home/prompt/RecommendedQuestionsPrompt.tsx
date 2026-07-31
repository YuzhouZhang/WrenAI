import { Logo } from '@/components/Logo';

interface Props {
  onSelect?: (payload: { sql: string; question: string }) => void;
  recommendedQuestions?: any[];
  loading?: boolean;
}

export default function RecommendedQuestionsPrompt(_props: Props) {
  return (
    <div className="px-10 py-6 rounded">
      <div className="d-flex flex-column align-center justify-center text-center">
        <Logo size={48} color="var(--gray-8)" className="mb-3" />
        <div className="text-lg text-medium gray-8">
          Know more about your data.
        </div>
      </div>
    </div>
  );
}
