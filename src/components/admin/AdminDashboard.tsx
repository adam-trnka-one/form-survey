import React, { useState } from 'react';
import { Plus, Eye, Edit, Clock, CheckCircle2, FileEdit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FormStatus, RegistrationForm } from '../../types/registration';
import CreateFormModal from './CreateFormModal';
import { useFormStorage } from '../../hooks/useFormStorage';

const getStatusColor = (status: FormStatus) => {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: FormStatus) => {
  switch (status) {
    case 'published':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'scheduled':
      return <Clock className="w-4 h-4" />;
    default:
      return <FileEdit className="w-4 h-4" />;
  }
};

export default function AdminDashboard() {
  const { forms, addForm, deleteForm } = useFormStorage();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);

  const handleCreateForm = (newForm: RegistrationForm) => {
    addForm(newForm);
    setIsCreateModalOpen(false);
  };

  const handleDeleteForm = () => {
    if (formToDelete) {
      deleteForm(formToDelete);
      setFormToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registration Forms</h1>
          <p className="text-gray-600">Manage your registration forms and collect responses</p>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Form
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {forms.map(form => (
          <div key={form.id} className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">{form.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{form.description}</p>
            
            <div className="flex items-center gap-2 mt-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(form.status)}`}>
                {getStatusIcon(form.status)}
                {form.status ? form.status.charAt(0).toUpperCase() + form.status.slice(1) : 'Draft'}
                {form.status === 'scheduled' && form.scheduledDate && (
                  <span className="ml-1">
                    ({new Date(form.scheduledDate).toLocaleDateString()})
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {form.questions.length} {form.questions.length === 1 ? 'Step' : 'Steps'}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {form.questions.filter(q => q.required).length} Required
              </div>
            </div>
            
            <div className="flex items-center justify-end mt-4">
              <div className="flex items-center gap-2">
                <Link
                  to={`/edit/${form.id}`}
                  className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Link>
                <Link
                  to={`/preview/${form.id}`}
                  state={{ from: '/' }}
                  className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Link>
                <button
                  onClick={() => setFormToDelete(form.id)}
                  className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isCreateModalOpen && (
        <CreateFormModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateForm}
        />
      )}
      
      {formToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Delete Form</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this form? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setFormToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteForm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}