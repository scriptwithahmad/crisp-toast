import { ToastPlacement } from '../types/index';

export class ToastManager {
  private static containers = new Map<ToastPlacement, HTMLElement>();
  public static maxVisibleToasts = 5;

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
    container.style.transition = 'all 400ms var(--ct-easing)';
    
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
    container.prepend(element);
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

    const children = Array.from(container.children).filter(c => 
      c.classList.contains('ct-toast') && !c.classList.contains('ct-leave')
    ) as HTMLElement[];

    const isBottom = placement.includes('bottom');
    const stackOffset = 10;
    
    // Limit visible stack depth
    const visibleChildren = children.slice(0, Math.max(1, ToastManager.maxVisibleToasts)); 
    const hiddenChildren = children.slice(Math.max(1, ToastManager.maxVisibleToasts));

    requestAnimationFrame(() => {
      visibleChildren.forEach((el, index) => {
        let offset = 0;
        let scale = 1;
        let pointerEvents = 'none';
        let opacity = 1;

        // Overlap stacking
        offset = isBottom ? -(index * stackOffset) : (index * stackOffset);
        scale = 1 - (index * 0.05);
        pointerEvents = index === 0 ? 'auto' : 'none';
        opacity = Math.max(0, 1 - (index * 0.12));
        
        el.style.setProperty('--ct-y', `${offset}px`);
        el.style.setProperty('--ct-scale', `${scale}`);
        el.style.zIndex = `${10000 - index}`;
        el.style.opacity = `${opacity}`;
        el.style.pointerEvents = pointerEvents;

        // Depth effect
        if (index > 0) {
          el.style.filter = `brightness(${1 - index * 0.05})`;
          el.style.boxShadow = `0 ${2 + index * 4}px ${10 + index * 5}px rgba(0,0,0,0.15)`;
        } else {
          el.style.filter = 'none';
          el.style.boxShadow = '';
        }
      });

      // Hide children beyond limit
      hiddenChildren.forEach(el => {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        el.style.setProperty('--ct-scale', '0.7');
      });
    });

    // Handle leaving elements
    const leaving = Array.from(container.children).filter(c => c.classList.contains('ct-leave')) as HTMLElement[];
    leaving.forEach(el => {
      const currentY = parseFloat(el.style.getPropertyValue('--ct-y') || '0');
      // For leaving elements, we move them slightly outside and fade out
      el.style.transition = 'all 400ms var(--ct-easing)';
      el.style.setProperty('--ct-y', `${currentY + (isBottom ? 20 : -20)}px`);
      el.style.setProperty('--ct-scale', '0.9');
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
    });
  }
}
