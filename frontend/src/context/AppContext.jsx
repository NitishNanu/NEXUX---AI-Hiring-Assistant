import { createContext, useContext, useMemo, useReducer } from 'react';

const initialState = {
  resumeData: {
    file: null,
    rawText: null,
    parsed: null,
    ats: null,
    uploadedAt: null,
  },
  messages: [],
  isLoadingChat: false,
  isLoadingResume: false,
  jdResult: null,
};

const AppContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'SET_RESUME_DATA':
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          ...action.payload,
          uploadedAt: action.payload.uploadedAt || new Date(),
        },
      };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'SET_LOADING_CHAT':
      return { ...state, isLoadingChat: action.payload };
    case 'SET_LOADING_RESUME':
      return { ...state, isLoadingResume: action.payload };
    case 'SET_JD_RESULT':
      return { ...state, jdResult: action.payload };
    case 'RESET_RESUME':
      return { ...state, resumeData: initialState.resumeData, jdResult: null };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider');
  }
  return context;
}
