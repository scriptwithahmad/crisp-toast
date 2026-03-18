import { ToastOptions, ToastState } from '../types/index';
import { ToastManager } from './toast-manager';
import { icons } from '../utils/icons';

let toastIdCounter = 0;

export class Toast {
  private state: ToastState;
  private element: HTMLElement | null = null;
  private timer: number | null = null;
  private startTime: number = 0;
  private remainingTime: number = 0;
  private isPaused: boolean = false;
  
  /**
   * Optional global renderer for custom nodes (e.g. JSX)
   * If not set, Crisp Toast will attempt to render common objects (Virtual DOM) automatically.
   */
  public static renderer: ((node: any, container: HTMLElement) => void) | null = null;

  constructor(options: ToastOptions, type: ToastState['type'] = 'normal') {
    this.state = {
      ...options,
      type,
      id: options.id || `ct-${++toastIdCounter}`,
      createdAt: Date.now(),
      placement: options.placement || 'bottom-right',
      duration: options.duration ?? (type === 'loading' ? Infinity : 3000),
      variant: options.variant || 'flat',
      color: options.color || (type === 'loading' ? 'primary' : 'default'),
      radius: options.radius || 'md',
      progressBar: options.progressBar ?? false,
      darkMode: options.darkMode ?? true,
      pauseOnHover: options.pauseOnHover ?? false
    };
    this.remainingTime = this.state.duration!;
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

    if (this.state.pauseOnHover) {
      this.element.onmouseenter = () => this.pause();
      this.element.onmouseleave = () => this.resume();
    }

    const bodyWrapper = document.createElement('div');
    bodyWrapper.className = 'ct-body';

    if (this.state.icon !== false) {
      const iconWrapper = document.createElement('div');
      iconWrapper.className = 'ct-icon';
      if (this.state.icon instanceof HTMLElement) {
        iconWrapper.appendChild(this.state.icon);
      } else if (typeof this.state.icon === 'string') {
        iconWrapper.innerHTML = this.state.icon;
      } else if (this.state.icon && typeof this.state.icon === 'object') {
        this.renderContent(this.state.icon, iconWrapper);
      } else if (this.state.type === 'loading') {
        iconWrapper.innerHTML = icons.loading;
      } else {
        iconWrapper.innerHTML = icons[this.state.color as keyof typeof icons] || icons.default;
      }
      bodyWrapper.appendChild(iconWrapper);
    }

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'ct-content';
    
    if (this.state.title) {
      const titleEl = document.createElement('div');
      titleEl.className = 'ct-title';
      this.renderContent(this.state.title, titleEl);
      contentWrapper.appendChild(titleEl);
    }

    if (this.state.description) {
      const descEl = document.createElement('div');
      descEl.className = 'ct-description';
      this.renderContent(this.state.description, descEl);
      contentWrapper.appendChild(descEl);
    }
    
    if (this.state.title || this.state.description) {
      bodyWrapper.appendChild(contentWrapper);
    }

    const actionsWrapper = document.createElement('div');
    actionsWrapper.className = 'ct-actions';

    if (this.state.action) {
      const actionBtn = document.createElement('div'); 
      actionBtn.className = 'ct-action-wrapper';
      actionBtn.style.cursor = 'pointer';
      
      this.renderContent(this.state.action.label, actionBtn);
      
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

    bodyWrapper.appendChild(actionsWrapper);
    this.element.appendChild(bodyWrapper);

    if (this.state.endContent) {
      const endContentWrapper = document.createElement('div');
      endContentWrapper.className = 'ct-end-content';
      this.renderContent(this.state.endContent, endContentWrapper);
      this.element.appendChild(endContentWrapper);
    }

    // Progress bar
    if (this.state.progressBar && this.state.duration! > 0 && this.state.duration !== Infinity) {
      const progressEl = document.createElement('div');
      progressEl.className = 'ct-progress-bar';
      progressEl.style.animation = `ct-progress ${this.state.duration}ms linear forwards`;
      this.element.appendChild(progressEl);
    }

    ToastManager.addToast(this.state.placement!, this.element);

    this.startTime = Date.now();
    if (this.state.duration! > 0 && this.state.duration !== Infinity) {
      this.timer = window.setTimeout(() => this.dismiss(), this.state.duration);
    }

    if (this.state.promise) {
      this.handlePromise(this.state.promise);
    }
  }

  private renderContent(content: any, container: HTMLElement) {
    if (!content) return;

    if (typeof content === 'function') {
      content(container);
      return;
    }

    if (content instanceof HTMLElement) {
      container.appendChild(content);
      return;
    }

    if (typeof content === 'string' || typeof content === 'number') {
      const str = String(content);
      if (str.trim().startsWith('<') && str.trim().endsWith('>')) {
        container.innerHTML = str;
      } else {
        container.appendChild(document.createTextNode(str));
      }
      return;
    }

    if (Array.isArray(content)) {
      content.forEach(item => this.renderContent(item, container));
      return;
    }

    // Handle Virtual DOM / React Elements (JSX)
    if (content.type) {
      if (typeof content.type === 'string') {
        const el = document.createElement(content.type);
        const props = content.props || {};

        Object.entries(props).forEach(([key, value]: [string, any]) => {
          if (key === 'children') {
            this.renderContent(value, el);
          } else if (key === 'className' || key === 'class') {
            el.className = value;
          } else if (key === 'style' && typeof value === 'object') {
            Object.assign(el.style, value);
          } else if (key.startsWith('on') && typeof value === 'function') {
            const eventName = key.toLowerCase().substring(2);
            el.addEventListener(eventName, value);
          } else if (key !== 'key' && key !== 'ref') {
            el.setAttribute(key, typeof value === 'string' ? value : JSON.stringify(value));
          }
        });
        container.appendChild(el);
        return;
      }

      if (typeof content.type === 'function') {
        try {
          const result = content.type(content.props || {});
          this.renderContent(result, container);
          return;
        } catch (e) {
          // Fallback to custom renderer for complex components (hooks/classes)
        }
      }
    }

    if (Toast.renderer) {
      Toast.renderer(content, container);
    }
  }

  private pause() {
    if (this.isPaused || !this.timer) return;
    this.isPaused = true;
    this.remainingTime -= (Date.now() - this.startTime);
    clearTimeout(this.timer);
    if (this.element) {
      const progress = this.element.querySelector('.ct-progress-bar') as HTMLElement;
      if (progress) progress.style.animationPlayState = 'paused';
    }
  }

  private resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.startTime = Date.now();
    if (this.remainingTime > 0) {
      this.timer = window.setTimeout(() => this.dismiss(), this.remainingTime);
      if (this.element) {
        const progress = this.element.querySelector('.ct-progress-bar') as HTMLElement;
        if (progress) {
          progress.style.animationPlayState = 'running';
        }
      }
    }
  }

  private handlePromise(promise: Promise<any>) {
    promise
      .then((data) => {
        const successTitle = this.state.promiseMessages?.success 
          ? (typeof this.state.promiseMessages.success === 'function' ? this.state.promiseMessages.success(data) : this.state.promiseMessages.success)
          : 'Success';
        this.update({ type: 'normal', title: successTitle as any, color: 'success', duration: 3000 });
      })
      .catch((err) => {
        const errorTitle = this.state.promiseMessages?.error
          ? (typeof this.state.promiseMessages.error === 'function' ? this.state.promiseMessages.error(err) : this.state.promiseMessages.error)
          : 'Error';
        this.update({ type: 'normal', title: errorTitle as any, color: 'danger', duration: 3000 });
      });
  }

  public update(options: Partial<ToastOptions> & { type?: ToastState['type'] }) {
    if (!this.element) return;
    
    this.state = { ...this.state, ...options };
    this.element.className = this.buildClasses();
    
    const iconWrapper = this.element.querySelector('.ct-icon') as HTMLElement;
    if (iconWrapper) {
      if (this.state.icon !== false) {
        iconWrapper.innerHTML = '';
        if (this.state.icon instanceof HTMLElement) {
          iconWrapper.appendChild(this.state.icon);
        } else if (typeof this.state.icon === 'string') {
          iconWrapper.innerHTML = this.state.icon;
        } else if (this.state.icon && typeof this.state.icon === 'object') {
          this.renderContent(this.state.icon, iconWrapper);
        } else {
          iconWrapper.innerHTML = this.state.type === 'loading' 
            ? icons.loading 
            : (icons[this.state.color as keyof typeof icons] || icons.default);
        }
      } else {
        iconWrapper.innerHTML = '';
      }
    }

    const contentWrapper = this.element.querySelector('.ct-content') as HTMLElement;
    if (contentWrapper) {
      contentWrapper.innerHTML = '';
      if (this.state.title) {
        const titleEl = document.createElement('div');
        titleEl.className = 'ct-title';
        this.renderContent(this.state.title, titleEl);
        contentWrapper.appendChild(titleEl);
      }
      if (this.state.description) {
        const descEl = document.createElement('div');
        descEl.className = 'ct-description';
        this.renderContent(this.state.description, descEl);
        contentWrapper.appendChild(descEl);
      }
    }

    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.remainingTime = this.state.duration!;
    this.startTime = Date.now();
    if (this.state.duration! > 0 && this.state.duration !== Infinity) {
      this.timer = window.setTimeout(() => this.dismiss(), this.state.duration);
    }
  }

  private buildClasses() {
    const themeClass = this.state.darkMode ? 'ct-theme-dark' : 'ct-theme-light';
    const modeClass = this.state.darkMode ? 'dark' : 'light';
    const classes = ['ct-toast', themeClass, modeClass, `ct-${this.state.variant}`, `ct-color-${this.state.color}`, `ct-radius-${this.state.radius}`];
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
      this.element = null;
    };

    this.element.addEventListener('animationend', onAnimationEnd, { once: true });
    
    setTimeout(onAnimationEnd, 400); 
  }
}
