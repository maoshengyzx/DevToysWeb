import * as React from "react"
import { cn } from "@/lib/utils"

function SidebarProvider({
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar-wrapper
      className="flex size-full"
      {...props}
    >
      {children}
    </div>
  )
}

function Sidebar({
  className,
  children,
  ...props
}: React.ComponentProps<"aside">) {
  return (
    <aside
      data-sidebar
      className={cn(
        "flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground transition-colors duration-200",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
}

function SidebarContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar-content
      className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4", className)}
      {...props}
    />
  )
}

function SidebarGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar-group
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar-group-label
      className={cn(
        "flex h-7 shrink-0 items-center gap-2.5 px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/60 select-none",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar-group-content
      className={cn("ml-3 border-l border-sidebar-border pl-2 flex flex-col gap-0.5", className)}
      {...props}
    />
  )
}

function SidebarMenu({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-sidebar-menu
      className={cn("flex w-full min-w-0 flex-col gap-0.5", className)}
      {...props}
    />
  )
}

function SidebarMenuItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-sidebar-menu-item
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}

const sidebarMenuButtonVariants = {
  default: [
    "flex w-full items-center gap-3 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-colors duration-150",
    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
    "active:bg-sidebar-accent active:text-sidebar-accent-foreground",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&>span:last-child]:truncate",
    "[&>svg]:shrink-0",
  ],
  active: [
    "flex w-full items-center gap-3 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-colors duration-150",
    "bg-sidebar-primary text-sidebar-primary-foreground font-medium",
    "hover:bg-sidebar-primary/90",
    "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
  ],
}

function SidebarMenuButton({
  className,
  isActive,
  ...props
}: React.ComponentProps<"button"> & { isActive?: boolean }) {
  return (
    <button
      data-sidebar-menu-button
      data-active={isActive || undefined}
      className={cn(
        isActive ? sidebarMenuButtonVariants.active : sidebarMenuButtonVariants.default,
        "cursor-pointer",
        className
      )}
      {...props}
    />
  )
}

function SidebarHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar-header
      className={cn("flex items-center gap-2 px-4 py-3", className)}
      {...props}
    />
  )
}

function SidebarFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar-footer
      className={cn("flex items-center gap-2 px-4 py-3", className)}
      {...props}
    />
  )
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<"hr">) {
  return (
    <hr
      data-sidebar-separator
      className={cn("mx-2 my-2 border-sidebar-border/50", className)}
      {...props}
    />
  )
}

export {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
}