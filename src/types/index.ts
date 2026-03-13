export type ToastVariant = 'solid' | 'bordered' | 'flat';
export type ToastColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
export type ToastPlacement = 
  | 'top-left' | 'top-center' | 'top-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  color?: ToastColor;
  placement?: ToastPlacement;
  duration?: number; // ms
  progressBar?: boolean;
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  icon?: string | HTMLElement | boolean; // false to hide
  endContent?: string | HTMLElement | ((container: HTMLElement) => void) | any;
  id?: string;
  darkMode?: boolean;
  customStyle?: Partial<CSSStyleDeclaration>;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  promise?: Promise<any>;
  promiseMessages?: {
    loading: string | HTMLElement;
    success: string | HTMLElement | ((data: any) => string | HTMLElement);
    error: string | HTMLElement | ((err: any) => string | HTMLElement);
  };
}

export type ToastType = 'normal' | 'loading' | 'success' | 'error' | 'warning' | 'info';

export interface ToastState extends ToastOptions {
  type: ToastType;
  createdAt: number;
  element?: HTMLElement;
}
