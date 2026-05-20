import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Wrench,
  Search,
  Moon,
  Sun,
  ChevronRight,
  Star,
  Clock,
  PanelLeftClose,
  PanelLeft,
  X,
} from "lucide-react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toolCategories, getToolById } from "@/tools/registry"
import type { ToolDefinition } from "@/tools/registry"

const RECENT_KEY = "devtoysweb-recent"
const FAVORITES_KEY = "devtoysweb-favorites"

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

function addRecent(id: string) {
  const list = loadList(RECENT_KEY).filter((x) => x !== id)
  list.unshift(id)
  saveList(RECENT_KEY, list.slice(0, 5))
}

function WelcomePage({ onSelectTool }: { onSelectTool: (id: string) => void }) {
  const allTools = toolCategories.flatMap((cat) =>
    cat.tools.map((tool) => ({ ...tool, categoryTitle: cat.title, categoryIcon: cat.icon }))
  )
  return (
    <div className="flex h-full flex-col items-center justify-center px-8">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Wrench className="h-8 w-8 text-primary" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-foreground">
        Welcome to DevToysWeb
      </h1>
      <p className="mb-8 max-w-md text-center text-muted-foreground">
        A collection of developer tools at your fingertips. Click a tool below or
        use the sidebar to get started.
      </p>
      <div className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {allTools.map((tool) => {
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
}

function App() {
  const { toolId } = useParams()
  const navigate = useNavigate()
  const activeToolId = toolId ?? null
  const activeTool = activeToolId ? getToolById(activeToolId) : null

  const [search, setSearch] = useState("")
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set(loadList(FAVORITES_KEY)))
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    document.documentElement.classList.add("dark")
    return true
  })

  useEffect(() => {
    if (activeToolId) {
      addRecent(activeToolId)
    }
  }, [activeToolId])

  const handleSelectTool = (id: string) => {
    setMobileMenuOpen(false)
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

  const recentToolIds = loadList(RECENT_KEY)
  const recentTools = recentToolIds.map((id) => getToolById(id)).filter((t): t is ToolDefinition => t !== undefined)
  const favoriteTools = Array.from(favorites).map((id) => getToolById(id)).filter((t): t is ToolDefinition => t !== undefined)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className="flex h-screen">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-sidebar-border bg-sidebar-background transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:flex md:flex-col md:shrink-0 ${sidebarCollapsed ? "md:w-14" : "md:w-64"}`}
      >
        <SidebarProvider>
          <Sidebar className={sidebarCollapsed ? "w-14" : "w-64"}>
            <SidebarHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Wrench className="h-4 w-4" />
                </div>
                {!sidebarCollapsed && (
                  <span className="text-base font-semibold tracking-tight">
                    DevToysWeb
                  </span>
                )}
                <button
                  className="ml-auto md:hidden rounded-md p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </SidebarHeader>

            {!sidebarCollapsed && (
              <>
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
                <SidebarSeparator />
              </>
            )}

            <SidebarContent>
              {recentTools.length > 0 && !isSearching && !sidebarCollapsed && (
                <SidebarGroup>
                  <SidebarGroupLabel>
                    <Clock className="h-4 w-4" />
                    <span className="flex-1">Recent</span>
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {recentTools.map((tool) => {
                        const Icon = tool.icon
                        return (
                          <SidebarMenuItem key={tool.id}>
                            <SidebarMenuButton
                              isActive={activeToolId === tool.id}
                              onClick={() => handleSelectTool(tool.id)}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              <span className="text-xs">{tool.label}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                  <SidebarSeparator />
                </SidebarGroup>
              )}

              {favoriteTools.length > 0 && !isSearching && !sidebarCollapsed && (
                <SidebarGroup>
                  <SidebarGroupLabel>
                    <Star className="h-4 w-4" />
                    <span className="flex-1">Favorites</span>
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {favoriteTools.map((tool) => {
                        const Icon = tool.icon
                        return (
                          <SidebarMenuItem key={tool.id}>
                            <SidebarMenuButton
                              isActive={activeToolId === tool.id}
                              onClick={() => handleSelectTool(tool.id)}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              <span className="text-xs">{tool.label}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                  <SidebarSeparator />
                </SidebarGroup>
              )}

              {filteredCategories.map((category) => {
                const isExpanded = sidebarCollapsed || isSearching || expandedGroups.has(category.title)
                return (
                  <SidebarGroup key={category.title}>
                    <SidebarGroupLabel
                      className={`!h-6 !mt-2 ${!sidebarCollapsed ? "cursor-pointer" : ""}`}
                      onClick={() => !sidebarCollapsed && toggleGroup(category.title)}
                    >
                      {!sidebarCollapsed && <span className="flex-1">{category.title}</span>}
                      {!sidebarCollapsed && (
                        <ChevronRight
                          className={`h-3 w-3 shrink-0 text-muted-foreground/50 transition-transform duration-200 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      )}
                    </SidebarGroupLabel>
                    {isExpanded && (
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {category.tools.map((tool) => {
                            const Icon = tool.icon
                            return (
                              <SidebarMenuItem key={tool.id}>
                                <SidebarMenuButton
                                  isActive={activeToolId === tool.id}
                                  onClick={() => handleSelectTool(tool.id)}
                                  title={sidebarCollapsed ? tool.label : undefined}
                                  className="!gap-2.5 !pl-2"
                                >
                                  <Icon className="h-4 w-4 shrink-0" />
                                  {!sidebarCollapsed && <span className="flex-1 truncate text-[13px]">{tool.label}</span>}
                                  {!sidebarCollapsed && (
                                    <button
                                      className="ml-auto shrink-0 rounded-sm p-0.5 text-muted-foreground hover:text-primary transition-colors duration-150 cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toggleFavorite(tool.id)
                                      }}
                                      aria-label={favorites.has(tool.id) ? "Remove from favorites" : "Add to favorites"}
                                    >
                                      <Star
                                        className={`h-3 w-3 ${favorites.has(tool.id) ? "fill-primary text-primary" : ""}`}
                                      />
                                    </button>
                                  )}
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            )
                          })}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    )}
                  </SidebarGroup>
                )
              })}
            </SidebarContent>

            <SidebarFooter className="flex-col gap-1">
              <Button
                variant="ghost"
                size={sidebarCollapsed ? "icon" : "sm"}
                className={`${sidebarCollapsed ? "justify-center" : "w-full justify-start gap-2"} cursor-pointer hidden md:flex`}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                {!sidebarCollapsed && <span>Collapse</span>}
              </Button>
              <Button
                variant="ghost"
                size={sidebarCollapsed ? "icon" : "sm"}
                className={sidebarCollapsed ? "justify-center cursor-pointer" : "w-full justify-start gap-2 cursor-pointer"}
                onClick={toggleDarkMode}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {!sidebarCollapsed && (darkMode ? "Light Mode" : "Dark Mode")}
              </Button>
            </SidebarFooter>
          </Sidebar>
        </SidebarProvider>
      </aside>

      <main className="flex-1 overflow-auto bg-background">
        {!activeTool && (
          <div className="flex items-center gap-3 border-b border-border px-4 py-3 md:hidden">
            <button
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
            >
              <PanelLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold">DevToysWeb</span>
          </div>
        )}
        {activeTool ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3 md:px-6">
              <button
                className="md:hidden rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
                onClick={() => setMobileMenuOpen(true)}
              >
                <PanelLeft className="h-5 w-5" />
              </button>
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
          <WelcomePage onSelectTool={handleSelectTool} />
        )}
      </main>
    </div>
  )
}

export default App