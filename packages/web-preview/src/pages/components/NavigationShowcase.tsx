import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "synthex-ui/components";
import { ShowcaseSection } from "./ShowcaseSection";

export function NavigationShowcase() {
  return (
    <ShowcaseSection
      title="Navigation"
      description="Shared navigation language for app chrome, grouped menus, and paged docs flows."
      includes={["Breadcrumb", "Menubar", "NavigationMenu", "Pagination"]}
    >
      <div className="preview-section-stack">
        <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="#overview">Docs</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbEllipsis /></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Components</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
        <Menubar><MenubarMenu><MenubarTrigger>File</MenubarTrigger><MenubarContent><MenubarLabel>Project</MenubarLabel><MenubarItem>Open design</MenubarItem><MenubarSeparator /><MenubarItem>Export netlist</MenubarItem></MenubarContent></MenubarMenu><MenubarMenu><MenubarTrigger>View</MenubarTrigger><MenubarContent><MenubarItem>Inspector</MenubarItem><MenubarItem>Console</MenubarItem></MenubarContent></MenubarMenu></Menubar>
        <NavigationMenu defaultValue="guides">
          <NavigationMenuList>
            <NavigationMenuItem value="guides"><NavigationMenuTrigger>Guides</NavigationMenuTrigger></NavigationMenuItem>
            <NavigationMenuItem value="api"><NavigationMenuTrigger>API</NavigationMenuTrigger></NavigationMenuItem>
            <NavigationMenuLink href="#installation">Install</NavigationMenuLink>
          </NavigationMenuList>
          <NavigationMenuItem value="guides"><NavigationMenuContent>Package setup, theme configuration, and builder workflows.</NavigationMenuContent></NavigationMenuItem>
          <NavigationMenuItem value="api"><NavigationMenuContent>Public package entry points and support boundaries.</NavigationMenuContent></NavigationMenuItem>
        </NavigationMenu>
        <Pagination><PaginationContent><PaginationItem><PaginationPrevious /></PaginationItem><PaginationItem><PaginationLink isActive>1</PaginationLink></PaginationItem><PaginationItem><PaginationEllipsis /></PaginationItem><PaginationItem><PaginationLink>4</PaginationLink></PaginationItem><PaginationItem><PaginationNext /></PaginationItem></PaginationContent></Pagination>
      </div>
    </ShowcaseSection>
  );
}
