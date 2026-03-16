import './styles/toast.css';
import { ToastOptions, ToastState } from './types/index';
import { Toast } from './core/toast';
export { Toast };

export * from './types/index';

const createToast = (options: ToastOptions | string, type: ToastState['type'] = 'normal') => {
  const opts = typeof options === 'string' ? { title: options } : options;
  return new Toast(opts, type);
};

export const toast = Object.assign(
  (options: ToastOptions | string) => createToast(options),
  {
    loading: (options: ToastOptions | string) => createToast(options, 'loading'),
    promise: <T>(
      promise: Promise<T>,
      messages: ToastOptions['promiseMessages'],
      options?: Omit<ToastOptions, 'promise' | 'promiseMessages'>
    ) => {
      return createToast({
        ...options,
        title: typeof messages?.loading === 'string' ? messages.loading : 'Loading...',
        promise,
        promiseMessages: messages,
      }, 'loading');
    }
  }
);
