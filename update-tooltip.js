const fs = require('fs');
const file = '/Users/edl07/Desktop/EDL/meeting_notice/frontend/components/users/UserManagement.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add TableTooltip component after imports
const tooltipComp = `
function TableTooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top });
    setShow(true);
  };

  return (
    <>
      <div 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={() => setShow(false)}
        className="w-full"
      >
        {children}
      </div>
      {show && text && text !== "-" && (
        <div 
          className="fixed z-[9999] pointer-events-none -translate-x-1/2 -translate-y-full bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 text-xs py-1.5 px-3 rounded-lg shadow-2xl whitespace-nowrap transition-opacity"
          style={{ left: pos.x, top: pos.y - 6 }}
        >
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800 dark:border-t-gray-100"></div>
        </div>
      )}
    </>
  );
}
`;

content = content.replace('const ROWS_PER_PAGE = 6;', tooltipComp + '\nconst ROWS_PER_PAGE = 6;');

// Replace the span tooltips with TableTooltip

// For empCode
content = content.replace(
  /<span\s+className="block text-sm font-medium max-w-\[80px\] xl:max-w-\[100px\] truncate"\s+style=\{\{ color: "rgb\(var\(--text-primary\)\)" \}\}\s+title=\{getValue\(\) as string\}\s*>\s*\{getValue\(\) as string\}\s*<\/span>/g,
  `<TableTooltip text={getValue() as string}>\n            <span className="block text-sm font-medium max-w-[80px] xl:max-w-[100px] truncate" style={{ color: "rgb(var(--text-primary))" }}>\n              {getValue() as string}\n            </span>\n          </TableTooltip>`
);

// For other secondary text columns
const colsToReplace = [
  { w: "90px", xl: "120px" },   // tel
  { w: "100px", xl: "140px" },  // position
  { w: "120px", xl: "150px" },  // department, division, office, unit
];

for (const w of colsToReplace) {
  const regex = new RegExp(
    `<span\\s+className="block text-sm max-w-\\[${w.w}\\] xl:max-w-\\[${w.xl}\\] truncate"\\s+style=\\{\\{ color: "rgb\\(var\\(--text-secondary\\)\\)" \\}\\}\\s+title=\\{getValue\\(\\) as string\\}\\s*>\\s*\\{getValue\\(\\) as string\\}\\s*<\\/span>`, 'g'
  );
  content = content.replace(regex, 
    `<TableTooltip text={getValue() as string}>\n            <span className="block text-sm max-w-[${w.w}] xl:max-w-[${w.xl}] truncate" style={{ color: "rgb(var(--text-secondary))" }}>\n              {getValue() as string}\n            </span>\n          </TableTooltip>`
  );
}

// For Name and Email
content = content.replace(
  /<div\s+className="text-sm font-semibold truncate block"\s+style=\{\{ color: "rgb\(var\(--text-primary\)\)" \}\}\s+title=\{user\.name\}\s*>\s*\{user\.name\}\s*<\/div>/g,
  `<TableTooltip text={user.name}>\n                  <div className="text-sm font-semibold truncate block" style={{ color: "rgb(var(--text-primary))" }}>\n                    {user.name}\n                  </div>\n                </TableTooltip>`
);

content = content.replace(
  /<div\s+className="text-xs truncate block"\s+style=\{\{ color: "rgb\(var\(--text-secondary\)\)" \}\}\s+title=\{user\.email\}\s*>\s*\{user\.email\}\s*<\/div>/g,
  `<TableTooltip text={user.email}>\n                  <div className="text-xs truncate block" style={{ color: "rgb(var(--text-secondary))" }}>\n                    {user.email}\n                  </div>\n                </TableTooltip>`
);

fs.writeFileSync(file, content);
console.log("Replaced tooltips!");
