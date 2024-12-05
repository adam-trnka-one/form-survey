import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import RegistrationForm from '../registration/RegistrationForm';
import { useFormStorage } from '../../hooks/useFormStorage';

export default function PreviewForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { formId } = useParams<{ formId: string }>();
  const { forms } = useFormStorage();
  const [previousPath, setPreviousPath] = useState<string>('/');
  const [form, setForm] = useState(formId ? forms.find(f => f.id === formId) : null);

  useEffect(() => {
    // Extract the previous path from the location state or default to '/'
    const prevPath = location.state?.from || '/';
    setPreviousPath(prevPath);
  }, [location.state]);

  useEffect(() => {
    if (formId) {
      const foundForm = forms.find(f => f.id === formId);
      setForm(foundForm);
    }
  }, [formId, forms]);

  const handleSubmit = (responses: Record<string, string | string[]>) => {
    console.log('Form submitted:', responses);
  };

  const handleClose = () => {
    navigate(previousPath);
  };

  if (!form) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Form Not Found</h2>
        <p className="text-gray-600">The form you're looking for doesn't exist or has been deleted.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto relative">
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 p-2 text-gray-500 hover:text-gray-700 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <RegistrationForm form={form} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}