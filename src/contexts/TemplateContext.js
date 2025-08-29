import React, { createContext, useContext, useReducer } from 'react';

const TemplateContext = createContext();

const initialState = {
  savedTemplates: [],
  soldListings: [],
  currentTemplate: null,
  isLoading: false,
};

function templateReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_SAVED_TEMPLATES':
      return {
        ...state,
        savedTemplates: action.payload,
        isLoading: false,
      };
    case 'ADD_TEMPLATE':
      return {
        ...state,
        savedTemplates: [...state.savedTemplates, action.payload],
      };
    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        savedTemplates: state.savedTemplates.map((template) =>
          template.id === action.payload.id ? { ...template, ...action.payload.data } : template
        ),
      };
    case 'DELETE_TEMPLATE':
      return {
        ...state,
        savedTemplates: state.savedTemplates.filter(template => template.id !== action.payload),
      };
    case 'SET_SOLD_LISTINGS':
      return {
        ...state,
        soldListings: action.payload,
        isLoading: false,
      };
    case 'SET_CURRENT_TEMPLATE':
      return {
        ...state,
        currentTemplate: action.payload,
      };
    default:
      return state;
  }
}

/**
 * TemplateProvider component that manages template-related state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function TemplateProvider({ children }) {
  const [state, dispatch] = useReducer(templateReducer, initialState);

  const value = {
    ...state,
    setLoading: (isLoading) => dispatch({ type: 'SET_LOADING', payload: isLoading }),
    setSavedTemplates: (templates) => dispatch({ type: 'SET_SAVED_TEMPLATES', payload: templates }),
    addTemplate: (template) => dispatch({ type: 'ADD_TEMPLATE', payload: template }),
    updateTemplate: (id, data) => dispatch({ type: 'UPDATE_TEMPLATE', payload: { id, data } }),
    deleteTemplate: (id) => dispatch({ type: 'DELETE_TEMPLATE', payload: id }),
    setSoldListings: (listings) => dispatch({ type: 'SET_SOLD_LISTINGS', payload: listings }),
    setCurrentTemplate: (template) => dispatch({ type: 'SET_CURRENT_TEMPLATE', payload: template }),
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
}

/**
 * Custom hook to use template context
 * @returns {Object} Template context value
 */
export function useTemplates() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplates must be used within a TemplateProvider');
  }
  return context;
}