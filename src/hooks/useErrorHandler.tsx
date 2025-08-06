import { useState, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";

interface ErrorState {
  error: Error | string | null;
  isError: boolean;
}

interface UseErrorHandlerOptions {
  defaultErrorMessage?: string;
  showToast?: boolean;
  logToConsole?: boolean;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const {
    defaultErrorMessage = 'Đã xảy ra lỗi không mong muốn',
    showToast = true,
    logToConsole = true
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false
  });

  const handleError = useCallback((error: Error | string, context?: string) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const fullContext = context ? `${context}: ${errorMessage}` : errorMessage;

    // Log to console if enabled
    if (logToConsole) {
      console.error('[ErrorHandler]', fullContext, error);
    }

    // Set error state
    setErrorState({
      error,
      isError: true
    });

    // Show toast notification if enabled
    if (showToast) {
      toast({
        title: "Đã xảy ra lỗi",
        description: errorMessage || defaultErrorMessage,
        variant: "destructive",
      });
    }
  }, [defaultErrorMessage, showToast, logToConsole]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false
    });
  }, []);

  const retryWithErrorHandling = useCallback(async (
    operation: () => Promise<any>,
    context?: string
  ): Promise<any> => {
    try {
      clearError();
      const result = await operation();
      return result;
    } catch (error) {
      handleError(error as Error, context);
      return null;
    }
  }, [handleError, clearError]);

  return {
    error: errorState.error,
    isError: errorState.isError,
    handleError,
    clearError,
    retryWithErrorHandling
  };
};