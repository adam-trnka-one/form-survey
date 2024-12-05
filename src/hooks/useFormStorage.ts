import { useState, useEffect } from 'react';
import { RegistrationForm } from '../types/registration';

const STORAGE_KEY = 'registration_forms';

const DEFAULT_FORMS: RegistrationForm[] = [
  {
    id: 'default-user-registration',
    title: 'User Registration',
    description: 'Collect essential information from new users',
    status: 'published',
    groups: [],
    questions: [
      {
        id: 'fullname',
        type: 'text',
        label: 'Full Name',
        required: true,
        placeholder: 'Enter your full name',
        validation: {
          pattern: '^[a-zA-Z\\s]{2,}$',
          message: 'Please enter your full name (minimum 2 characters)',
        },
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        required: true,
        placeholder: 'you@example.com',
        validation: {
          pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$',
          message: 'Please enter a valid email address',
        },
      },
      {
        id: 'phone',
        type: 'phone',
        label: 'Phone Number',
        required: false,
        placeholder: '+1 (555) 000-0000',
        validation: {
          pattern: '^\\+?[1-9]\\d{1,14}$',
          message: 'Please enter a valid phone number',
        },
      },
      {
        id: 'role',
        type: 'select',
        label: 'Role',
        required: true,
        placeholder: 'Select your role',
        options: [
          { id: 'developer', label: 'Developer', value: 'developer' },
          { id: 'designer', label: 'Designer', value: 'designer' },
          { id: 'manager', label: 'Project Manager', value: 'manager' },
          { id: 'other', label: 'Other', value: 'other' },
        ],
      },
      {
        id: 'skills',
        type: 'multiselect',
        label: 'Skills',
        required: true,
        options: [
          { id: 'js', label: 'JavaScript', value: 'javascript' },
          { id: 'react', label: 'React', value: 'react' },
          { id: 'node', label: 'Node.js', value: 'nodejs' },
          { id: 'ts', label: 'TypeScript', value: 'typescript' },
          { id: 'ui', label: 'UI Design', value: 'ui' },
          { id: 'ux', label: 'UX Design', value: 'ux' },
        ],
        validation: {
          message: 'Please select at least one skill',
        },
      },
      {
        id: 'start_date',
        type: 'date',
        label: 'Available Start Date',
        required: true,
        validation: {
          message: 'Please select your available start date',
        },
      },
    ],
  },
];

export function useFormStorage() {
  const [forms, setForms] = useState<RegistrationForm[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_FORMS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
  }, [forms]);

  const addForm = (form: Omit<RegistrationForm, 'id'>) => {
    const newForm = {
      ...form,
      id: crypto.randomUUID(),
      status: form.status || 'draft',
      questions: form.questions || [],
      groups: form.groups || [],
      theme: {
        primaryColor: '#3B82F6',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        borderRadius: '0.5rem',
        spacing: '1.5rem',
        questionSpacing: '2rem',
        buttonStyle: 'solid',
        layout: 'default',
        alignment: 'left',
        customCSS: '',
        ...(form.theme || {})
      }
    };
    setForms(prev => [...prev, newForm]);
    return newForm;
  };

  const updateForm = (id: string, updates: Partial<RegistrationForm>) => {
    setForms(prev => prev.map(form => {
      if (form.id === id) {
        return {
          ...form,
          ...updates,
          theme: {
            // Ensure default theme values are always present
            primaryColor: '#3B82F6',
            backgroundColor: '#FFFFFF',
            textColor: '#1F2937',
            borderRadius: '0.5rem',
            spacing: '1.5rem',
            questionSpacing: '2rem',
            buttonStyle: 'solid',
            layout: 'default',
            alignment: 'left',
            customCSS: '',
            ...(form.theme || {}),
            ...(updates.theme || {})
          }
        };
      }
      return form;
    }));
  };

  return {
    forms,
    addForm,
    updateForm,
    deleteForm: (id: string) => {
      setForms(prev => prev.filter(form => form.id !== id));
    }
  };
}