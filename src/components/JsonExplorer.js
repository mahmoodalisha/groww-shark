// Dynamic API response mapping
// Unknown API supported
export default function JsonExplorer({ data, selected, onToggle, path = [] }) {
  if (typeof data !== 'object' || data === null) return null;

  return (
    <div className="ml-4 border-l border-gray-700 pl-3 text-sm">
      {Object.entries(data).map(([key, value]) => {
        const currentPath = [...path, key];
        const isPrimitive = typeof value !== 'object' || value === null;

        return (
          <div key={currentPath.join('|')} className="mb-1">
            <label className="flex items-center gap-2">
              {isPrimitive && (
                <input
                  type="checkbox"
                  checked={selected.some(
                    f => JSON.stringify(f.path) === JSON.stringify(currentPath)
                  )}
                  onChange={() => onToggle(currentPath)}
                />
              )}
              <span className="text-gray-300">{key}</span>
            </label>

            {!isPrimitive && (
              <JsonExplorer
                data={value}
                selected={selected}
                onToggle={onToggle}
                path={currentPath}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
