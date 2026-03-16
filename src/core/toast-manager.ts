import { ToastPlacement } from '../types/index';

export class ToastManager {
  private static containers = new Map<ToastPlacement, HTMLElement>();
  private static queues = new Map<ToastPlacement, HTMLElement[]>();
  private static MAX_VISIBLE = 5;

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
    this.queues.set(placement, []);
    return container;
  }

  static removeContainer(placement: ToastPlacement) {
    const container = this.containers.get(placement);
    if (container && container.childNodes.length === 0) {
      container.remove();
      this.containers.delete(placement);
      this.queues.delete(placement);
    }
  }

  static addToast(placement: ToastPlacement, element: HTMLElement) {
    const container = this.getContainer(placement);
    const queue = this.queues.get(placement)!;
    
    // Check how many active (non-leaving) toasts we have
    const activeCount = Array.from(container.children).filter(c => 
      c.classList.contains('ct-toast') && !c.classList.contains('ct-leave')
    ).length;

    if (activeCount < this.MAX_VISIBLE) {
      container.prepend(element);
      setTimeout(() => this.updatePositions(placement), 0);
    } else {
      queue.push(element);
    }
  }

  static removeToast(placement: ToastPlacement, element: HTMLElement) {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
    
    const container = this.containers.get(placement);
    const queue = this.queues.get(placement);

    if (container && queue && queue.length > 0) {
      const nextToast = queue.shift()!;
      container.prepend(nextToast);
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
    const stackOffset = 10; // Tighter stacking
    const scaleBase = 0.04;
    const opacityBase = 0.12;
    
    // Limit visible stack depth to match the requested look
    const visibleChildren = children.slice(0, 8); 
    const hiddenChildren = children.slice(8);

    requestAnimationFrame(() => {
      visibleChildren.forEach((el, index) => {
        // Always use stacked view (multi-overlap)
        const offset = isBottom ? -(index * stackOffset) : (index * stackOffset);
        const scale = 1 - (index * scaleBase);
        const opacity = Math.max(0, 1 - (index * opacityBase));
        
        el.style.setProperty('--ct-y', `${offset}px`);
        el.style.setProperty('--ct-scale', `${scale}`);
        el.style.zIndex = `${10000 - index}`;
        el.style.opacity = `${opacity}`;
        el.style.pointerEvents = index === 0 ? 'auto' : 'none';

        // Depth effect
        if (index > 0) {
          el.style.filter = `brightness(${1 - index * 0.08}) contrast(${1 + index * 0.02})`;
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
