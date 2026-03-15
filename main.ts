import { toast } from './src/index';

const app = document.getElementById('app')!;

const createSection = (title: string, buttons: { label: string; onClick: () => void }[]) => {
  const section = document.createElement('div');
  section.innerHTML = `<h2>${title}</h2>`;
  const grid = document.createElement('div');
  grid.className = 'grid';
  
  buttons.forEach(({ label, onClick }) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.onclick = onClick;
    grid.appendChild(btn);
  });
  
  section.appendChild(grid);
  app.appendChild(section);
};

// Colors
createSection('Colors (Solid)', [
  { label: 'Default', onClick: () => toast({ title: 'Default Toast', description: 'This is the default style' }) },
  { label: 'Primary', onClick: () => toast({ title: 'Primary Toast', color: 'primary', description: 'Some description here' }) },
  { label: 'Secondary', onClick: () => toast({ title: 'Secondary Toast', color: 'secondary' }) },
  { label: 'Success', onClick: () => toast.success('Success Toast') },
  { label: 'Warning', onClick: () => toast.warning('Warning Toast') },
  { label: 'Danger', onClick: () => toast.error('Error Toast') },
]);

// Variants
createSection('Variants (Bordered)', [
  { label: 'Default', onClick: () => toast({ title: 'Bordered Default', variant: 'bordered' }) },
  { label: 'Primary', onClick: () => toast({ title: 'Bordered Primary', color: 'primary', variant: 'bordered' }) },
  { label: 'Success', onClick: () => toast({ title: 'Bordered Success', color: 'success', variant: 'bordered' }) },
  { label: 'Danger', onClick: () => toast({ title: 'Bordered Danger', color: 'danger', variant: 'bordered' }) },
]);

createSection('Variants (Flat)', [
  { label: 'Default', onClick: () => toast({ title: 'Flat Default', variant: 'flat' }) },
  { label: 'Primary', onClick: () => toast({ title: 'Flat Primary', color: 'primary', variant: 'flat' }) },
  { label: 'Success', onClick: () => toast({ title: 'Flat Success', color: 'success', variant: 'flat' }) },
  { label: 'Danger', onClick: () => toast({ title: 'Flat Danger', color: 'danger', variant: 'flat' }) },
]);

// Placements
createSection('Placements', [
  { label: 'Top Left', onClick: () => toast({ title: 'Top Left', placement: 'top-left' }) },
  { label: 'Top Center', onClick: () => toast({ title: 'Top Center', placement: 'top-center' }) },
  { label: 'Top Right', onClick: () => toast({ title: 'Top Right', placement: 'top-right' }) },
  { label: 'Bottom Left', onClick: () => toast({ title: 'Bottom Left', placement: 'bottom-left' }) },
  { label: 'Bottom Center', onClick: () => toast({ title: 'Bottom Center', placement: 'bottom-center' }) },
  { label: 'Bottom Right', onClick: () => toast({ title: 'Bottom Right', placement: 'bottom-right' }) },
]);

// Special Features
createSection('Features', [
  { label: 'With Action', onClick: () => toast({ title: 'Update available', description: 'A new version is ready', action: { label: 'Update', onClick: () => alert('Updating...') } }) },
  { label: 'Hidden Icon', onClick: () => toast({ title: 'No Icon Here', icon: false }) },
  { label: 'Custom Icon', onClick: () => toast({ title: 'Custom Icon', icon: '🚀' }) },
  { label: 'Promise', onClick: () => {
      const wait = new Promise((resolve, reject) => setTimeout(() => Math.random() > 0.5 ? resolve('Ok') : reject('Fail'), 2000));
      toast.promise(wait, { loading: 'Saving...', success: 'Saved successfully!', error: 'Could not save' });
  }},
]);

createSection('Advanced Layouts', [
  { 
    label: 'End Content (Stacked)', 
    onClick: () => toast({ 
      title: 'Storage Full', 
      description: 'You have reached 90% of your limit.',
      endContent: '<button style="width:100%; padding:8px; background:#2563eb; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold; margin-top:4px;">Upgrade Storage</button>'
    }) 
  },
  { 
    label: 'Pause on Hover (Enabled)', 
    onClick: () => toast({ 
      title: 'Hover Me!', 
      description: 'The progress bar will stop while your cursor is here.',
      pauseOnHover: true,
      duration: 10000,
      progressBar: true
    }) 
  },
  { 
    label: 'Pause on Hover (Disabled)', 
    onClick: () => toast({ 
      title: 'Default Behavior', 
      description: 'This will keep counting down even while hovering.',
      pauseOnHover: false,
      duration: 10000,
      progressBar: true
    }) 
  },
]);

