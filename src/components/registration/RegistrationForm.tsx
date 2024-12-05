import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Question, RegistrationForm as RegistrationFormType } from '../../types/registration';
import QuestionStep from './QuestionStep';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';

interface Props {
  form: RegistrationFormType;
  onSubmit: (responses: Record<string, string | string[]>) => void;
}

export default function RegistrationForm({ form, onSubmit }: Props) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});

  const evaluateCondition = (condition: BranchingCondition) => {
    const response = responses[condition.questionId];
    if (!response) return false;

    const responseStr = Array.isArray(response) ? response.join(',') : response;
    const conditionValue = Array.isArray(condition.value) ? condition.value.join(',') : condition.value;

    switch (condition.operator) {
      case 'equals':
        return responseStr === conditionValue;
      case 'not_equals':
        return responseStr !== conditionValue;
      case 'contains':
        return responseStr.toLowerCase().includes(conditionValue.toLowerCase());
      case 'not_contains':
        return !responseStr.toLowerCase().includes(conditionValue.toLowerCase());
      default:
        return true;
    }
  };

  const shouldShowQuestion = (question: Question) => {
    if (!question.branching || !question.branching.conditions.length) {
      return true;
    }

    const allConditionsMet = question.branching.conditions.every(evaluateCondition);
    return question.branching.action === 'show' ? allConditionsMet : !allConditionsMet;
  };

  const getNextVisibleStep = (currentStep: number, direction: 'forward' | 'backward' = 'forward') => {
    const maxStep = form.questions.length - 1;
    let nextStep = currentStep;

    while (direction === 'forward' ? nextStep < maxStep : nextStep > 0) {
      nextStep = direction === 'forward' ? nextStep + 1 : nextStep - 1;
      const question = form.questions[nextStep];
      if (shouldShowQuestion(question)) {
        return nextStep;
      }
    }
    return direction === 'forward' ? maxStep : 0;
  };

  const getCurrentQuestions = () => {
    if (!form.questions.length) return [];
    
    const currentQuestion = form.questions[currentStep];
    if (!shouldShowQuestion(currentQuestion)) {
      const nextStep = getNextVisibleStep(currentStep);
      setCurrentStep(nextStep);
      return [form.questions[nextStep]];
    }

    if (!currentQuestion.group) {
      return [currentQuestion];
    }

    return form.questions
      .filter(q => q.group === currentQuestion.group)
      .filter(shouldShowQuestion);
  };

  const getCurrentGroup = () => {
    const currentQuestion = form.questions[currentStep];
    if (!currentQuestion?.group) return undefined;
    return form.groups.find(g => g.id === currentQuestion.group);
  };

  const defaultCSS = useMemo(() => `
    .form-container {
      background-color: ${form.theme.backgroundColor};
      color: ${form.theme.textColor};
      border-radius: ${form.theme.borderRadius};
      padding: ${form.theme.spacing};
    }
    
    .form-title {
      color: ${form.theme.textColor};
      text-align: ${form.theme.alignment};
      margin-bottom: 1rem;
    }
    
    .form-description {
      color: ${form.theme.textColor};
      opacity: 0.7;
      text-align: ${form.theme.alignment};
    }
    
    .question-container {
      margin-bottom: ${form.theme.questionSpacing};
    }
    
    .question-label {
      color: ${form.theme.textColor};
      text-align: ${form.theme.alignment};
      margin-bottom: 0.5rem;
    }
    
    .form-input {
      background-color: ${form.theme.backgroundColor};
      color: ${form.theme.textColor};
      border-color: ${form.theme.primaryColor};
      border-radius: ${form.theme.borderRadius};
      padding: ${form.theme.spacing};
      width: 100%;
    }
    
    .form-select {
      background-color: ${form.theme.backgroundColor};
      color: ${form.theme.textColor};
      border-color: ${form.theme.primaryColor};
      border-radius: ${form.theme.borderRadius};
      padding: ${form.theme.spacing};
    }
    
    .form-button {
      ${form.theme.buttonStyle === 'outline' 
        ? `border: 2px solid ${form.theme.primaryColor};
           color: ${form.theme.primaryColor};
           background: transparent;`
        : `background-color: ${form.theme.primaryColor};
           color: white;`}
      border-radius: ${form.theme.borderRadius};
      padding: 0.5rem 1rem;
      transition: opacity 0.2s;
    }
  `, [form.theme]);

  // Apply custom CSS
  useEffect(() => {
    const existingStyle = document.getElementById('form-custom-css');
    existingStyle?.remove();

    const style = document.createElement('style');
    style.id = 'form-custom-css';
    style.textContent = form.theme.customCSS || defaultCSS;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      document.getElementById('form-custom-css')?.remove();
    };
  }, [form.theme.customCSS, defaultCSS]);

  const handleResponse = (questionId: string, value: string | string[]) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    const nextStep = getNextVisibleStep(currentStep);
    if (nextStep !== currentStep) {
      setCurrentStep(nextStep);
    } else {
      onSubmit(responses);
    }
  };

  const handleBack = () => {
    const prevStep = getNextVisibleStep(currentStep, 'backward');
    setCurrentStep(prevStep);
  };

  const currentQuestions = getCurrentQuestions();
  const currentGroup = getCurrentGroup();
  const isLastStep = currentStep === form.questions.length - 1;
  const canProceed = currentQuestions && currentQuestions.every(q => 
    !q.required || responses[q.id]
  );

  const getThemeStyles = () => {
    const { theme } = form;
    const styles: React.CSSProperties = {
      '--primary-color': theme.primaryColor,
      '--background-color': theme.backgroundColor,
      '--text-color': theme.textColor,
      '--border-radius': theme.borderRadius,
      '--spacing': theme.spacing,
      '--question-spacing': theme.questionSpacing,
      backgroundColor: theme.backgroundColor,
      color: theme.textColor,
      borderRadius: theme.borderRadius,
      padding: theme.spacing,
    } as any;

    return styles;
  };

  const getButtonStyles = () => {
    const { theme } = form;
    if (theme.buttonStyle === 'outline') {
      return 'border-2 border-current bg-transparent';
    }
    return 'bg-[var(--primary-color)]';
  };

  return (
    <div 
      className={`form-container max-w-2xl mx-auto shadow-lg ${
        form.theme.layout === 'compact' ? 'max-w-xl' : 
        form.theme.layout === 'spacious' ? 'max-w-3xl' : 'max-w-2xl'
      } ${
        form.theme.alignment === 'center' ? 'text-center' : 'text-left'
      }`}
      style={getThemeStyles()}
    >
      <div className="mb-8">
        {form.theme.logo && (
          <div className={`mb-6 flex ${
            form.theme.logo.position === 'center' ? 'justify-center' :
            form.theme.logo.position === 'right' ? 'justify-end' : 'justify-start'
          }`}>
            <img
              src={form.theme.logo.src}
              alt="Form logo"
              style={{
                width: form.theme.logo.width || 200,
                height: form.theme.logo.height || 60,
                objectFit: 'contain'
              }}
            />
          </div>
        )}
        <h1 className="form-title text-3xl font-bold mb-2" style={{ color: form.theme.textColor }}>
          {form.title}
        </h1>
        {form.description && (
          <p className="form-description" style={{ opacity: 0.7 }}>{form.description}</p>
        )}
      </div>

      <div className="mb-4">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ backgroundColor: form.theme.primaryColor }}
            style={{
              width: `${((currentStep + 1) / form.questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <QuestionStep 
        questions={currentQuestions}
        group={currentGroup}
        values={responses}
        theme={form.theme}
        onChange={handleResponse}
      />

      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`form-button flex items-center px-4 py-2 rounded-lg
            ${currentStep === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
            }`}
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`form-button flex items-center px-6 py-2 rounded-lg transition-colors
            ${canProceed
              ? `${getButtonStyles()} text-white hover:opacity-90`
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {isLastStep ? 'Submit' : 'Next'}
          {!isLastStep && <ChevronRight className="w-5 h-5 ml-2" />}
        </button>
      </div>
    </div>
  );
}