import { useSelector, useDispatch } from 'react-redux';
import { addWidget } from '@/store/widgetsSlice';

export default function DashboardBackup() {
  const widgets = useSelector(s => s.widgets.widgets);
  const dispatch = useDispatch();

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(widgets)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'dashboard.json';
    a.click();
  };

  const importConfig = e => {
    const file = e.target.files[0];
    file.text().then(text => {
      JSON.parse(text).forEach(w => dispatch(addWidget(w)));
    });
  };

  return (
    <>
      <button onClick={exportConfig}>Export</button>
      <input type="file" onChange={importConfig} />
    </>
  );
}
