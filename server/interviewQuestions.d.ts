import type { InterviewData, InterviewQuestion } from '../src/types/interview';

export declare function getInterviewData(): InterviewData;
export declare function getInterviewQuestions(): InterviewQuestion[];
export declare function getInterviewQuestionById(id: number | string): InterviewQuestion | undefined;
