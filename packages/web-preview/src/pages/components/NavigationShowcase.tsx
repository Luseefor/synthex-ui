import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
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
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "synthex-ui/components";

export function NavigationShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Navigation</CardTitle>
        <CardDescription>Shared navigation language for app chrome, grouped menus, and simple paging.</CardDescription>
      </CardHeader>
      <CardContent className="preview-section-stack">
        <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="#overview">Docs</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Components</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
        <Menubar><MenubarMenu><MenubarTrigger>File</MenubarTrigger><MenubarContent><MenubarItem>Open design</MenubarItem><MenubarItem>Export netlist</MenubarItem></MenubarContent></MenubarMenu><MenubarMenu><MenubarTrigger>View</MenubarTrigger><MenubarContent><MenubarItem>Inspector</MenubarItem><MenubarItem>Console</MenubarItem></MenubarContent></MenubarMenu></Menubar>
        <NavigationMenu defaultValue="guides">
          <NavigationMenuList>
            <NavigationMenuItem value="guides"><NavigationMenuTrigger>Guides</NavigationMenuTrigger></NavigationMenuItem>
            <NavigationMenuItem value="api"><NavigationMenuTrigger>API</NavigationMenuTrigger></NavigationMenuItem>
            <NavigationMenuLink href="#installation">Install</NavigationMenuLink>
          </NavigationMenuList>
          <NavigationMenuItem value="guides"><NavigationMenuContent>Package setup, theme configuration, and builder workflows.</NavigationMenuContent></NavigationMenuItem>
          <NavigationMenuItem value="api"><NavigationMenuContent>Public package entry points and support boundaries.</NavigationMenuContent></NavigationMenuItem>
        </NavigationMenu>
        <Pagination><PaginationContent><PaginationItem><PaginationPrevious /></PaginationItem><PaginationItem><PaginationLink isActive>1</PaginationLink></PaginationItem><PaginationItem><PaginationLink>2</PaginationLink></PaginationItem><PaginationItem><PaginationNext /></PaginationItem></PaginationContent></Pagination>
      </CardContent>
    </Card>
  );
}
