import { CATEGORIES, COMPONENTS } from "./catalog";

interface ComponentSidebarProps {
  readonly search: string;
  readonly collapsed: Record<string, boolean>;
  readonly onSearch: (value: string) => void;
  readonly onToggle: (category: string) => void;
  readonly onInsert?: (type: string) => void;
}

export function ComponentSidebar({ search, collapsed, onSearch, onToggle, onInsert }: ComponentSidebarProps) {
  const filtered = COMPONENTS.filter((component) => !search.trim() || `${component.label} ${component.category}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <aside className="bld-s bld-sl">
      <div className="bld-sh">Components</div>
      <div className="bld-ss">
        <input className="bld-search" placeholder="Search components..." value={search} onChange={(e) => onSearch(e.target.value)} />
        {CATEGORIES.map((category) => {
          const items = filtered.filter((component) => component.category === category);
          if (!items.length) return null;
          const isCollapsed = Boolean(collapsed[category]);
          return <div key={category} className="bld-cg"><button className="bld-ch" onClick={() => onToggle(category)}><span className="bld-ca">{isCollapsed ? "▸" : "▾"}</span>{category}<span className="bld-cc">{items.length}</span></button>{!isCollapsed && <div className="bld-cl">{items.map((component) => <button key={component.type} type="button" draggable className="bld-di" onClick={() => onInsert?.(component.type)} onDragStart={(e) => { e.dataTransfer.setData("sx/type", component.type); e.dataTransfer.effectAllowed = "copy"; }}><span className="bld-dic">{component.icon}</span><span>{component.label}</span></button>)}</div>}</div>;
        })}
      </div>
    </aside>
  );
}
