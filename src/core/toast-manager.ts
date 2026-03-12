import { ToastPlacement } from '../types/index';

export class ToastManager {
  private static containers = new Map<ToastPlacement, HTMLElement>();

  static getContainer(placement: ToastPlacement): HTMLElement {
    if (this.containers.has(placement)) {
      return this.containers.get(placement)!;
    }

    if (typeof document === 'undefined') {
      return {} as HTMLElement;
    }

    const container = document.createElement('div');
    container.classList.add('ct-container');
    container.classList.add(`ct-${placement}`);
    document.body.appendChild(container);
    this.containers.set(placement, container);
    return container;
  }

  static removeContainer(placement: ToastPlacement) {
    const container = this.containers.get(placement);
    if (container && container.childNodes.length === 0) {
      container.remove();
      this.containers.delete(placement);
    }
  }

  static addToast(placement: ToastPlacement, element: HTMLElement) {
    const container = this.getContainer(placement);
    
    // Prepend new toasts so they are visually front-most in DOM (if position absolute)
    container.prepend(element);

    // Give react time to mount, then calculate positions
    setTimeout(() => this.updatePositions(placement), 0);
  }

  static removeToast(placement: ToastPlacement, element: HTMLElement) {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
    
    this.updatePositions(placement);
    this.removeContainer(placement);
  }

  private static updatePositions(placement: ToastPlacement) {
    const container = this.containers.get(placement);
    if (!container) return;

    // Filter out leaving toasts and calculate their stacking
    const children = Array.from(container.children).filter(c => 
      c.classList.contains('ct-toast') && !c.classList.contains('ct-leave')
    ) as HTMLElement[];

    const isBottom = placement.includes('bottom');
    const offsetBase = 16;
    const scaleBase = 0.05;

    children.forEach((el, index) => {
      // index 0 is newest (prepended)
      const offset = isBottom ? -(index * offsetBase) : (index * offsetBase);
      const scale = 1 - (index * scaleBase);
      
      el.style.setProperty('--ct-y', `${offset}px`);
      el.style.setProperty('--ct-scale', `${scale}`);
      el.style.zIndex = `${9999 - index}`;

      // Hide toasts beyond the top 4
      if (index > 3) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
      } else {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
      }
    });

    // Handle leaving elements too
    const leaving = Array.from(container.children).filter(c => c.classList.contains('ct-leave')) as HTMLElement[];
    leaving.forEach(el => {
      // push them out a bit more so they animate nicely
      const currentY = parseFloat(el.style.getPropertyValue('--ct-y') || '0');
      el.style.setProperty('--ct-y', `${currentY + (isBottom ? 20 : -20)}px`);
      el.style.opacity = '0';
    });
  }
}
