import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Wrench,
  Search,
  Moon,
  Sun,
  ChevronRight,
  Star,
  LayoutGrid,
  Clock,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { toolCategories, getToolById } from "@/tools/registry"
import type { ToolDefinition } from "@/tools/registry"

const FAVORITES_KEY = "devtoysweb-favorites"
const THEME_KEY = "devtoysweb-theme"
const RECENT_KEY = "devtoysweb-recent"
const MAX_RECENT = 5

function loadList(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]")
  } catch {
    return []
  }
}

function saveList(key: string, list: string[]) {
  localStorage.setItem(key, JSON.stringify(list))
}

function getInitialDarkMode(): boolean {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === "dark") return true
  if (saved === "light") return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

function WelcomePage({
  onSelectTool,
  recentTools,
  searchState,
}: {
  onSelectTool: (id: string) => void
  recentTools: ToolDefinition[]
  searchState: [string, (s: string) => void]
}) {
  const [welcomeSearch, setWelcomeSearch] = searchState
  const isSearching = welcomeSearch.trim().length > 0

  const filteredCategories = toolCategories
    .map((cat) => ({
      ...cat,
      tools: isSearching
        ? cat.tools.filter((t) =>
            t.label.toLowerCase().includes(welcomeSearch.toLowerCase()) ||
            t.description.toLowerCase().includes(welcomeSearch.toLowerCase())
          )
        : cat.tools,
    }))
    .filter((cat) => cat.tools.length > 0)

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="flex flex-col items-center px-8 pt-12 pb-6">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Wrench className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Welcome to DevToysWeb
        </h1>
        <p className="mb-6 max-w-md text-center text-muted-foreground">
          A collection of developer tools at your fingertips. Search or browse below.
        </p>
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tools..."
            className="pl-9"
            value={welcomeSearch}
            onChange={(e) => setWelcomeSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 px-8 pb-8 space-y-8 max-w-4xl mx-auto">
        {!isSearching && recentTools.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Recent</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {recentTools.map((tool) => {
                const Icon = tool.icon
                return (
                  <button
                    key={tool.id}
                    className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card px-3 py-4 text-sm text-card-foreground transition-colors duration-150 hover:border-primary/40 hover:bg-accent cursor-pointer"
                    onClick={() => onSelectTool(tool.id)}
                  >
                    <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                    <span className="text-center leading-tight text-xs">{tool.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {filteredCategories.map((cat) => {
          const CatIcon = cat.icon
          return (
            <div key={cat.title}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <CatIcon className="h-4 w-4" />
                {cat.title}
                <span className="text-xs font-normal">({cat.tools.length})</span>
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {cat.tools.map((tool) => {
                  const Icon = tool.icon
                  return (
                    <button
                      key={tool.id}
                      className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card px-3 py-4 text-sm text-card-foreground transition-colors duration-150 hover:border-primary/40 hover:bg-accent cursor-pointer"
                      onClick={() => onSelectTool(tool.id)}
                    >
                      <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                      <span className="text-center leading-tight text-xs">{tool.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {isSearching && filteredCategories.length === 0 && (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            No tools found matching &quot;{welcomeSearch}&quot;
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  const { toolId } = useParams()
  const navigate = useNavigate()
  const activeToolId = toolId ?? null
  const activeTool = activeToolId ? getToolById(activeToolId) : null

  const [search, setSearch] = useState("")
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set(loadList(FAVORITES_KEY)))
  const [recent, setRecent] = useState<string[]>(() => {
    const saved = loadList(RECENT_KEY)
    if (activeToolId && !saved.includes(activeToolId)) {
      const next = [activeToolId, ...saved].slice(0, MAX_RECENT)
      saveList(RECENT_KEY, next)
      return next
    }
    return saved
  })
  const [recentCollapsed, setRecentCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const isDark = getInitialDarkMode()
    if (isDark) document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
    return isDark
  })

  const handleSelectTool = (id: string) => {
    setRecent((prev) => {
      const next = [id, ...prev.filter((r) => r !== id)].slice(0, MAX_RECENT)
      saveList(RECENT_KEY, next)
      return next
    })
    navigate(`/${id}`)
  }

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveList(FAVORITES_KEY, Array.from(next))
      return next
    })
  }

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  const isSearching = search.trim().length > 0

  const filteredCategories = toolCategories
    .map((category) => ({
      ...category,
      tools: isSearching
        ? category.tools.filter((tool) =>
            tool.label.toLowerCase().includes(search.toLowerCase()) ||
            tool.description.toLowerCase().includes(search.toLowerCase())
          )
        : category.tools,
    }))
    .filter((category) => category.tools.length > 0)

  const favoriteTools = Array.from(favorites).map((id) => getToolById(id)).filter((t): t is ToolDefinition => t !== undefined)
  const recentTools = recent.map((id) => getToolById(id)).filter((t): t is ToolDefinition => t !== undefined)

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev
      document.documentElement.classList.toggle("dark", next)
      localStorage.setItem(THEME_KEY, next ? "dark" : "light")
      return next
    })
  }

  return (
    <div className="flex h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Wrench className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold tracking-tight">DevToysWeb</span>
        </div>

        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tools..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <hr className="mx-2 my-2 border-sidebar-border/50" />

        <div className="sidebar-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
          {!isSearching && (
            <ul className="flex w-full min-w-0 flex-col gap-0.5">
              <li className="group/menu-item relative">
                <button
                  data-active={!activeToolId || undefined}
                  className={`flex w-full items-center gap-3 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-colors duration-150 cursor-pointer ${
                    !activeToolId
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium hover:bg-sidebar-primary/90"
                      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                  onClick={() => navigate("/")}
                >
                  <LayoutGrid className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">All Tools</span>
                </button>
              </li>
            </ul>
          )}
          <hr className="mx-0 my-1 border-sidebar-border/50" />

          {recentTools.length > 0 && !isSearching && (
            <div className="flex flex-col gap-1">
              <div
                className="flex h-7 shrink-0 items-center gap-2.5 px-3 text-[13px] font-semibold tracking-normal text-muted-foreground/70 select-none cursor-pointer"
                onClick={() => setRecentCollapsed((c) => !c)}
              >
                <Clock className="h-4 w-4" />
                <span className="flex-1">Recent</span>
                <ChevronRight className={`h-3 w-3 shrink-0 text-muted-foreground/50 transition-transform duration-200 ${recentCollapsed ? "" : "rotate-90"}`} />
              </div>
              {!recentCollapsed && (
                <div className="ml-3 border-l border-sidebar-border pl-2 flex flex-col gap-0.5">
                  <ul className="flex w-full min-w-0 flex-col gap-0.5">
                    {recentTools.map((tool) => {
                      const Icon = tool.icon
                      return (
                        <li key={tool.id} className="group/menu-item relative">
                          <button
                            className={`flex w-full items-center gap-3 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-colors duration-150 cursor-pointer ${
                              activeToolId === tool.id
                                ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium hover:bg-sidebar-primary/90"
                                : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            }`}
                            onClick={() => handleSelectTool(tool.id)}
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="text-xs">{tool.label}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
              <hr className="mx-0 my-1 border-sidebar-border/50" />
            </div>
          )}

          {favoriteTools.length > 0 && !isSearching && (
            <div className="flex flex-col gap-1">
              <div className="flex h-7 shrink-0 items-center gap-2.5 px-3 text-[13px] font-semibold tracking-normal text-muted-foreground/70 select-none">
                <Star className="h-4 w-4" />
                <span className="flex-1">Favorites</span>
              </div>
              <div className="ml-3 border-l border-sidebar-border pl-2 flex flex-col gap-0.5">
                <ul className="flex w-full min-w-0 flex-col gap-0.5">
                  {favoriteTools.map((tool) => {
                    const Icon = tool.icon
                    return (
                      <li key={tool.id} className="group/menu-item relative">
                        <button
                          className={`flex w-full items-center gap-3 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-colors duration-150 cursor-pointer ${
                            activeToolId === tool.id
                              ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium hover:bg-sidebar-primary/90"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }`}
                          onClick={() => handleSelectTool(tool.id)}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-xs">{tool.label}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
              <hr className="mx-0 my-1 border-sidebar-border/50" />
            </div>
          )}

          {filteredCategories.map((category) => {
            const isExpanded = isSearching || expandedGroups.has(category.title)
            return (
              <div key={category.title} className="flex flex-col gap-1">
                <div
                  className="flex h-7 shrink-0 items-center gap-2.5 px-3 mt-2 text-[13px] font-semibold tracking-normal text-muted-foreground/70 select-none cursor-pointer"
                  onClick={() => toggleGroup(category.title)}
                >
                  <span className="flex-1">{category.title}</span>
                  <ChevronRight
                    className={`h-3 w-3 shrink-0 text-muted-foreground/50 transition-transform duration-200 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </div>
                {isExpanded && (
                  <div className="ml-3 border-l border-sidebar-border pl-2 flex flex-col gap-0.5">
                    <ul className="flex w-full min-w-0 flex-col gap-0.5">
                      {category.tools.map((tool) => {
                        const Icon = tool.icon
                        return (
                          <li key={tool.id} className="group/menu-item relative">
                            <button
                              className="flex w-full items-center gap-2.5 overflow-hidden rounded-md p-2 pl-2 text-left text-sm outline-none transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
                              onClick={() => handleSelectTool(tool.id)}
                            >
                              <Icon className="h-3.5 w-3.5 shrink-0" />
                              <span className="flex-1 truncate text-[13px] font-medium">{tool.label}</span>
                              <span
                                role="button"
                                tabIndex={0}
                                className="ml-auto shrink-0 rounded-sm p-0.5 text-muted-foreground hover:text-primary transition-colors duration-150 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFavorite(tool.id)
                                }}
                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); toggleFavorite(tool.id) } }}
                                aria-label={favorites.has(tool.id) ? "Remove from favorites" : "Add to favorites"}
                              >
                                <Star
                                  className={`h-3 w-3 ${favorites.has(tool.id) ? "fill-primary text-primary" : ""}`}
                                />
</span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex flex-col gap-1 px-4 py-3">
          <button
            className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-150 cursor-pointer"
            onClick={toggleDarkMode}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-background">
        {activeTool ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3 md:px-6">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                {(() => {
                  const Icon = activeTool.icon
                  return <Icon className="h-4 w-4 text-primary" />
                })()}
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-semibold text-foreground truncate">{activeTool.label}</h1>
                <p className="hidden sm:block text-xs text-muted-foreground truncate">{activeTool.description}</p>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <activeTool.component />
            </div>
          </div>
        ) : (
          <WelcomePage onSelectTool={handleSelectTool} recentTools={recentTools} searchState={[search, setSearch]} />
        )}
      </main>
    </div>
  )
}

export default App