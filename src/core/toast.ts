import { ToastOptions, ToastState } from '../types/index';
import { ToastManager } from './toast-manager';
import { icons } from '../utils/icons';

let toastIdCounter = 0;

export class Toast {
  private state: ToastState;
  private element: HTMLElement | null = null;
  private timer: number | null = null;

  constructor(options: ToastOptions, type: ToastState['type'] = 'normal') {
    this.state = {
      ...options,
      type,
      id: options.id || `ct-${++toastIdCounter}`,
      createdAt: Date.now(),
      placement: options.placement || 'bottom-right',
      duration: options.duration ?? (type === 'loading' ? Infinity : 3000),
      variant: options.variant || 'bordered',
      color: options.color || (type === 'normal' ? 'default' : type === 'loading' ? 'primary' : type as any),
      radius: options.radius || 'md',
      progressBar: options.progressBar ?? false,
      darkMode: options.darkMode ?? true
    };
    if (typeof document !== 'undefined') {
      this.render();
    }
  }

  private render() {
    this.element = document.createElement('div');
    this.element.id = this.state.id!;
    this.element.className = this.buildClasses();
    
    if (this.state.customStyle) {
      Object.assign(this.element.style, this.state.customStyle);
    }

    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'ct-icon';
    if (this.state.icon !== false) {
      if (this.state.icon instanceof HTMLElement) {
        iconWrapper.appendChild(this.state.icon);
      } else if (typeof this.state.icon === 'string') {
        iconWrapper.innerHTML = this.state.icon;
      } else if (icons[this.state.type as keyof typeof icons] || icons[this.state.color as keyof typeof icons]) {
        iconWrapper.innerHTML = this.state.type === 'loading' 
          ? icons.loading 
          : (icons[this.state.color as keyof typeof icons] || icons.default);
      } else {
        iconWrapper.innerHTML = icons.default;
      }
      this.element.appendChild(iconWrapper);
    }

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'ct-content';
    
    if (this.state.title) {
      const titleEl = document.createElement('div');
      titleEl.className = 'ct-title';
      titleEl.textContent = this.state.title;
      contentWrapper.appendChild(titleEl);
    }

    if (this.state.description) {
      const descEl = document.createElement('div');
      descEl.className = 'ct-description';
      descEl.textContent = this.state.description;
      contentWrapper.appendChild(descEl);
    }
    
    if (this.state.title || this.state.description) {
      this.element.appendChild(contentWrapper);
    }

    if (this.state.endContent) {
      const endContentWrapper = document.createElement('div');
      endContentWrapper.className = 'ct-end-content';
      
      if (typeof this.state.endContent === 'function') {
        this.state.endContent(endContentWrapper);
      } else if (this.state.endContent instanceof HTMLElement) {
        endContentWrapper.appendChild(this.state.endContent);
      } else if (typeof this.state.endContent === 'string') {
        endContentWrapper.innerHTML = this.state.endContent;
      } else if (this.state.endContent) {
        // For mystery objects (like JSX elements), we check if a global renderer exists
        // or just let the caller handle it via the function type above.
        // If it's a React element and the user hasn't rendered it, we'll just show nothing
        // or a placeholder if we wanted to be helpful.
      }
      this.element.appendChild(endContentWrapper);
    }

    const actionsWrapper = document.createElement('div');
    actionsWrapper.className = 'ct-actions';

    if (this.state.action) {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'ct-action-btn';
      actionBtn.textContent = this.state.action.label;
      actionBtn.onclick = () => {
        this.state.action?.onClick();
        this.dismiss();
      };
      actionsWrapper.appendChild(actionBtn);
    }

    const closeBtn = document.createElement('button');
    closeBtn.className = 'ct-close';
    closeBtn.innerHTML = icons.close;
    closeBtn.onclick = () => this.dismiss();
    actionsWrapper.appendChild(closeBtn);

    this.element.appendChild(actionsWrapper);

    // Progress bar
    if (this.state.progressBar && this.state.duration! > 0 && this.state.duration !== Infinity) {
      const progressEl = document.createElement('div');
      progressEl.className = 'ct-progress-bar';
      progressEl.style.animation = `ct-progress ${this.state.duration}ms linear forwards`;
      this.element.appendChild(progressEl);
    }

    ToastManager.addToast(this.state.placement!, this.element);

    if (this.state.duration! > 0 && this.state.duration !== Infinity) {
      this.timer = window.setTimeout(() => this.dismiss(), this.state.duration);
    }

    if (this.state.promise) {
      this.handlePromise(this.state.promise);
    }
  }

  private handlePromise(promise: Promise<any>) {
    promise
      .then((data) => {
        const successTitle = this.state.promiseMessages?.success 
          ? (typeof this.state.promiseMessages.success === 'function' ? this.state.promiseMessages.success(data) : this.state.promiseMessages.success)
          : 'Success';
        this.update({ type: 'success', title: successTitle as string, color: 'success', duration: 3000 });
      })
      .catch((err) => {
        const errorTitle = this.state.promiseMessages?.error
          ? (typeof this.state.promiseMessages.error === 'function' ? this.state.promiseMessages.error(err) : this.state.promiseMessages.error)
          : 'Error';
        this.update({ type: 'error', title: errorTitle as string, color: 'danger', duration: 3000 });
      });
  }

  public update(options: Partial<ToastOptions> & { type?: ToastState['type'] }) {
    if (!this.element) return;
    
    this.state = { ...this.state, ...options };
    this.element.className = this.buildClasses();
    
    const iconWrapper = this.element.querySelector('.ct-icon');
    if (iconWrapper) {
      if (this.state.icon !== false) {
        if (this.state.icon instanceof HTMLElement) {
          iconWrapper.innerHTML = '';
          iconWrapper.appendChild(this.state.icon);
        } else if (typeof this.state.icon === 'string') {
          iconWrapper.innerHTML = this.state.icon;
        } else {
          iconWrapper.innerHTML = this.state.type === 'loading' 
            ? icons.loading 
            : (icons[this.state.color as keyof typeof icons] || icons.default);
        }
      } else {
        iconWrapper.innerHTML = '';
      }
    }

    const contentWrapper = this.element.querySelector('.ct-content');
    if (contentWrapper) {
      contentWrapper.innerHTML = '';
      if (this.state.title) {
        const titleEl = document.createElement('div');
        titleEl.className = 'ct-title';
        titleEl.textContent = typeof this.state.title === 'string' ? this.state.title : '';
        contentWrapper.appendChild(titleEl);
      }
      if (this.state.description) {
        const descEl = document.createElement('div');
        descEl.className = 'ct-description';
        descEl.textContent = this.state.description;
        contentWrapper.appendChild(descEl);
      }
    }

    if (this.timer) {
      clearTimeout(this.timer);
    }
    if (this.state.duration! > 0 && this.state.duration !== Infinity) {
      this.timer = window.setTimeout(() => this.dismiss(), this.state.duration);
    }
  }

  private buildClasses() {
    const themeClass = this.state.darkMode ? 'ct-theme-dark' : 'ct-theme-light';
    const classes = ['ct-toast', themeClass, `ct-${this.state.variant}`, `ct-color-${this.state.color}`, `ct-radius-${this.state.radius}`];
    return classes.join(' ');
  }

  public dismiss() {
    if (!this.element) return;
    
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.element.classList.add('ct-leave');
    
    const onAnimationEnd = () => {
      if (!this.element) return;
      ToastManager.removeToast(this.state.placement!, this.element);
      if (this.state.onClose) {
        this.state.onClose();
      }
    };

    this.element.addEventListener('animationend', onAnimationEnd, { once: true });
    
    setTimeout(onAnimationEnd, 400); 
  }
}
