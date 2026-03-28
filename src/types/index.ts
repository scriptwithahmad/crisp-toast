export type ToastVariant = 'solid' | 'bordered' | 'flat';
export type ToastColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
export type ToastPlacement = 
  | 'top-left' | 'top-center' | 'top-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastOptions {
  title?: string | any;
  description?: string | any;
  variant?: ToastVariant;
  color?: ToastColor;
  placement?: ToastPlacement;
  duration?: number; // ms
  progressBar?: boolean;
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  icon?: string | HTMLElement | boolean | any; // false to hide
  endContent?: string | HTMLElement | ((container: HTMLElement) => void) | any;
  id?: string;
  darkMode?: boolean;
  customStyle?: Partial<CSSStyleDeclaration>;
  maxVisibleToasts?: number;
  action?: {
    label: string | any;
    onClick: () => void;
  };
  onClose?: () => void;
  pauseOnHover?: boolean;
  promise?: Promise<any>;
  promiseMessages?: {
    loading: string | HTMLElement | any;
    success: string | HTMLElement | ((data: any) => string | HTMLElement) | any;
    error: string | HTMLElement | ((err: any) => string | HTMLElement) | any;
  };
}

export type ToastType = 'normal' | 'loading';

export interface ToastState extends ToastOptions {
  type: ToastType;
  createdAt: number;
  element?: HTMLElement;
}
