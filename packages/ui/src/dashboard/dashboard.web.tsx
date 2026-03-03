import * as React from "react";
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "../components/index.web";
import { SearchIcon } from "../icons/index.web";
import { H2 } from "../typography/typography.web";
import type { DashboardViewProps } from "./dashboard.shared";

export function DashboardView({
    metrics,
    updates,
    chartData,
    searchValue,
    onSearchChange,
    componentResults = [],
    onDocumentationClick,
    onRepositoryClick,
}: DashboardViewProps) {
    const hasSearch = searchValue.length > 0;

    return (
        <div className="flex flex-col w-full min-h-full bg-background">
            {/* Top Navigation Bar */}
            <header className="flex h-16 items-center px-6 border-b border-border/50 bg-surface/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="font-semibold text-lg tracking-tight mr-8 text-foreground">
                    Synthex UI
                </div>
                <div className="flex items-center space-x-4 flex-1">
                    <div className="relative w-96">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                        <Input
                            placeholder="Search components, tokens, or hooks..."
                            className="pl-9 h-9 bg-surface/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-full"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" className="hidden md:flex h-9 border-border/50 glass-premium">
                        <span className="mr-2 opacity-50">v1.0.4</span> Latest Release
                    </Button>
                    <Button variant="default" size="sm" className="h-9 shadow-sm shadow-primary/20" onClick={onDocumentationClick}>
                        View Documentation
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-8 pt-6 space-y-8 overflow-y-auto">
                <div className="flex items-center justify-between space-y-2">
                    <H2 className="text-3xl font-bold tracking-tight border-none m-0">
                        {hasSearch ? "Search Results" : "Dashboard"}
                    </H2>
                </div>

                {/* Component Results Section (Only if searching) */}
                {hasSearch && componentResults.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground-muted">Matching Components</h3>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {componentResults.map((comp, i) => (
                                <Card key={i} className="glass-premium border-border/50 hover-premium group cursor-pointer overflow-hidden">
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-base group-hover:text-primary transition-colors">{comp.name}</CardTitle>
                                        <CardDescription className="text-xs line-clamp-1">{comp.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {/* Metrics Grid */}
                {(!hasSearch || (metrics.length > 0)) && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {metrics.map((metric, i) => (
                            <Card key={i} className="glass-premium border-border/50 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors" />
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground-muted">{metric.label}</CardTitle>
                                    <span className="text-foreground-muted grayscale group-hover:grayscale-0 transition-all">{metric.icon}</span>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{metric.value}</div>
                                    {metric.description && (
                                        <p className="text-xs text-foreground-muted mt-1">
                                            {metric.trend && (
                                                <span className={metric.trend.type === "positive" ? "text-emerald-500 font-medium mr-1" : "text-rose-500 font-medium mr-1"}>
                                                    {metric.trend.value}
                                                </span>
                                            )}
                                            {metric.description}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Charts and Tables */}
                {!hasSearch && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4 glass-premium border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle>Usage Overview</CardTitle>
                                <CardDescription>Monthly NPM downloads over the current year.</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[300px] w-full flex items-end justify-between px-4 pb-4 mt-4 gap-2">
                                    {chartData.map((data) => (
                                        <div key={data.month} className="flex flex-col items-center justify-end w-full group">
                                            <div
                                                className="w-full bg-primary/20 rounded-t-sm transition-all duration-300 group-hover:bg-primary group-hover:shadow-[0_0_15px_rgba(var(--sx-primary-rgb),0.3)]"
                                                style={{ height: `${data.value}%` }}
                                            />
                                            <span className="text-[10px] text-foreground-muted mt-2 font-medium opacity-50 group-hover:opacity-100">{data.month}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-3 glass-premium border-border/50 shadow-sm overflow-hidden flex flex-col">
                            <CardHeader className="flex flex-row items-center">
                                <div className="grid gap-1">
                                    <CardTitle>Recent Updates</CardTitle>
                                    <CardDescription>
                                        Latest commits and merges to the main branch.
                                    </CardDescription>
                                </div>
                                <Button size="sm" variant="outline" className="ml-auto gap-1 border-border/50 bg-surface/50 hidden lg:flex" onClick={onRepositoryClick}>
                                    View Repository
                                </Button>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-auto p-0 px-6">
                                <Table>
                                    <TableBody>
                                        {updates.map((update, i) => (
                                            <TableRow key={i} className="border-border/30 hover:bg-surface-muted/30 transition-colors group">
                                                <TableCell className="w-[50px] py-4">
                                                    <div className="h-9 w-9 rounded-full bg-surface-muted flex items-center justify-center border border-border/50 text-xs font-semibold group-hover:border-primary/50 transition-colors">
                                                        {update.initials}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="font-medium group-hover:text-primary transition-colors">{update.title}</div>
                                                    <div className="text-sm text-foreground-muted">by @{update.user}</div>
                                                </TableCell>
                                                <TableCell className="text-right text-sm text-foreground-muted py-4 opacity-70">
                                                    {update.time}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Updates (if searching and matching) */}
                {hasSearch && updates.length > 0 && (
                    <Card className="glass-premium border-border/50 shadow-sm overflow-hidden flex flex-col mt-8">
                        <CardHeader className="flex flex-row items-center border-b border-border/30 bg-surface-muted/10">
                            <CardTitle className="text-base">Matching Updates</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableBody>
                                    {updates.map((update, i) => (
                                        <TableRow key={i} className="border-border/30 hover:bg-surface-muted/30 transition-colors group">
                                            <TableCell className="w-[50px] py-4 px-6">
                                                <div className="h-9 w-9 rounded-full bg-surface-muted flex items-center justify-center border border-border/50 text-xs font-semibold group-hover:border-primary/50 transition-colors">
                                                    {update.initials}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="font-medium group-hover:text-primary transition-colors">{update.title}</div>
                                                <div className="text-sm text-foreground-muted">by @{update.user}</div>
                                            </TableCell>
                                            <TableCell className="text-right text-sm text-foreground-muted py-4 px-6 opacity-70">
                                                {update.time}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {hasSearch && componentResults.length === 0 && metrics.length === 0 && updates.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="h-12 w-12 rounded-full bg-surface-muted flex items-center justify-center">
                            <SearchIcon className="h-6 w-6 text-foreground-muted opacity-50" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold">No results found</h3>
                            <p className="text-foreground-muted max-w-sm">No components, metrics, or updates matched your search for "{searchValue}".</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => onSearchChange("")}>Clear Search</Button>
                    </div>
                )}
            </main>
        </div>
    );
}
