import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Eye, Calendar, ArrowLeft } from 'lucide-react';
import { RegistrationForm, FormStatus, Question } from '../../types/registration';
import FormEditor from './FormEditor';
import { useFormStorage } from '../../hooks/useFormStorage';

export default function EditForm() {
  const navigate = useNavigate();
  const { formId } = useParams<{ formId: string }>();
  const { forms, updateForm } = useFormStorage();
  const [formData, setFormData] = useState<RegistrationForm | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'appearance' | 'css'>('content');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleGroupsChange = (groups: QuestionGroup[]) => {
    if (!formData) return;
    setFormData({
      ...formData,
      groups: groups
    });
    setIsDirty(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData || !e.target.files?.length) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const logo = {
        type: 'upload' as const,
        src: reader.result as string,
        position: formData.theme.logo?.position || 'center',
        width: formData.theme.logo?.width || 200,
        height: formData.theme.logo?.height || 60
      };
      
      handleThemeChange({ logo });
      setLogoFile(file);
    };
    
    reader.readAsDataURL(file);
  };

  const handleLogoUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    
    const logo = {
      type: 'url' as const,
      src: e.target.value,
      position: formData.theme.logo?.position || 'center',
      width: formData.theme.logo?.width || 200,
      height: formData.theme.logo?.height || 60
    };
    
    handleThemeChange({ logo });
  };

  const generateCurrentCSS = (theme: RegistrationForm['theme']) => {
    return `.form-container {
  background-color: ${theme.backgroundColor};
  color: ${theme.textColor};
  border-radius: ${theme.borderRadius};
  padding: ${theme.spacing};
}

.form-title {
  color: ${theme.textColor};
  text-align: ${theme.alignment};
  margin-bottom: 1rem;
}

.form-description {
  color: ${theme.textColor};
  opacity: 0.7;
  text-align: ${theme.alignment};
}

.question-container {
  margin-bottom: ${theme.questionSpacing};
}

.question-label {
  color: ${theme.textColor};
  text-align: ${theme.alignment};
  margin-bottom: 0.5rem;
}

.form-input {
  background-color: ${theme.backgroundColor};
  color: ${theme.textColor};
  border-color: ${theme.primaryColor};
  border-radius: ${theme.borderRadius};
  padding: ${theme.spacing};
  width: 100%;
}

.form-select {
  background-color: ${theme.backgroundColor};
  color: ${theme.textColor};
  border-color: ${theme.primaryColor};
  border-radius: ${theme.borderRadius};
  padding: ${theme.spacing};
}

.form-button {
  ${theme.buttonStyle === 'outline' 
    ? `border: 2px solid ${theme.primaryColor};
  color: ${theme.primaryColor};
  background: transparent;`
    : `background-color: ${theme.primaryColor};
  color: white;`}
  border-radius: ${theme.borderRadius};
  padding: 0.5rem 1rem;
  transition: opacity 0.2s;
}`;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const newFormData = { ...formData, title: e.target.value };
    setFormData(newFormData);
    setIsDirty(true);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!formData) return;
    const newFormData = { ...formData, description: e.target.value };
    setFormData(newFormData);
    setIsDirty(true);
  };

  const handleStatusChange = (status: FormStatus) => {
    if (!formData) return;
    const updates: Partial<RegistrationForm> = { status };
    
    if (status === 'scheduled' && !formData.scheduledDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      updates.scheduledDate = tomorrow.toISOString().split('T')[0];
    }
    const newFormData = { ...formData, ...updates };
    setFormData(newFormData);
    setIsDirty(true);
  };

  const handleScheduledDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    setFormData({ ...formData, scheduledDate: e.target.value });
    setIsDirty(true);
  };

  const handleThemeChange = (updates: Partial<RegistrationForm['theme']>) => {
    if (!formData) return;
    setFormData({
      ...formData,
      theme: { ...formData.theme, ...updates }
    });
    setIsDirty(true);
  };

  useEffect(() => {
    if (formId) {
      const form = forms.find(f => f.id === formId);
      if (!form) {
        navigate('/');
        return;
      }
      setFormData({
        ...form,
        questions: Array.isArray(form.questions) ? form.questions : [],
        groups: Array.isArray(form.groups) ? form.groups : [],
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
          ...form.theme
        }
      });
      setIsDirty(false);
    }
  }, [formId, forms, navigate]);

  if (!formData) {
    return <div>Loading...</div>;
  }

  const handleSave = () => {
    if (!formData) return;
    
    updateForm(formData.id, formData);
    setIsDirty(false);
  };

  const handleFormChange = (questions: Question[]) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      questions: questions || []
    });
    setIsDirty(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Form</h1>
              <p className="text-gray-600">
                Customize your registration form by adding and configuring questions
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/preview/${formData.id}`, { state: { from: `/edit/${formData.id}` } })}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
              isDirty
                ? 'text-white bg-blue-600 hover:bg-blue-700'
                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
            }`}
            disabled={!isDirty}
          >
            <Save className="w-4 h-4 mr-2" />
            {isDirty ? 'Save Changes' : 'No Changes'}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        <aside className="w-48 space-y-2">
          <button
            onClick={() => setActiveTab('content')}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg ${
              activeTab === 'content'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg ${
              activeTab === 'appearance'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('css')}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg ${
              activeTab === 'css'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Custom CSS
          </button>
        </aside>

        <div className="flex-1 space-y-6">
          {activeTab === 'content' && (
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Form Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <div className="flex items-center gap-4">
                    <select
                      value={formData.status}
                      onChange={(e) => handleStatusChange(e.target.value as FormStatus)}
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="published">Published</option>
                    </select>
                    
                    {formData.status === 'scheduled' && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <input
                          type="date"
                          value={formData.scheduledDate || ''}
                          onChange={handleScheduledDateChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={handleDescriptionChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Questions</h2>
                <FormEditor
                  questions={formData.questions}
                  groups={formData.groups}
                  onChange={handleFormChange}
                  onGroupsChange={handleGroupsChange}
                />
              </div>
            </div>
          )}
          {activeTab === 'appearance' && (
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Form Appearance</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Primary Color
                    </label>
                    <input
                      type="color"
                      value={formData.theme.primaryColor}
                      onChange={(e) => handleThemeChange({ primaryColor: e.target.value })}
                      className="w-full h-10 p-1 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={formData.theme.backgroundColor}
                      onChange={(e) => handleThemeChange({ backgroundColor: e.target.value })}
                      className="w-full h-10 p-1 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={formData.theme.textColor}
                      onChange={(e) => handleThemeChange({ textColor: e.target.value })}
                      className="w-full h-10 p-1 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Border Radius
                    </label>
                    <select
                      value={formData.theme.borderRadius}
                      onChange={(e) => handleThemeChange({ borderRadius: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="0">None</option>
                      <option value="0.25rem">Small</option>
                      <option value="0.5rem">Medium</option>
                      <option value="1rem">Large</option>
                      <option value="9999px">Full</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Logo</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Logo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Or Use Logo URL
                      </label>
                      <input
                        type="url"
                        value={formData.theme.logo?.type === 'url' ? formData.theme.logo.src : ''}
                        onChange={handleLogoUrl}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    {formData.theme.logo && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Width (px)
                            </label>
                            <input
                              type="number"
                              value={formData.theme.logo.width || 200}
                              onChange={(e) => handleThemeChange({
                                logo: {
                                  ...formData.theme.logo,
                                  width: parseInt(e.target.value)
                                }
                              })}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Height (px)
                            </label>
                            <input
                              type="number"
                              value={formData.theme.logo.height || 60}
                              onChange={(e) => handleThemeChange({
                                logo: {
                                  ...formData.theme.logo,
                                  height: parseInt(e.target.value)
                                }
                              })}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Position
                          </label>
                          <select
                            value={formData.theme.logo.position}
                            onChange={(e) => handleThemeChange({
                              logo: {
                                ...formData.theme.logo,
                                position: e.target.value as 'left' | 'center' | 'right'
                              }
                            })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preview
                          </label>
                          <div className={`flex ${
                            formData.theme.logo.position === 'center' ? 'justify-center' :
                            formData.theme.logo.position === 'right' ? 'justify-end' : 'justify-start'
                          }`}>
                            <img
                              src={formData.theme.logo.src}
                              alt="Logo preview"
                              style={{
                                width: formData.theme.logo.width || 200,
                                height: formData.theme.logo.height || 60,
                                objectFit: 'contain'
                              }}
                              className="border rounded p-2"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Layout Style
                  </label>
                  <select
                    value={formData.theme.layout}
                    onChange={(e) => handleThemeChange({ layout: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="default">Default</option>
                    <option value="compact">Compact</option>
                    <option value="spacious">Spacious</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Content Alignment
                  </label>
                  <select
                    value={formData.theme.alignment}
                    onChange={(e) => handleThemeChange({ alignment: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Button Style
                  </label>
                  <select
                    value={formData.theme.buttonStyle}
                    onChange={(e) => handleThemeChange({ buttonStyle: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="solid">Solid</option>
                    <option value="outline">Outline</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'css' && (
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Custom CSS</h2>
                  <div className="text-sm text-gray-500">
                    Customize your form with CSS
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    CSS Code
                  </label>
                  <textarea
                    value={formData.theme.customCSS || ''}
                    onChange={(e) => handleThemeChange({ customCSS: e.target.value || generateCurrentCSS(formData.theme) })}
                    className="w-full h-96 px-3 py-2 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    style={{ resize: 'vertical' }}
                    spellCheck="false"
                    placeholder={generateCurrentCSS(formData.theme)}
                  />
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Current Theme Variables</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <code className="px-1.5 py-0.5 bg-gray-100 rounded">Primary Color:</code>
                      <span className="flex items-center gap-1">
                        {formData.theme.primaryColor}
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: formData.theme.primaryColor }} />
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <code className="px-1.5 py-0.5 bg-gray-100 rounded">Background Color:</code>
                      <span className="flex items-center gap-1">
                        {formData.theme.backgroundColor}
                        <div className="w-4 h-4 rounded border border-gray-200" style={{ backgroundColor: formData.theme.backgroundColor }} />
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <code className="px-1.5 py-0.5 bg-gray-100 rounded">Text Color:</code>
                      <span className="flex items-center gap-1">
                        {formData.theme.textColor}
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: formData.theme.textColor }} />
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <code className="px-1.5 py-0.5 bg-gray-100 rounded">Border Radius:</code>
                      <span>{formData.theme.borderRadius}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <code className="px-1.5 py-0.5 bg-gray-100 rounded">Spacing:</code>
                      <span>{formData.theme.spacing}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <code className="px-1.5 py-0.5 bg-gray-100 rounded">Question Spacing:</code>
                      <span>{formData.theme.questionSpacing}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <code className="px-1.5 py-0.5 bg-gray-100 rounded">Button Style:</code>
                      <span>{formData.theme.buttonStyle}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <code className="px-1.5 py-0.5 bg-gray-100 rounded">Layout:</code>
                      <span>{formData.theme.layout}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <code className="px-1.5 py-0.5 bg-gray-100 rounded">Alignment:</code>
                      <span>{formData.theme.alignment}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}