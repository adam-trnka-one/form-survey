import React, { useMemo } from 'react';
import { Question, QuestionGroup, RegistrationForm } from '../../types/registration';
import { Check } from 'lucide-react';

interface Props {
  questions: Question[];
  group?: QuestionGroup;
  values: Record<string, string | string[]>;
  onChange: (questionId: string, value: string | string[]) => void;
  theme: RegistrationForm['theme'];
}

export default function QuestionStep({ questions, group, values, onChange, theme }: Props) {
  const handleChange = (questionId: string, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange(questionId, e.target.value);
  };

  const styles = useMemo(() => ({
    container: {
      marginBottom: theme.questionSpacing,
    },
    label: {
      color: theme.textColor,
      textAlign: theme.alignment as any,
      marginBottom: '0.5rem',
    },
    input: {
      backgroundColor: theme.backgroundColor,
      color: theme.textColor,
      borderColor: theme.primaryColor,
      borderRadius: theme.borderRadius,
      padding: theme.spacing,
      width: '100%',
    },
    option: {
      backgroundColor: theme.backgroundColor,
      color: theme.textColor,
      borderRadius: theme.borderRadius,
      padding: theme.spacing,
      marginBottom: '0.5rem',
      border: `1px solid ${theme.primaryColor}`,
    },
    selectedOption: {
      backgroundColor: `${theme.primaryColor}20`,
      borderColor: theme.primaryColor,
    },
    checkbox: {
      color: theme.primaryColor,
    },
    error: {
      color: '#EF4444',
      fontSize: '0.875rem',
      marginTop: '0.5rem',
      textAlign: theme.alignment as any,
    }
  }), [theme]);

  const handleMultiSelect = (questionId: string, optionValue: string) => {
    const currentValues = (values[questionId] as string[]) || [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter(v => v !== optionValue)
      : [...currentValues, optionValue];
    onChange(questionId, newValues);
  };

  const renderSelectOptions = (question: Question) => {
    if (!question.options?.length) {
      return <p className="text-gray-500 italic">No options available</p>;
    }

    return question.type === 'select' ? (
      <select
        value={values[question.id] as string || ''}
        onChange={(e) => handleChange(question.id, e)}
        style={styles.input}
        className="form-select border focus:ring-2 focus:outline-none"
      >
        <option value="">Select an option</option>
        {question.options.map(option => (
          <option key={option.id} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <div className="space-y-2">
        {question.options.map(option => {
          const isSelected = (values[question.id] as string[] || []).includes(option.value);
          return (
            <label
              key={option.id}
              style={{
                ...styles.option,
                ...(isSelected ? styles.selectedOption : {}),
              }}
              onClick={() => handleMultiSelect(question.id, option.value)}
              className="flex items-center cursor-pointer transition-colors"
            >
              <div className={`w-5 h-5 border rounded mr-3 flex items-center justify-center ${
                isSelected ? `bg-[${theme.primaryColor}] border-[${theme.primaryColor}]` : 'border-gray-300'
              }`}>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <span style={{ color: theme.textColor }}>
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    );
  };

  const renderInput = (question: Question) => {
    switch (question.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <input
            type={question.type === 'phone' ? 'tel' : question.type}
            value={values[question.id] as string || ''}
            onChange={(e) => handleChange(question.id, e)}
            placeholder={question.placeholder}
            className="form-input w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            pattern={question.validation?.pattern}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={values[question.id] as string || ''}
            onChange={(e) => handleChange(question.id, e)}
            className="form-input w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case 'select':
      case 'multiselect':
        return renderSelectOptions(question);

      default:
        return null;
    }
  };

  const getGridColumns = () => {
    if (!group || group.layout !== 'grid') return '';
    return `grid-cols-${group.columns || 2}`;
  };

  return (
    <div className="space-y-6">
      {group && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{group.title}</h3>
          {group.description && (
            <p className="text-gray-600">{group.description}</p>
          )}
        </div>
      )}
      
      <div className={`${
        group?.layout === 'grid' ? `grid gap-6 ${getGridColumns()}` :
        group?.layout === 'horizontal' ? 'flex gap-6' :
        'space-y-6'
      }`}>
        {questions.map(question => (
          <div key={question.id} className="question-container" style={styles.container}>
            <label className="block">
              <span className="question-label text-lg font-medium" style={styles.label}>
                {question.label}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
            {renderInput(question)}
            {question.validation?.message && !values[question.id] && (
              <p style={styles.error}>{question.validation.message}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}