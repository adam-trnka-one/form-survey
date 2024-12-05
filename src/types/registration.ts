export type QuestionType = 'text' | 'select' | 'multiselect' | 'date' | 'email' | 'phone';
export type FormStatus = 'draft' | 'scheduled' | 'published';
export type GroupLayout = 'vertical' | 'horizontal' | 'grid';
export type BranchingCondition = {
  questionId: string;
  operator: 'equals' | 'contains' | 'not_equals' | 'not_contains';
  value: string | string[];
};

export interface AnswerOption {
  id: string;
  label: string;
  value: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: AnswerOption[];
  validation?: {
    pattern?: string;
    message?: string;
    minLength?: number;
    maxLength?: number;
  };
  group?: string;
  branching?: {
    conditions: BranchingCondition[];
    action: 'show' | 'hide';
  };
}

export interface QuestionGroup {
  id: string;
  title: string;
  description?: string;
  layout: GroupLayout;
  columns?: number;
}

export interface RegistrationForm {
  id: string;
  title: string;
  description?: string;
  status: FormStatus;
  scheduledDate?: string;
  questions: Question[];
  groups: QuestionGroup[];
  theme: {
    primaryColor: string;
    backgroundColor: string;
    logo?: {
      type: 'url' | 'upload';
      src: string;
      width?: number;
      height?: number;
      position: 'left' | 'center' | 'right';
    };
    textColor: string;
    borderRadius: string;
    spacing: string;
    questionSpacing: string;
    buttonStyle: 'solid' | 'outline';
    layout: 'default' | 'compact' | 'spacious';
    alignment: 'left' | 'center';
    customCSS?: string;
  };
}

export interface UserResponse {
  questionId: string;
  value: string | string[];
  timestamp: string;
}