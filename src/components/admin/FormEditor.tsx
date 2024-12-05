import React, { useState } from 'react';
import { PlusCircle, Trash2, GripVertical, Plus, X } from 'lucide-react';
import { Question, QuestionType, QuestionGroup, GroupLayout } from '../../types/registration';
import { DragEvent } from 'react';

interface Props {
  questions: Question[];
  groups: QuestionGroup[];
  onChange: (questions: Question[]) => void;
  onGroupsChange: (groups: QuestionGroup[]) => void;
}

const questionTypes: { value: QuestionType; label: string }[] = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'select', label: 'Single Select' },
  { value: 'multiselect', label: 'Multi Select' },
  { value: 'date', label: 'Date' },
];

const groupLayouts: { value: GroupLayout; label: string }[] = [
  { value: 'vertical', label: 'Vertical' },
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'grid', label: 'Grid' },
];

export default function FormEditor({ questions, groups, onChange, onGroupsChange }: Props) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [isAddingMultiple, setIsAddingMultiple] = useState(false);
  const [multipleQuestions, setMultipleQuestions] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [showBranchingModal, setShowBranchingModal] = useState<string | null>(null);

  const createQuestion = (label: string = 'New Question') => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: 'text' as QuestionType,
      label,
      required: false,
      placeholder: '',
      validation: {
        message: '',
      },
      branching: {
        conditions: [],
        action: 'show'
      },
      group: selectedGroup || undefined,
      options: [],
    };
    return newQuestion;
  };

  const addGroup = () => {
    const newGroup: QuestionGroup = {
      id: crypto.randomUUID(),
      title: 'New Group',
      layout: 'vertical',
      columns: 2,
    };
    onGroupsChange([...groups, newGroup]);
    setIsAddingGroup(false);
  };

  const updateGroup = (groupId: string, updates: Partial<QuestionGroup>) => {
    const updatedGroups = groups.map(group =>
      group.id === groupId ? { ...group, ...updates } : group
    );
    onGroupsChange(updatedGroups);
  };

  const removeGroup = (groupId: string) => {
    // Remove group and unassign questions from this group
    const updatedQuestions = questions.map(q =>
      q.group === groupId ? { ...q, group: undefined } : q
    );
    onChange(updatedQuestions);
    onGroupsChange(groups.filter(g => g.id !== groupId));
  };

  const addQuestion = () => {
    const newQuestion = createQuestion();
    onChange([...questions, newQuestion]);
    setExpandedQuestion(newQuestion.id);
  };

  const addMultipleQuestions = () => {
    const labels = multipleQuestions
      .split('\n')
      .map(label => label.trim())
      .filter(label => label.length > 0);

    if (labels.length === 0) return;

    const newQuestions = labels.map(label => createQuestion(label));
    onChange([...questions, ...newQuestions]);
    setMultipleQuestions('');
    setIsAddingMultiple(false);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      ...updates,
    };
    onChange(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    onChange(updatedQuestions);
    setExpandedQuestion(null);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const updatedQuestions = [...questions];
    const [draggedQuestion] = updatedQuestions.splice(draggedIndex, 1);
    updatedQuestions.splice(index, 0, draggedQuestion);
    
    onChange(updatedQuestions);
    setDraggedIndex(index);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); 
  }; 

  const getQuestionsInGroup = (groupId: string) => {
    return questions.filter(q => q.group === groupId);
  };

  return (
    <div className="space-y-6">
      {/* Groups Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Question Groups</h3>
          {isAddingGroup ? (
            <div className="flex items-center gap-2">
              <button
                onClick={addGroup}
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setIsAddingGroup(false)}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingGroup(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Group
            </button>
          )}
        </div>

        {groups.map(group => (
          <div key={group.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <input
                  type="text"
                  value={group.title}
                  onChange={(e) => updateGroup(group.id, { title: e.target.value })}
                  className="text-lg font-medium bg-transparent border-none p-0 focus:ring-0"
                  placeholder="Group Title"
                />
                <input
                  type="text"
                  value={group.description || ''}
                  onChange={(e) => updateGroup(group.id, { description: e.target.value })}
                  className="text-sm text-gray-600 bg-transparent border-none p-0 focus:ring-0 w-full"
                  placeholder="Group Description (optional)"
                />
              </div>
              <button
                onClick={() => removeGroup(group.id)}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Layout</label>
                <select
                  value={group.layout}
                  onChange={(e) => updateGroup(group.id, { layout: e.target.value as GroupLayout })}
                  className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {groupLayouts.map(layout => (
                    <option key={layout.value} value={layout.value}>
                      {layout.label}
                    </option>
                  ))}
                </select>
              </div>
              {group.layout === 'grid' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Columns</label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={group.columns || 2}
                    onChange={(e) => updateGroup(group.id, { columns: parseInt(e.target.value) })}
                    className="mt-1 block w-24 rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="pt-2">
              <div className="text-sm text-gray-500">
                {getQuestionsInGroup(group.id).length} questions in this group
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Questions Section */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Questions</h3>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="text-sm border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">No Group</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.title}</option>
            ))}
          </select>
        </div>
      </div>

      {questions.map((question, index) => (
        <div
          key={question.id}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={handleDrop}
          className={`p-4 bg-white rounded-lg shadow-sm border transition-all ${
            isDragging && draggedIndex === index
              ? 'opacity-50 border-dashed border-gray-400'
              : isDragging && draggedIndex !== index
              ? 'border-blue-500 transform scale-[1.02]'
              : 'border-gray-200 hover:border-blue-500'
          }`}
        >
          <div className="flex items-start gap-4">
            <button
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              className={`mt-2 text-gray-400 hover:text-gray-600 ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              } touch-none`}
            >
              <GripVertical className="w-5 h-5" />
            </button>

            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-4">
                <input
                  type="text"
                  value={question.label}
                  onChange={(e) =>
                    updateQuestion(index, { label: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Question text"
                />
                <select
                  value={question.group || ''}
                  onChange={(e) => updateQuestion(index, { group: e.target.value || undefined })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No Group</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.title}</option>
                  ))}
                </select>
                <select
                  value={question.type}
                  onChange={(e) =>
                    updateQuestion(index, {
                      type: e.target.value as QuestionType,
                      options:
                        ['select', 'multiselect'].includes(e.target.value) &&
                        !question.options
                          ? []
                          : question.options,
                    })
                  }
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {questionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) =>
                      updateQuestion(index, { required: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Required</span>
                </label>

                <input
                  type="text"
                  value={question.placeholder || ''}
                  onChange={(e) =>
                    updateQuestion(index, { placeholder: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Placeholder text (optional)"
                />

                <button
                  onClick={() => setExpandedQuestion(
                    expandedQuestion === question.id ? null : question.id
                  )}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    expandedQuestion === question.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Advanced
                </button>

                <button
                  onClick={() => setShowBranchingModal(question.id)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    question.branching?.conditions.length ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Branching
                </button>

                <button
                  onClick={() => removeQuestion(index)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {['select', 'multiselect'].includes(question.type) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Options
                  </label>
                  {question.options?.map((option, optionIndex) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) => {
                          const newOptions = [...(question.options || [])];
                          newOptions[optionIndex] = {
                            ...option,
                            label: e.target.value,
                            value: e.target.value.toLowerCase(),
                          };
                          updateQuestion(index, { options: newOptions });
                        }}
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Option text"
                      />
                      <button
                        onClick={() => {
                          const newOptions = question.options?.filter(
                            (_, i) => i !== optionIndex
                          );
                          updateQuestion(index, { options: newOptions });
                        }}
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newOption = {
                        id: crypto.randomUUID(),
                        label: '',
                        value: '',
                      };
                      updateQuestion(index, {
                        options: [...(question.options || []), newOption],
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Option
                  </button>
                </div>
              )}

              {showBranchingModal === question.id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="w-full max-w-2xl p-6 bg-white rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Branching Logic</h3>
                      <button
                        onClick={() => setShowBranchingModal(null)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">When conditions are met:</span>
                        <select
                          value={question.branching?.action || 'show'}
                          onChange={(e) => updateQuestion(index, {
                            branching: {
                              ...question.branching,
                              action: e.target.value as 'show' | 'hide'
                            }
                          })}
                          className="px-3 py-1.5 text-sm border rounded-lg"
                        >
                          <option value="show">Show this question</option>
                          <option value="hide">Hide this question</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        {question.branching?.conditions.map((condition, conditionIndex) => (
                          <div key={conditionIndex} className="flex items-center gap-3">
                            <select
                              value={condition.questionId}
                              onChange={(e) => {
                                const newConditions = [...(question.branching?.conditions || [])];
                                newConditions[conditionIndex] = {
                                  ...condition,
                                  questionId: e.target.value
                                };
                                updateQuestion(index, {
                                  branching: {
                                    ...question.branching,
                                    conditions: newConditions
                                  }
                                });
                              }}
                              className="flex-1 px-3 py-2 border rounded-lg"
                            >
                              <option value="">Select a question</option>
                              {questions
                                .filter(q => q.id !== question.id)
                                .map(q => (
                                  <option key={q.id} value={q.id}>{q.label}</option>
                                ))
                              }
                            </select>

                            <select
                              value={condition.operator}
                              onChange={(e) => {
                                const newConditions = [...(question.branching?.conditions || [])];
                                newConditions[conditionIndex] = {
                                  ...condition,
                                  operator: e.target.value as any
                                };
                                updateQuestion(index, {
                                  branching: {
                                    ...question.branching,
                                    conditions: newConditions
                                  }
                                });
                              }}
                              className="px-3 py-2 border rounded-lg"
                            >
                              <option value="equals">Equals</option>
                              <option value="not_equals">Does not equal</option>
                              <option value="contains">Contains</option>
                              <option value="not_contains">Does not contain</option>
                            </select>

                            <input
                              type="text"
                              value={Array.isArray(condition.value) ? condition.value.join(', ') : condition.value}
                              onChange={(e) => {
                                const newConditions = [...(question.branching?.conditions || [])];
                                newConditions[conditionIndex] = {
                                  ...condition,
                                  value: e.target.value
                                };
                                updateQuestion(index, {
                                  branching: {
                                    ...question.branching,
                                    conditions: newConditions
                                  }
                                });
                              }}
                              className="flex-1 px-3 py-2 border rounded-lg"
                              placeholder="Value"
                            />

                            <button
                              onClick={() => {
                                const newConditions = question.branching?.conditions.filter((_, i) => i !== conditionIndex);
                                updateQuestion(index, {
                                  branching: {
                                    ...question.branching,
                                    conditions: newConditions
                                  }
                                });
                              }}
                              className="p-2 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        <button
                          onClick={() => {
                            const newCondition = {
                              questionId: '',
                              operator: 'equals' as const,
                              value: ''
                            };
                            updateQuestion(index, {
                              branching: {
                                ...question.branching,
                                conditions: [...(question.branching?.conditions || []), newCondition]
                              }
                            });
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Plus className="w-4 h-4" />
                          Add Condition
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {expandedQuestion === question.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                  <h4 className="font-medium text-gray-700">Validation Settings</h4>
                  
                  <div className="space-y-4">
                    {question.type === 'text' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Length
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={question.validation?.minLength || ''}
                          onChange={(e) =>
                            updateQuestion(index, {
                              validation: {
                                ...question.validation,
                                minLength: parseInt(e.target.value) || undefined,
                              },
                            })
                          }
                          className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}

                    {['email', 'phone', 'text'].includes(question.type) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pattern (RegEx)
                        </label>
                        <input
                          type="text"
                          value={question.validation?.pattern || ''}
                          onChange={(e) =>
                            updateQuestion(index, {
                              validation: {
                                ...question.validation,
                                pattern: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g. [A-Za-z]+"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Error Message
                      </label>
                      <input
                        type="text"
                        value={question.validation?.message || ''}
                        onChange={(e) =>
                          updateQuestion(index, {
                            validation: {
                              ...question.validation,
                              message: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Custom error message"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {isAddingMultiple ? (
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Add Multiple Questions</h3>
            <button
              onClick={() => setIsAddingMultiple(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter one question per line
              </label>
              <textarea
                value={multipleQuestions}
                onChange={(e) => setMultipleQuestions(e.target.value)}
                className="w-full h-40 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="What is your name?&#10;What is your email?&#10;What is your phone number?"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsAddingMultiple(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={addMultipleQuestions}
                disabled={!multipleQuestions.trim()}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  multipleQuestions.trim()
                    ? 'text-white bg-blue-600 hover:bg-blue-700'
                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                }`}
              >
                Add Questions
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            onClick={addQuestion}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
            type="button"
          >
            <PlusCircle className="w-5 h-5" />
            Add Question
          </button>
          <button
            onClick={() => setIsAddingMultiple(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100"
            type="button"
          >
            <Plus className="w-5 h-5" />
            Add Multiple
          </button>
        </div>
      )}
    </div>
  );
}